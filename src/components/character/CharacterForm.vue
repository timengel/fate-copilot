<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Character, ConsequenceLabel, ConsequenceSeverity, Stunt } from '../../types'
import { CHARACTER_COLORS } from '../../types'
import ColorPicker from '../shared/ColorPicker.vue'
import AspectFields from './AspectFields.vue'
import SkillPyramid from './SkillPyramid.vue'
import StressTrack from './StressTrack.vue'
import ConsequenceSlots from './ConsequenceSlots.vue'
import FateButton from '../shared/FateButton.vue'
import FateCounter from '../shared/FateCounter.vue'
import { useGMModeStore } from '../../stores/gmMode'

const gmModeStore = useGMModeStore()

const props = defineProps<{ character: Character; hideActions?: boolean }>()
const emit = defineEmits<{ save: [character: Character]; cancel: [] }>()

const form = reactive<Character>(JSON.parse(JSON.stringify(props.character)))

watch(() => props.character, (val) => {
  Object.assign(form, JSON.parse(JSON.stringify(val)))
}, { deep: true })

function addStunt() {
  form.stunts.push({ name: '', description: '' })
}

function removeStunt(index: number) {
  form.stunts.splice(index, 1)
}

function updateStunt(index: number, field: keyof Stunt, value: string) {
  const stunt = form.stunts[index]
  if (stunt) stunt[field] = value
}

function save() {
  emit('save', JSON.parse(JSON.stringify(form)))
}

// NSC: collapsible sections
const showExtras = ref(form.type !== 'nsc' || !!form.extras?.trim())
const showStunts = ref(form.type !== 'nsc' || form.stunts.length > 0)

// NSC: consequence configuration
const CONSEQUENCE_TYPES: { label: string; severity: ConsequenceSeverity; labelKey: ConsequenceLabel }[] = [
  { label: 'Leicht',  severity: 2, labelKey: 'mild' },
  { label: 'Mittel',  severity: 4, labelKey: 'moderate' },
  { label: 'Schwer',  severity: 6, labelKey: 'severe' },
  { label: 'Extrem',  severity: 8, labelKey: 'extreme' },
]

function countConsequences(severity: ConsequenceSeverity) {
  return form.consequences.filter(c => c.severity === severity).length
}

function addConsequenceSlot(severity: ConsequenceSeverity, labelKey: ConsequenceLabel) {
  const idx = form.consequences.map(c => c.severity).lastIndexOf(severity)
  form.consequences.splice(idx === -1 ? form.consequences.length : idx + 1, 0, { severity, label: labelKey, value: '' })
}

function removeConsequenceSlot(severity: ConsequenceSeverity) {
  const idx = form.consequences.map(c => c.severity).lastIndexOf(severity)
  if (idx !== -1) form.consequences.splice(idx, 1)
}

function addStressBox(track: 'physical' | 'mental') {
  const arr = track === 'physical' ? form.stressPhysical : form.stressMental
  const nextValue = arr.length > 0 ? arr[arr.length - 1]!.value + 1 : 1
  arr.push({ value: nextValue, checked: false })
}

function removeStressBox(track: 'physical' | 'mental') {
  const arr = track === 'physical' ? form.stressPhysical : form.stressMental
  if (arr.length > 0) arr.pop()
}

const colorVars = computed(() => {
  const found = CHARACTER_COLORS.find(c => c.id === (form.color ?? 'pfau'))
  const c = found ?? CHARACTER_COLORS[0]!
  return {
    '--fate-blue': c.primary,
    '--fate-blue-dark': c.dark,
    '--fate-blue-light': c.light,
  }
})

defineExpose({ save })
</script>

