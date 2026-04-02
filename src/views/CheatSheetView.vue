<script setup lang="ts">
import { computed, ref } from 'vue';
import FateHeader from '../components/shared/FateHeader.vue';
import { useGMModeStore } from '../stores/gmMode';
import { CHECK_LADDER } from '../types';

const ACTION_MATRIX = [
  {
    action: 'Überwinden',
    icon: '🧗',
    fail: 'Misserfolg (oder große Kosten)',
    tie: 'Erfolg gegen kleine Kosten',
    success: 'Erfolg',
    style: 'Erfolg + Boost',
  },
  {
    action: 'Vorteil verschaffen',
    icon: '✨',
    fail: 'Kein Aspekt (oder Aspekt für Gegner)',
    tie: 'Boost statt Situationsaspekt',
    success: 'Situationsaspekt (1x kostenlos)',
    style: 'Situationsaspekt (2x kostenlos)',
  },
  {
    action: 'Angriff',
    icon: '⚔️',
    fail: 'Kein Schaden',
    tie: 'Boost',
    success: 'Schaden = Shifts',
    style: '+ optional: 1 Shift in Boost umwandeln',
  },
  {
    action: 'Verteidigung',
    icon: '🛡️',
    fail: 'Erleiden des gegen einen gerichteten Erfolgs',
    tie: 'Gegner bekommt Boost',
    success: 'Schaden/Aspekt vermieden',
    style: 'Schaden/Aspekt vermieden + Boost',
  },
] as const;

const gmModeStore = useGMModeStore();

const ACTION_HEADERS = [
  'Aktion',
  'Fehlschlag (<0)',
  'Gleichstand (0)',
  'Erfolg (1-2)',
  'Erfolg mit Stil (3+)',
] as const;

const ACTION_OUTCOMES = [
  { key: 'fail', label: 'Fehlschlag' },
  { key: 'tie', label: 'Gleichstand' },
  { key: 'success', label: 'Erfolg' },
  { key: 'style', label: 'Erfolg mit Stil' },
] as const;

const VALUE_TOKEN_REGEX = /(?:[+-]\d+|\d+\+|\d+-\d+|<\d+)/g;
const BOOST_TOKEN_REGEX = /boost/gi;

const tokenizeHighlight = (text: string) => {
  const tokens: Array<{ text: string; type: 'boost' | 'value' | 'plain' }> = [];
  const matcher = new RegExp(`${BOOST_TOKEN_REGEX.source}|${VALUE_TOKEN_REGEX.source}`, 'gi');
  let lastIndex = 0;

  for (const match of text.matchAll(matcher)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, index), type: 'plain' });
    }

    const matchedText = match[0];
    if (matchedText.toLowerCase() === 'boost') {
      tokens.push({ text: matchedText, type: 'boost' });
    } else {
      tokens.push({ text: matchedText, type: 'value' });
    }

    lastIndex = index + matchedText.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex), type: 'plain' });
  }

  return tokens;
};

const RULE_CARDS: { area: string; title?: string; lines: string[] }[] = [
  {
    area: 'actions',
    title: '4 Aktionen',
    lines: [],
  },
  {
    area: 'challenges',
    title: 'Challenges',
    lines: [
      'Herausforderung = mehrere Überwinden-Aktionen für eine komplexe Szene.',
      'Jede Teilaufgabe nutzt eine andere Fertigkeit; Ergebnisse am Ende gemeinsam auswerten.',
    ],
  },
  {
    area: 'contests',
    title: 'Wettstreite',
    lines: [
      'Wettstreit = mehrere Austausche ohne direkten Schaden bei gegensätzlichen Zielen.',
      'Pro Austausch 1 Wurf; wer zuerst 3 Siege hat, gewinnt den Wettstreit.',
    ],
  },
  {
    area: 'milestones',
    title: 'Meilensteine',
    lines: [
      'Minor (meist Sitzungsende): 1 kleine Änderung, z. B. Stunt tauschen oder Aspekte umbenennen.',
      'Significant (Szenarioende): Minor + 1 Fertigkeitspunkt und schwere Konsequenzen umbenennen.',
      'Major (Story-Arc-Ende): Significant + 1 Refresh, extremes umbenennen, High Concept/Skill-Cap anpassen.',
    ],
  },
  {
    area: 'chances',
    lines: [],
  },
  {
    area: 'scene-setup',
    title: 'Szenen-Setup-Checkliste',
    lines: [
      'Was steht auf dem Spiel?',
      'Welche 2-3 Situationsaspekte gibt es?',
      'Wie sind die Zonen aufgeteilt?',
      'Wer steht wem gegenüber?',
      'Ist das ein Konflikt, eine Herausforderung oder nur ein einzelner Wurf?',
    ],
  },
] as const;

