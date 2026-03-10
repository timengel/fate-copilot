<script setup lang="ts">
import { computed } from 'vue'
import type { Character } from '../../types'
import { CHARACTER_COLORS } from '../../types'
import { useGMModeStore } from '../../stores/gmMode'
import AspectFields from './AspectFields.vue'
import SkillPyramid from './SkillPyramid.vue'
import StressTrack from './StressTrack.vue'
import ConsequenceSlots from './ConsequenceSlots.vue'

const props = defineProps<{
  character: Character
  sections?: {
    allgemeines?: boolean
    aspekte?: boolean
    fertigkeiten?: boolean
    extras?: boolean
    stunts?: boolean
    stress?: boolean
    konsequenzen?: boolean
  }
}>()

const gmModeStore = useGMModeStore()

const isNscHidden = computed(() =>
  !gmModeStore.isGMMode && props.character.type === 'nsc'
)

const colorVars = computed(() => {
  const found = CHARACTER_COLORS.find(c => c.id === (props.character.color ?? 'pfau'))
  const c = found ?? CHARACTER_COLORS[0]!
  return {
    '--fate-blue': c.primary,
    '--fate-blue-dark': c.dark,
    '--fate-blue-light': c.light,
  }
})
</script>

<template>
  <div class="character-sheet" :style="colorVars">

    <!-- NSC in Player View: show only name + High Concept -->
    <template v-if="isNscHidden">
      <section class="sheet-section allgemeines">
        <div class="sheet-section-header">NSC</div>
        <div class="nsc-hidden-body">
          <div class="nsc-hidden-name">{{ character.name || '(Unbenannt)' }}</div>
          <div v-if="character.highConcept" class="nsc-hidden-concept">{{ character.highConcept }}</div>
          <div class="nsc-hidden-label">Details sind im GM-Modus sichtbar.</div>
        </div>
      </section>
    </template>

    <!-- Full sheet (GM Mode or SC) -->
    <template v-else>

      <!-- Immer sichtbar: Name -->
      <div class="character-name-bar">
        <span class="character-name-text">{{ character.name || '(Unbenannt)' }}</span>
        <span class="character-type-badge">{{ character.type === 'nsc' ? 'NSC' : 'SC' }}</span>
      </div>

      <!-- ALLGEMEINES -->
      <section v-if="sections?.allgemeines !== false" class="sheet-section allgemeines">
        <div class="sheet-section-header">ALLGEMEINES</div>
        <div class="allgemeines-grid">
          <div class="allgemeines-left">
            <div class="field-row">
              <label class="field-label">Name</label>
              <span class="field-value">{{ character.name || '—' }}</span>
            </div>
            <div class="field-row">
              <label class="field-label">Beschreibung</label>
              <span class="field-value field-description">{{ character.description || '—' }}</span>
            </div>
          </div>
          <div class="allgemeines-right">
            <div class="field-row">
              <label class="field-label">Erholungsrate</label>
              <span class="field-value refresh-value">{{ character.refresh }}</span>
            </div>
            <div class="field-row">
              <label class="field-label">Fate-Punkte</label>
              <span class="field-value fate-points">{{ character.fatePoints }}</span>
            </div>
            <div class="fate-logo-corner">
              <span class="fate-logo-plus">+</span>FATE
              <div class="fate-logo-sub">CORE SYSTEM</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ASPEKTE -->
      <section
        v-if="sections?.aspekte !== false"
        class="sheet-section aspekte"
        :class="{ 'span-full': sections?.fertigkeiten === false }"
      >
        <div class="sheet-section-header">ASPEKTE</div>
        <AspectFields
          :highConcept="character.highConcept"
          :trouble="character.trouble"
          :aspects="character.aspects"
          :readonly="true"
        />
      </section>

      <!-- FERTIGKEITEN -->
      <section
        v-if="sections?.fertigkeiten !== false"
        class="sheet-section fertigkeiten"
        :class="{ 'span-full': sections?.aspekte === false }"
      >
        <div class="sheet-section-header">FERTIGKEITEN</div>
        <SkillPyramid
          :skills="character.skills"
          :maxLevel="character.pyramidMaxLevel ?? 5"
          :maxCols="character.pyramidMaxCols ?? 5"
          :readonly="true"
        />
      </section>

      <!-- EXTRAS -->
      <section
        v-if="sections?.extras !== false"
        class="sheet-section extras"
        :class="{ 'span-full': sections?.stunts === false }"
      >
        <div class="sheet-section-header">EXTRAS</div>
        <div class="text-area-display">{{ character.extras || '' }}</div>
      </section>

      <!-- STUNTS -->
      <section
        v-if="sections?.stunts !== false"
        class="sheet-section stunts"
        :class="{ 'span-full': sections?.extras === false }"
      >
        <div class="sheet-section-header">STUNTS</div>
        <div class="stunts-list">
          <div v-for="(stunt, i) in character.stunts" :key="i" class="stunt-item">
            <strong>{{ stunt.name }}</strong>
            <span v-if="stunt.description">: {{ stunt.description }}</span>
          </div>
          <div v-if="character.stunts.length === 0" class="empty-text"></div>
        </div>
      </section>

      <!-- STRESS + KONSEQUENZEN -->
      <div
        v-if="sections?.stress !== false || sections?.konsequenzen !== false"
        class="sheet-stress-row"
      >
        <div
          v-if="sections?.stress !== false"
          class="stress-section"
          :class="{ 'span-full': sections?.konsequenzen === false }"
        >
          <StressTrack
            label="KÖRPERLICHER STRESS (KRAFT)"
            :boxes="character.stressPhysical"
            :readonly="true"
          />
          <StressTrack
            label="GEISTIGER STRESS (WILLE)"
            :boxes="character.stressMental"
            :readonly="true"
          />
        </div>

        <section
          v-if="sections?.konsequenzen !== false"
          class="sheet-section konsequenzen"
          :class="{ 'span-full': sections?.stress === false }"
        >
          <div class="sheet-section-header">KONSEQUENZEN</div>
          <ConsequenceSlots :consequences="character.consequences" :readonly="true" />
        </section>
      </div>

      <!-- GM-NOTIZEN (nur im GM-Modus) -->
      <section v-if="gmModeStore.isGMMode && character.gmNotes" class="sheet-section gm-notes-section">
        <div class="sheet-section-header">GM-NOTIZEN</div>
        <div class="text-area-display gm-notes-display">{{ character.gmNotes }}</div>
      </section>

    </template>

  </div>