<template>
  <div class="character-form character-sheet" :style="colorVars">

    <!-- ALLGEMEINES -->
    <section class="sheet-section allgemeines">
      <div class="sheet-section-header">ALLGEMEINES</div>
      <div class="allgemeines-grid">
        <div class="allgemeines-left">
          <div class="field-row">
            <label class="field-label">Name</label>
            <input class="field-input" v-model="form.name" placeholder="Charaktername" />
          </div>
          <div class="field-row">
            <label class="field-label">Beschreibung</label>
            <textarea class="field-input field-textarea" v-model="form.description" placeholder="Kurzbeschreibung" />
          </div>
          <div class="field-row">
            <label class="field-label">Farbe</label>
            <ColorPicker v-model="form.color" />
          </div>
        </div>
        <div class="allgemeines-right">
          <div class="field-row">
            <label class="field-label">Erholungsrate</label>
            <FateCounter v-model="form.refresh" :min="1" :max="10" />
          </div>
          <div class="field-row">
            <label class="field-label">Fate-Punkte</label>
            <FateCounter v-model="form.fatePoints" />
          </div>
        </div>
      </div>
    </section>

    <!-- ASPEKTE / FERTIGKEITEN -->
    <div class="sheet-two-col">
      <section class="sheet-section aspekte">
        <div class="sheet-section-header">ASPEKTE</div>
        <AspectFields
          :highConcept="form.highConcept"
          :trouble="form.trouble"
          :aspects="form.aspects"
          @update:highConcept="form.highConcept = $event"
          @update:trouble="form.trouble = $event"
          @update:aspects="form.aspects = $event"
        />
      </section>

      <section class="sheet-section fertigkeiten">
        <div class="sheet-section-header">FERTIGKEITEN</div>
        <SkillPyramid
          :skills="form.skills"
          :maxLevel="form.pyramidMaxLevel ?? 5"
          :maxCols="form.pyramidMaxCols ?? 5"
          @update="form.skills = $event"
          @updateLayout="(p) => { form.pyramidMaxLevel = p.maxLevel; form.pyramidMaxCols = p.maxCols }"
        />
      </section>
    </div>

    <!-- EXTRAS / STUNTS -->
    <div class="sheet-two-col">
      <section class="sheet-section extras">
        <div class="sheet-section-header" :class="{ 'section-header-toggle': form.type === 'nsc' }" @click="form.type === 'nsc' && (showExtras = !showExtras)">
          EXTRAS
          <span v-if="form.type === 'nsc'" class="section-toggle">{{ showExtras ? '▼' : '▶' }}</span>
        </div>
        <div v-show="showExtras">
          <textarea class="text-area-input" v-model="form.extras" placeholder="Extras beschreiben..." />
        </div>
      </section>

      <section class="sheet-section stunts">
        <div class="sheet-section-header" :class="{ 'section-header-toggle': form.type === 'nsc' }" @click="form.type === 'nsc' && (showStunts = !showStunts)">
          STUNTS
          <span v-if="form.type === 'nsc'" class="section-toggle">{{ showStunts ? '▼' : '▶' }}</span>
        </div>
        <div v-show="showStunts" class="stunts-list">
          <div v-for="(stunt, i) in form.stunts" :key="i" class="stunt-edit-row">
            <div class="stunt-edit-fields">
              <input
                class="stunt-name-input"
                :value="stunt.name"
                placeholder="Name des Stunts"
                @input="updateStunt(i, 'name', ($event.target as HTMLInputElement).value)"
              />
              <textarea
                class="stunt-desc-textarea"
                :value="stunt.description"
                placeholder="Beschreibung"
                rows="1"
                @input="updateStunt(i, 'description', ($event.target as HTMLTextAreaElement).value)"
              />
            </div>
            <FateButton variant="danger" size="S" @click="removeStunt(i)">✕</FateButton>
          </div>
          <FateButton variant="add" @click="addStunt">+ Stunt hinzufügen</FateButton>
        </div>
      </section>
    </div>

    <!-- STRESS / KONSEQUENZEN -->
    <div class="sheet-bottom">
      <div class="stress-section">
        <div class="stress-track-row">
          <StressTrack
            label="KÖRPERLICHER STRESS (KRAFT)"
            :boxes="form.stressPhysical"
            @update="form.stressPhysical = $event"
          />
          <div class="stress-track-controls">
            <button type="button" class="stress-ctrl-btn" :disabled="form.stressPhysical.length === 0" @click="removeStressBox('physical')">−</button>
            <button type="button" class="stress-ctrl-btn" :disabled="form.stressPhysical.length >= 6" @click="addStressBox('physical')">+</button>
          </div>
        </div>
        <div class="stress-track-row">
          <StressTrack
            label="GEISTIGER STRESS (WILLE)"
            :boxes="form.stressMental"
            @update="form.stressMental = $event"
          />
          <div class="stress-track-controls">
            <button type="button" class="stress-ctrl-btn" :disabled="form.stressMental.length === 0" @click="removeStressBox('mental')">−</button>
            <button type="button" class="stress-ctrl-btn" :disabled="form.stressMental.length >= 6" @click="addStressBox('mental')">+</button>
          </div>
        </div>
      </div>

      <section class="sheet-section konsequenzen">
        <div class="sheet-section-header">KONSEQUENZEN</div>
        <div class="consequence-config">
          <span v-for="ct in CONSEQUENCE_TYPES" :key="ct.severity" class="consequence-config-item">
            <button type="button" class="consequence-config-btn" :disabled="countConsequences(ct.severity) === 0" @click="removeConsequenceSlot(ct.severity)">−</button>
            <span class="consequence-config-label">{{ ct.label }} ({{ countConsequences(ct.severity) }})</span>
            <button type="button" class="consequence-config-btn" @click="addConsequenceSlot(ct.severity, ct.labelKey)">+</button>
          </span>
        </div>
        <ConsequenceSlots
          :consequences="form.consequences"
          @update="form.consequences = $event"
        />
      </section>
    </div>

    <!-- GM-NOTIZEN -->
    <section v-if="gmModeStore.isGMMode" class="sheet-section gm-notes-section">
      <div class="sheet-section-header">GM-NOTIZEN</div>
      <textarea class="text-area-input" v-model="form.gmNotes" placeholder="Interne Notizen (nur im GM-Modus sichtbar)" />
    </section>

    <!-- FORM ACTIONS -->
    <div v-if="!hideActions" class="form-actions">
      <FateButton variant="secondary" @click="emit('cancel')">Abbrechen</FateButton>
      <FateButton @click="save">Speichern</FateButton>
    </div>

  </div>