const actionsCardTitle = computed(
  () => RULE_CARDS.find((card) => card.area === 'actions')?.title ?? '4 Aktionen',
);
const visibleRuleCards = computed(() => RULE_CARDS.filter((card) => card.area !== 'actions'));

const CHANCES_TABLE = [
  { result: '0', chance: '23,46 %' },
  { result: '+/-1', chance: '19,75 %' },
  { result: '+/-2', chance: '12,35 %' },
  { result: '+/-3', chance: '4,94 %' },
  { result: '+/-4', chance: '1,23 %' },
] as const;

const openAction = ref<string | null>(ACTION_MATRIX[0]?.action ?? null);

const getActionPanelId = (action: string) =>
  `action-panel-${action
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/\s+/g, '-')}`;

const toggleAction = (action: string) => {
  openAction.value = openAction.value === action ? null : action;
};

const splitMilestoneLine = (line: string) => {
  const match = line.match(/^([^:]+):\s*(.*)$/);
  if (!match) {
    return { title: line, detail: '' };
  }
  return { title: match[1], detail: match[2] };
};
</script>

<template>
  <div class="cheat-sheet-view">
    <FateHeader title="Cheat Sheet" />

    <div v-if="gmModeStore.isGMMode" class="cheat-sheet-page">
      <div class="sheet-content">
        <section class="cheat-grid" aria-label="Fate cheat sheet">
          <article class="cheat-card cheat-card-ladder" aria-labelledby="check-ladder-heading">
            <div class="ladder-grid" role="table" aria-label="Stufenleiter für Proben">
              <div class="ladder-head" role="row">
                <span role="columnheader">Wert</span>
                <span role="columnheader">Bezeichnung</span>
              </div>

              <div v-for="entry in CHECK_LADDER" :key="entry.value" class="ladder-row" role="row">
                <span class="ladder-value" role="cell">{{ entry.value }}</span>
                <span role="cell">{{ entry.label }}</span>
              </div>
            </div>
          </article>

          <article class="cheat-card cheat-card-actions" aria-labelledby="actions-heading">
            <div class="card-heading card-heading-compact">
              <h2 id="actions-heading">{{ actionsCardTitle }}</h2>
            </div>

            <div class="table-wrap">
              <table class="action-table">
                <thead>
                  <tr>
                    <th v-for="header in ACTION_HEADERS" :key="header" scope="col">
                      <span
                        v-for="(part, index) in tokenizeHighlight(header)"
                        :key="`${header}-${index}`"
                        :class="{
                          'token-boost': part.type === 'boost',
                          'token-value': part.type === 'value',
                        }"
                      >
                        {{ part.text }}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in ACTION_MATRIX" :key="row.action">
                    <th scope="row">
                      <span class="action-label">
                        <span
                          v-for="(part, index) in tokenizeHighlight(row.action)"
                          :key="`${row.action}-${index}`"
                          :class="{
                            'token-boost': part.type === 'boost',
                            'token-value': part.type === 'value',
                          }"
                        >
                          {{ part.text }}
                        </span>
                        <span class="action-label-emoji" aria-hidden="true">{{ row.icon }}</span>
                      </span>
                    </th>
                    <td>
                      <span
                        v-for="(part, index) in tokenizeHighlight(row.fail)"
                        :key="`${row.action}-fail-${index}`"
                        :class="{
                          'token-boost': part.type === 'boost',
                          'token-value': part.type === 'value',
                        }"
                      >
                        {{ part.text }}
                      </span>
                    </td>
                    <td>
                      <span
                        v-for="(part, index) in tokenizeHighlight(row.tie)"
                        :key="`${row.action}-tie-${index}`"
                        :class="{
                          'token-boost': part.type === 'boost',
                          'token-value': part.type === 'value',
                        }"
                      >
                        {{ part.text }}
                      </span>
                    </td>
                    <td>
                      <span
                        v-for="(part, index) in tokenizeHighlight(row.success)"
                        :key="`${row.action}-success-${index}`"
                        :class="{
                          'token-boost': part.type === 'boost',
                          'token-value': part.type === 'value',
                        }"
                      >
                        {{ part.text }}
                      </span>
                    </td>
                    <td>
                      <span
                        v-for="(part, index) in tokenizeHighlight(row.style)"
                        :key="`${row.action}-style-${index}`"
                        :class="{
                          'token-boost': part.type === 'boost',
                          'token-value': part.type === 'value',
                        }"
                      >
                        {{ part.text }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="action-accordion" role="list">
              <article
                v-for="row in ACTION_MATRIX"
                :key="`${row.action}-accordion`"
                class="action-accordion-item"
                role="listitem"
              >
                <button
                  class="action-accordion-trigger"
                  type="button"
                  :aria-expanded="openAction === row.action ? 'true' : 'false'"
                  :aria-controls="getActionPanelId(row.action)"
                  @click="toggleAction(row.action)"
                >
                  <span class="action-label">
                    <span
                      v-for="(part, index) in tokenizeHighlight(row.action)"
                      :key="`${row.action}-accordion-label-${index}`"
                      :class="{
                        'token-boost': part.type === 'boost',
                        'token-value': part.type === 'value',
                      }"
                    >
                      {{ part.text }}
                    </span>
                    <span class="action-label-emoji" aria-hidden="true">{{ row.icon }}</span>
                  </span>
                  <span aria-hidden="true">{{ openAction === row.action ? '−' : '+' }}</span>
                </button>

                <div
                  v-show="openAction === row.action"
                  :id="getActionPanelId(row.action)"
                  class="action-accordion-panel"
                >
                  <dl class="action-accordion-grid">
                    <template
                      v-for="outcome in ACTION_OUTCOMES"
                      :key="`${row.action}-${outcome.key}`"
                    >
                      <dt>{{ outcome.label }}</dt>
                      <dd>
                        <span
                          v-for="(part, index) in tokenizeHighlight(
                            row[outcome.key as keyof typeof row] as string,
                          )"
                          :key="`${row.action}-${outcome.key}-${index}`"
                          :class="{
                            'token-boost': part.type === 'boost',
                            'token-value': part.type === 'value',
                          }"
                        >
                          {{ part.text }}
                        </span>
                      </dd>
                    </template>
                  </dl>
                </div>
              </article>
            </div>
          </article>

          <article
            v-for="card in visibleRuleCards"
            :key="card.area"
            class="cheat-card cheat-card-rule"
            :class="`rule-area-${card.area}`"
          >
            <div v-if="card.title" class="card-heading card-heading-compact">
              <h2>{{ card.title }}</h2>
            </div>

            <ul class="compact-list compact-list-tight">
              <li v-for="line in card.lines" :key="line">
                <template v-if="card.area === 'milestones'">
                  <strong>{{ splitMilestoneLine(line).title }}:</strong>
                  {{ ` ${splitMilestoneLine(line).detail}` }}
                </template>
                <template v-else>{{ line }}</template>
              </li>
            </ul>

            <table v-if="card.area === 'chances'" class="chances-table" aria-label="Wahrscheinlichkeiten für 4dF">
              <thead>
                <tr>
                  <th scope="col">Wurf</th>
                  <th scope="col">Chance</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in CHANCES_TABLE" :key="entry.result">
                  <td class="chances-value">{{ entry.result }}</td>
                  <td>{{ entry.chance }}</td>
                </tr>
              </tbody>
            </table>
          </article>
        </section>
      </div>
    </div>

    <div v-else class="gm-only-hint">Cheat Sheet ist nur im GM-Modus sichtbar.</div>
  </div>
