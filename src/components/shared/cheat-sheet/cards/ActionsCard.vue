<script setup lang="ts">
import { ref } from 'vue';

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
</script>

<template>
  <article aria-labelledby="actions-heading">
    <div class="card-heading card-heading-compact">
      <h2 id="actions-heading">4 Aktionen</h2>
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

        <div v-show="openAction === row.action" :id="getActionPanelId(row.action)" class="action-accordion-panel">
          <dl class="action-accordion-grid">
            <template v-for="outcome in ACTION_OUTCOMES" :key="`${row.action}-${outcome.key}`">
              <dt>{{ outcome.label }}</dt>
              <dd>
                <span
                  v-for="(part, index) in tokenizeHighlight(row[outcome.key as keyof typeof row] as string)"
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
</template>

<style scoped>
.card-heading {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 0.45rem;
}

.card-heading h2 {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.2;
  color: var(--fate-heading);
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

@container cheatsheet (max-width: 34rem) {
  .action-accordion-grid {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }

  .action-accordion-grid dt {
    margin-top: 0.2rem;
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
</style>