</template>

<style scoped>
.character-sheet {
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: clip;
  font-size: 0.875rem;
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

.field-input {
  border: none;
  border-bottom: 1px solid var(--fate-border);
  padding: 2px 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: transparent;
  width: 100%;
  outline: none;
}

.field-input:focus {
  border-bottom-color: var(--fate-blue);
}

.field-textarea {
  field-sizing: content;
  resize: vertical;
  min-height: 3em;
  border: 1px solid var(--fate-border);
  border-radius: 3px;
  padding: 4px;
}

.field-number {
  width: 60px;
  text-align: center;
}


/* TWO-COLUMN LAYOUT (Aspekte | Fertigkeiten, Extras | Stunts) */
.sheet-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--fate-border);
}

.sheet-two-col .sheet-section {
  border-bottom: none;
}

.sheet-two-col .sheet-section:first-child {
  border-right: 1px solid var(--fate-border);
}

/* EXTRAS / STUNTS */
.extras,
.stunts {
  padding: 0;
}

.text-area-input {
  field-sizing: content;
  width: 100%;
  border: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: transparent;
  resize: vertical;
  outline: none;
  min-height: 80px;
}

.stunts-list {
  padding: 0.5rem 0.75rem;
  min-height: 120px;
}

.stunt-edit-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.stunt-edit-fields {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.stunt-name-input {
  border: none;
  border-bottom: 1px solid var(--fate-border);
  padding: 2px 4px;
  font-size: 0.8rem;
  font-family: inherit;
  font-weight: 600;
  color: var(--fate-text);
  background: transparent;
  outline: none;
  width: 100%;
}

.stunt-desc-textarea {
  field-sizing: content;
  resize: none;
  border: none;
  border-bottom: 1px solid var(--fate-border);
  padding: 2px 4px;
  font-size: 0.75rem;
  font-family: inherit;
  color: var(--fate-text-light);
  background: transparent;
  outline: none;
  width: 100%;
  min-height: 1.5em;
  overflow: hidden;
}

.stunt-name-input:focus,
.stunt-desc-textarea:focus {
  border-bottom-color: var(--fate-blue);
}

/* BOTTOM: STRESS + KONSEQUENZEN */
.sheet-bottom {
  display: grid;
  grid-template-columns: auto 1fr;
  border-bottom: 1px solid var(--fate-border);
}

.stress-section {
  border-right: 1px solid var(--fate-border);
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 220px;
}

/* SECTION TOGGLE (NSC) */
.sheet-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-header-toggle {
  cursor: pointer;
  user-select: none;
}

.section-header-toggle:hover .section-toggle {
  color: #fff;
}

.section-toggle {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
}

/* STRESS TRACK CONTROLS */
.stress-track-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
}

.stress-track-controls {
  display: flex;
  flex-direction: row;
  gap: 2px;
  padding-bottom: 2px;
}

.stress-ctrl-btn {
  width: 18px;
  height: 18px;
  border: 1px solid var(--fate-border);
  border-radius: 3px;
  background: white;
  color: var(--fate-text);
  font-size: 0.85rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stress-ctrl-btn:hover:not(:disabled) {
  border-color: var(--fate-blue);
  color: var(--fate-blue);
}

.stress-ctrl-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

/* CONSEQUENCE CONFIG (NSC) */
.consequence-config {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--fate-border);
}

.consequence-config-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.consequence-config-btn {
  width: 18px;
  height: 18px;
  border: 1px solid var(--fate-border);
  border-radius: 3px;
  background: white;
  color: var(--fate-text);
  font-size: 0.85rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.consequence-config-btn:hover:not(:disabled) {
  border-color: var(--fate-blue);
  color: var(--fate-blue);
}

.consequence-config-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.consequence-config-label {
  font-size: 0.7rem;
  color: var(--fate-text-light);
  min-width: 70px;
  text-align: center;
}

/* FORM ACTIONS */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.75rem;
  border-top: 1px solid var(--fate-border);
  background: var(--fate-blue-light);
}


@container main (width < 768px) {
  .sheet-two-col {
    grid-template-columns: 1fr;
  }
  .sheet-two-col .sheet-section:first-child {
    border-right: none;
    border-bottom: 1px solid var(--fate-border);
  }
  .sheet-bottom {
    grid-template-columns: 1fr;
  }
  .stress-section {
    border-right: none;
    border-bottom: 1px solid var(--fate-border);
  }
  .allgemeines-grid {
    grid-template-columns: 1fr;
  }
}

@container main (width < 768px) {
  /* allgemeines-right: nach Grid-Kollaps normal left-aligned */
  .allgemeines-right {
    align-items: flex-start;
    min-width: 0;
  }

  /* Detail-Toolbar + Form-Actions: Wrap erlauben */
  .form-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