</template>

<style scoped>
.cheat-sheet-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gm-only-hint {
  border: 1px solid var(--fate-border);
  border-radius: 10px;
  padding: 0.9rem;
  color: var(--fate-text-light);
  background: var(--fate-white);
}

.cheat-sheet-page {
  width: min(100%, 1200px);
  max-width: 100%;
  margin-inline: auto;
}

.sheet-content {
  width: 100%;
  max-width: none;
  container-type: inline-size;
  container-name: cheatsheet;
}

.cheat-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
  align-items: start;
}

.cheat-card {
  background: var(--fate-white);
  border: 1px solid var(--fate-border);
  border-radius: 10px;
  padding: 0.95rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.cheat-card-ladder {
  min-width: 0;
}

.cheat-card-actions {
  grid-column: auto;
}

.cheat-card-rule {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.card-heading {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 0.75rem;
}

.card-heading h2 {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.2;
  color: var(--fate-heading);
}

.ladder-grid {
  display: grid;
  grid-template-columns: minmax(3.75rem, auto) minmax(0, 1fr);
  border: 1px solid var(--fate-light-border);
  border-radius: 8px;
  overflow: hidden;
}

.ladder-head,
.ladder-row {
  display: contents;
}

.ladder-grid span {
  padding: 0.35rem 0.45rem;
  border-bottom: 1px solid var(--fate-light-border);
  font-size: 0.74rem;
}

.ladder-grid [role='columnheader'] {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fate-heading);
  background: color-mix(in srgb, var(--fate-blue) 8%, var(--fate-white));
}

.ladder-grid .ladder-value {
  font-weight: 700;
  color: var(--fate-heading);
}

.ladder-grid .ladder-row:nth-last-child(-n + 1) span {
  border-bottom: none;
}

.table-wrap {
  width: 100%;
  border: 1px solid var(--fate-light-border);
  border-radius: 8px;
  overflow: hidden;
}

.action-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 0.72rem;
}