</template>

<style scoped>
.character-sheet {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: clip;
  font-size: 0.875rem;
}

/* Full-width grid children */
.character-name-bar,
.allgemeines,
.gm-notes-section {
  grid-column: 1 / -1;
}

/* Left-column sections get a right-side divider */
.aspekte,
.extras {
  border-right: 1px solid var(--fate-border);
}

/* When a section is alone in its row, span both columns */
.span-full {
  grid-column: 1 / -1;
  border-right: none;
}

/* NAME BAR (always visible in full sheet) */
.character-name-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.75rem;
  background: var(--fate-blue);
  gap: 0.5rem;
}

.character-name-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-type-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  padding: 1px 5px;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

/* ALLGEMEINES */
.allgemeines-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  align-items: start;
}

.allgemeines-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  min-width: 160px;
}

.field-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 3px 0;
}

.field-label {
  font-size: 0.7rem;
  color: var(--fate-blue);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 90px;
  flex-shrink: 0;
}

.field-value {
  border-bottom: 1px solid var(--fate-border);
  min-width: 120px;
  min-height: 1.4em;
  padding: 1px 2px;
  color: var(--fate-text);
  font-size: 0.875rem;
}

.field-value.field-description {
  min-height: 2.8em;
  white-space: pre-wrap;
}

.refresh-value,
.fate-points {
  font-size: 1rem;
  font-weight: 700;
  color: var(--fate-blue);
  text-align: center;
  min-width: 28px;
}

.fate-logo-corner {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--fate-blue);
  letter-spacing: -1px;
  line-height: 1;
  text-align: right;
  margin-top: 0.25rem;
}

.fate-logo-sub {
  font-size: 0.55rem;
  letter-spacing: 2px;
  font-weight: 700;
  color: var(--fate-blue);
  text-align: right;
}

/* EXTRAS / STUNTS */
.text-area-display {
  padding: 0.5rem 0.75rem;
  min-height: 120px;
  white-space: pre-wrap;
  font-size: 0.875rem;
  color: var(--fate-text);
}

.stunts-list {
  padding: 0.5rem 0.75rem;
  min-height: 120px;
}

.stunt-item {
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
  line-height: 1.4;
}

/* STRESS + KONSEQUENZEN row */
.sheet-stress-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: max-content 1fr;
  border-bottom: 1px solid var(--fate-border);
}

.stress-section {
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-right: 1px solid var(--fate-border);
}

.konsequenzen {
  border-bottom: none;
}

@container main (width < 768px) {
  .character-sheet {
    grid-template-columns: 1fr;
  }

  .aspekte,
  .extras {
    border-right: none;
  }

  .sheet-stress-row {
    grid-template-columns: 1fr;
  }

  .stress-section {
    border-right: none;
    border-bottom: 1px solid var(--fate-border);
  }

  .allgemeines-grid {
    grid-template-columns: 1fr;
  }

  .allgemeines-right {
    align-items: flex-start;
    min-width: 0;
  }
}

/* NSC hidden in Player View */
.nsc-hidden-body {
  padding: 0.75rem;
}

.nsc-hidden-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--fate-text);
  margin-bottom: 0.25rem;
}

.nsc-hidden-concept {
  font-size: 0.875rem;
  color: var(--fate-text-light);
  margin-bottom: 0.5rem;
  font-style: italic;
}

.nsc-hidden-label {
  font-size: 0.75rem;
  color: var(--fate-text-muted);
}

/* GM notes section */
.gm-notes-section {
  background: #f0f4ff;
}

.gm-notes-display {
  background: transparent;
}
</style>