.action-table th,
.action-table td {
  border: 0;
  border-right: 1px solid var(--fate-light-border);
  border-bottom: 1px solid var(--fate-light-border);
  padding: 0.35rem 0.4rem;
  text-align: left;
  vertical-align: top;
  line-height: 1.28;
  word-break: normal;
  overflow-wrap: break-word;
  hyphens: auto;
}

.action-table thead th {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--fate-heading);
  background: color-mix(in srgb, var(--fate-blue) 9%, var(--fate-white));
}

.action-table tbody th {
  color: var(--fate-heading);
  background: color-mix(in srgb, var(--fate-blue-light) 45%, var(--fate-white));
  font-weight: 700;
  width: 17%;
}

.action-table td {
  color: var(--fate-text-light);
}

.action-table tr > *:last-child {
  border-right: 0;
}

.action-table tbody tr:last-child > * {
  border-bottom: 0;
}

.token-boost {
  color: var(--fate-heading);
  font-weight: 700;
}

.token-value {
  color: color-mix(in srgb, var(--fate-heading) 80%, var(--fate-text-light));
  font-weight: 700;
}

.action-label {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.action-label-emoji {
  flex: 0 0 auto;
  font-size: 0.8rem;
  line-height: 1;
}

.action-accordion {
  display: grid;
  gap: 0.45rem;
}

.action-accordion-item {
  border: 1px solid var(--fate-light-border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--fate-blue-light) 30%, var(--fate-white));
  overflow: hidden;
}

.action-accordion-trigger {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--fate-heading);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  text-align: left;
  font-weight: 700;
  cursor: pointer;
}

.action-accordion-trigger:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--fate-blue) 70%, white);
  outline-offset: -2px;
}

.action-accordion-panel {
  border-top: 1px solid var(--fate-light-border);
  padding: 0.45rem 0.6rem 0.55rem;
}

.action-accordion-grid {
  margin: 0;
  display: grid;
  grid-template-columns: minmax(7rem, auto) minmax(0, 1fr);
  gap: 0.3rem 0.45rem;
}

.action-accordion-grid dt,
.action-accordion-grid dd {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.3;
}

.action-accordion-grid dt {
  color: var(--fate-heading);
  font-weight: 700;
}

.action-accordion-grid dd {
  color: var(--fate-text-light);
}

.compact-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: 0;
  padding-left: 1rem;
}

.compact-list-tight {
  gap: 0.28rem;
}

.compact-list li {
  font-size: 0.78rem;
  line-height: 1.35;
  color: var(--fate-text-light);
}

.card-heading-compact {
  margin-bottom: 0.45rem;
}

.card-heading-compact h2 {
  font-size: 0.86rem;
}

.compact-list-tight li {
  font-size: 0.72rem;
  line-height: 1.25;
}

.chances-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--fate-light-border);
  border-radius: 8px;
  overflow: hidden;
}

.chances-table th,
.chances-table td {
  padding: 0.35rem 0.45rem;
  border-bottom: 1px solid var(--fate-light-border);
  text-align: left;
  font-size: 0.74rem;
  line-height: 1.2;
}

.chances-table th {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fate-heading);
  background: color-mix(in srgb, var(--fate-blue) 8%, var(--fate-white));
}

.chances-table tbody tr:last-child td {
  border-bottom: 0;
}

.chances-value {
  font-weight: 700;
  color: var(--fate-heading);
}

.rule-area-milestones {
  position: relative;
  overflow: hidden;
  background: var(--fate-white);
}

.rule-area-milestones .card-heading-compact {
  margin-bottom: 0.6rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--fate-blue-light);
}

.rule-area-milestones .card-heading-compact h2 {
  font-size: 0.92rem;
  letter-spacing: 0.015em;
}

.rule-area-milestones .compact-list {
  padding-left: 0;
  gap: 0.4rem;
}

.rule-area-milestones .compact-list li {
  list-style: none;
  margin: 0;
  padding: 0.45rem 0.5rem;
  border: 1px solid var(--fate-blue-light);
  border-left-width: 0.23rem;
  border-radius: 8px;
  background: var(--fate-white);
  line-height: 1.3;
}

.rule-area-milestones .compact-list li:nth-child(1) {
  border-left-color: #f0c040;
}

.rule-area-milestones .compact-list li:nth-child(2) {
  border-left-color: var(--fate-blue);
}

.rule-area-milestones .compact-list li:nth-child(3) {
  border-left-color: var(--fate-green);
}

.rule-area-scene-setup .card-heading-compact {
  margin-bottom: 0.55rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--fate-blue-light);
}

.rule-area-scene-setup .compact-list {
  padding-left: 0;
  gap: 0.32rem;
}

.rule-area-scene-setup .compact-list li {
  list-style: none;
  margin: 0;
  position: relative;
  padding: 0.38rem 0.45rem 0.38rem 1.45rem;
  border: 1px solid var(--fate-light-border);
  border-radius: 7px;
  background: color-mix(in srgb, var(--fate-white) 94%, var(--fate-blue-light) 6%);
  line-height: 1.28;
}

.rule-area-scene-setup .compact-list li::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0.52rem;
  width: 0.52rem;
  height: 0.52rem;
  border: 1.5px solid var(--fate-blue);
  border-radius: 2px;
  background: var(--fate-white);
}

@container cheatsheet (max-width: 34rem) {
  .cheat-card {
    padding: 0.85rem;
  }

  .action-accordion-grid {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }

  .action-accordion-grid dt {
    margin-top: 0.2rem;
  }
}

@container cheatsheet (min-width: 35rem) {
  .cheat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container cheatsheet (max-width: 47.999rem) {
  .table-wrap {
    display: none;
  }
}

@container cheatsheet (min-width: 48rem) {
  .action-accordion {
    display: none;
  }

  .table-wrap {
    display: block;
  }
}

@container cheatsheet (min-width: 62rem) {
  .cheat-sheet-page {
    padding: 0.9rem;
    border: 1px solid color-mix(in srgb, var(--fate-border) 80%, white);
    border-radius: 12px;
    background: color-mix(in srgb, var(--fate-white) 86%, var(--fate-blue-light) 14%);
    box-shadow:
      0 2px 6px rgba(15, 23, 42, 0.08),
      0 16px 36px rgba(15, 23, 42, 0.12);
    overflow: hidden;
  }

  .cheat-grid {
    grid-template-columns: minmax(11.5rem, 13rem) repeat(3, minmax(0, 1fr));
    grid-template-areas:
      'leiter aktionen aktionen aktionen'
      'leiter challenges scene-setup milestones'
      'chances contests scene-setup milestones'
      'chances contests scene-setup milestones';
    gap: 0.75rem;
  }

  .cheat-card-ladder {
    grid-area: leiter;
    align-self: start;
  }

  .cheat-card-actions {
    grid-area: aktionen;
    display: flex;
    flex-direction: column;
  }

  .cheat-card-actions .table-wrap {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
  }

  .cheat-card-actions .action-table {
    height: 100%;
  }

  .rule-area-challenges {
    grid-area: challenges;
  }

  .rule-area-contests {
    grid-area: contests;
  }

  .rule-area-milestones {
    grid-area: milestones;
  }

  .rule-area-chances {
    grid-area: chances;
  }

  .rule-area-scene-setup {
    grid-area: scene-setup;
  }

}
</style>
