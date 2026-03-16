<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import type { Character, ConsequenceLabel, ConsequenceSeverity, Stunt } from '../../types';
import { CHARACTER_COLORS } from '../../types';
import { useGMModeStore } from '../../stores/gmMode';
import ColorPicker from '../shared/ColorPicker.vue';
import AspectFields from './AspectFields.vue';
import SkillPyramid from './SkillPyramid.vue';
import StressTrack from './StressTrack.vue';
import ConsequenceSlots from './ConsequenceSlots.vue';
import FateButton from '../shared/FateButton.vue';
import FateCounter from '../shared/FateCounter.vue';

const props = defineProps<{
  character: Character;
  mode?: 'view' | 'edit';
  hideActions?: boolean;
  sections?: {
    allgemeines?: boolean;
    allgemeinesRefresh?: boolean;
    allgemeinesFatePoints?: boolean;
    aspekte?: boolean;
    fertigkeiten?: boolean;
    extras?: boolean;
    stunts?: boolean;
    stress?: boolean;
    konsequenzen?: boolean;
    gmNotes?: boolean;
  };
}>();

const emit = defineEmits<{ save: [character: Character]; cancel: [] }>();

const gmModeStore = useGMModeStore();

const rawForm = JSON.parse(JSON.stringify(props.character)) as Character;
const form = reactive<Character>(rawForm);

watchEffect(() => {
  const updated = JSON.parse(JSON.stringify(props.character)) as Character;
  Object.assign(form, updated);
});

const isEditing = computed(() => props.mode === 'edit');

const data = computed(() => (isEditing.value ? form : props.character));

const isNscHidden = computed(
  () => !isEditing.value && !gmModeStore.isGMMode && props.character.type === 'nsc',
);

const colorVars = computed(() => {
  const found = CHARACTER_COLORS.find((c) => c.id === (data.value.color ?? 'pfau'));
  const c = found ?? CHARACTER_COLORS[0]!;
  return {
    '--fate-blue': c.primary,
    '--fate-blue-dark': c.dark,
    '--fate-blue-light': c.light,
  };
});

// NSC: collapsible sections (edit mode only)
const showExtras = ref(
  form.type !== 'nsc' || !!form.extras?.trim(),
);
const showStunts = ref(
  form.type !== 'nsc' || form.stunts.length > 0,
);

// Stunt management
function addStunt() {
  form.stunts.push({ name: '', description: '' });
}

function removeStunt(index: number) {
  form.stunts.splice(index, 1);
}

function updateStunt(index: number, field: keyof Stunt, value: string) {
  const stunt = form.stunts[index];
  if (stunt) stunt[field] = value;
}

function onStuntNameInput(index: number, e: Event) {
  if (e.target instanceof HTMLInputElement) updateStunt(index, 'name', e.target.value);
}

function onStuntDescInput(index: number, e: Event) {
  if (e.target instanceof HTMLTextAreaElement) updateStunt(index, 'description', e.target.value);
}

// Consequence management
const CONSEQUENCE_TYPES: {
  label: string;
  severity: ConsequenceSeverity;
  labelKey: ConsequenceLabel;
}[] = [
  { label: 'Leicht', severity: 2, labelKey: 'mild' },
  { label: 'Mittel', severity: 4, labelKey: 'moderate' },
  { label: 'Schwer', severity: 6, labelKey: 'severe' },
  { label: 'Extrem', severity: 8, labelKey: 'extreme' },
];

function countConsequences(severity: ConsequenceSeverity) {
  return form.consequences.filter((c) => c.severity === severity).length;
}

function addConsequenceSlot(severity: ConsequenceSeverity, labelKey: ConsequenceLabel) {
  const idx = form.consequences.map((c) => c.severity).lastIndexOf(severity);
  form.consequences.splice(idx === -1 ? form.consequences.length : idx + 1, 0, {
    severity,
    label: labelKey,
    value: '',
  });
}

function removeConsequenceSlot(severity: ConsequenceSeverity) {
  const idx = form.consequences.map((c) => c.severity).lastIndexOf(severity);
  if (idx !== -1) form.consequences.splice(idx, 1);
}

// Stress management
function addStressBox(track: 'physical' | 'mental') {
  const arr = track === 'physical' ? form.stressPhysical : form.stressMental;
  const nextValue = arr.length > 0 ? arr[arr.length - 1]!.value + 1 : 1;
  arr.push({ value: nextValue, checked: false });
}

function removeStressBox(track: 'physical' | 'mental') {
  const arr = track === 'physical' ? form.stressPhysical : form.stressMental;
  if (arr.length > 0) arr.pop();
}

function save() {
  emit('save', JSON.parse(JSON.stringify(form)));
}

defineExpose({ save });
</script>

<template>
  <div class="character-sheet" :style="colorVars">
    <!-- NSC hidden in Player View (view mode only) -->
    <template v-if="isNscHidden">
      <section class="sheet-section allgemeines">
        <div class="sheet-section-header">NSC</div>
        <div class="nsc-hidden-body">
          <div class="nsc-hidden-name">{{ data.name || '(Unbenannt)' }}</div>
          <div v-if="data.highConcept" class="nsc-hidden-concept">{{ data.highConcept }}</div>
          <div class="nsc-hidden-label">Details sind im GM-Modus sichtbar.</div>
        </div>
      </section>
    </template>

    <template v-else>
      <!-- Name Bar -->
      <div class="character-name-bar">
        <span class="character-name-text">{{ data.name || '(Unbenannt)' }}</span>
        <span v-if="!isEditing" class="character-type-badge">{{
          data.type === 'nsc' ? 'NSC' : 'SC'
        }}</span>
        <div class="character-name-bar-end">
          <slot v-if="!isEditing" name="name-bar-actions" />
          <slot v-else name="edit-bar-actions" />
        </div>
      </div>

      <!-- ALLGEMEINES -->
      <section
        v-if="isEditing || sections?.allgemeines !== false"
        class="sheet-section allgemeines"
      >
        <div class="sheet-section-header">ALLGEMEINES</div>
        <div class="allgemeines-grid">
          <div class="allgemeines-left">
            <div class="field-row">
              <label class="field-label">Name</label>
              <input
                v-if="isEditing"
                class="field-input"
                v-model="form.name"
                placeholder="Charaktername"
              />
              <span v-else class="field-value">{{ data.name || '—' }}</span>
            </div>
            <div class="field-row">
              <label class="field-label">Beschreibung</label>
              <textarea
                v-if="isEditing"
                class="field-input field-textarea"
                v-model="form.description"
                placeholder="Kurzbeschreibung"
              />
              <span v-else class="field-value field-description">{{
                data.description || '—'
              }}</span>
            </div>
            <div v-if="isEditing" class="field-row">
              <label class="field-label">Farbe</label>
              <ColorPicker v-model="form.color" />
            </div>
          </div>
          <div class="allgemeines-right">
            <div v-if="sections?.allgemeinesRefresh !== false" class="field-row">
              <label class="field-label">Erholungsrate</label>
              <FateCounter v-if="isEditing" v-model="form.refresh" :min="1" :max="10" />
              <span v-else class="field-value refresh-value">{{ data.refresh }}</span>
            </div>
            <div v-if="sections?.allgemeinesFatePoints !== false" class="field-row">
              <label class="field-label">Fate-Punkte</label>
              <FateCounter v-if="isEditing" v-model="form.fatePoints" />
              <span v-else class="field-value fate-points">{{ data.fatePoints }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ASPEKTE -->
      <section
        v-if="isEditing || sections?.aspekte !== false"
        class="sheet-section aspekte"
        :class="{ 'span-full': !isEditing && sections?.fertigkeiten === false }"
      >
        <div class="sheet-section-header">ASPEKTE</div>
        <AspectFields
          v-if="isEditing"
          :highConcept="form.highConcept"
          :trouble="form.trouble"
          :aspects="form.aspects"
          @update:highConcept="form.highConcept = $event"
          @update:trouble="form.trouble = $event"
          @update:aspects="form.aspects = $event"
        />
        <AspectFields
          v-else
          :highConcept="data.highConcept"
          :trouble="data.trouble"
          :aspects="data.aspects"
          :readonly="true"
        />
      </section>

      <!-- FERTIGKEITEN -->
      <section
        v-if="isEditing || sections?.fertigkeiten !== false"
        class="sheet-section fertigkeiten"
        :class="{ 'span-full': !isEditing && sections?.aspekte === false }"
      >
        <div class="sheet-section-header">FERTIGKEITEN</div>
        <SkillPyramid
          v-if="isEditing"
          :skills="form.skills"
          :maxLevel="form.pyramidMaxLevel ?? 5"
          :maxCols="form.pyramidMaxCols ?? 5"
          @update="form.skills = $event"
          @updateLayout="
            (p) => {
              form.pyramidMaxLevel = p.maxLevel;
              form.pyramidMaxCols = p.maxCols;
            }
          "
        />
        <SkillPyramid
          v-else
          :skills="data.skills"
          :maxLevel="data.pyramidMaxLevel ?? 5"
          :maxCols="data.pyramidMaxCols ?? 5"
          :readonly="true"
        />
      </section>

      <!-- EXTRAS -->
      <section
        v-if="isEditing || sections?.extras !== false"
        class="sheet-section extras"
        :class="{ 'span-full': !isEditing && sections?.stunts === false }"
      >
        <div
          class="sheet-section-header"
          :class="{ 'section-header-toggle': isEditing && (form.type === 'nsc') }"
          @click="isEditing && form.type === 'nsc' && (showExtras = !showExtras)"
        >
          EXTRAS
          <span v-if="isEditing && form.type === 'nsc'" class="section-toggle">{{
            showExtras ? '▼' : '▶'
          }}</span>
        </div>
        <div v-if="isEditing" v-show="showExtras">
          <textarea
            class="text-area-input"
            v-model="form.extras"
            placeholder="Extras beschreiben..."
          />
        </div>
        <div v-else class="text-area-display">{{ data.extras || '' }}</div>
      </section>

      <!-- STUNTS -->
      <section
        v-if="isEditing || sections?.stunts !== false"
        class="sheet-section stunts"
        :class="{ 'span-full': !isEditing && sections?.extras === false }"
      >
        <div
          class="sheet-section-header"
          :class="{ 'section-header-toggle': isEditing && form.type === 'nsc' }"
          @click="isEditing && form.type === 'nsc' && (showStunts = !showStunts)"
        >
          STUNTS
          <span v-if="isEditing && form.type === 'nsc'" class="section-toggle">{{
            showStunts ? '▼' : '▶'
          }}</span>
        </div>
        <div v-if="isEditing" v-show="showStunts" class="stunts-list">
          <div v-for="(stunt, i) in form.stunts" :key="i" class="stunt-edit-row">
            <div class="stunt-edit-fields">
              <input
                class="stunt-name-input"
                :value="stunt.name"
                placeholder="Name des Stunts"
                @input="onStuntNameInput(i, $event)"
              />
              <textarea
                class="stunt-desc-textarea"
                :value="stunt.description"
                placeholder="Beschreibung"
                rows="1"
                @input="onStuntDescInput(i, $event)"
              />
            </div>
            <FateButton variant="danger" size="S" @click="removeStunt(i)">✕</FateButton>
          </div>
          <FateButton variant="add" @click="addStunt">+ Stunt hinzufügen</FateButton>
        </div>
        <div v-else class="stunts-list">
          <div v-for="(stunt, i) in data.stunts" :key="i" class="stunt-item">
            <strong>{{ stunt.name }}</strong>
            <span v-if="stunt.description">: {{ stunt.description }}</span>
          </div>
          <div v-if="data.stunts.length === 0" class="empty-text"></div>
        </div>
      </section>

      <!-- STRESS + KONSEQUENZEN -->
      <div
        v-if="isEditing || (form.stressPhysical.length > 0 || form.stressMental.length > 0) || sections?.konsequenzen !== false"
        class="sheet-stress-row"
      >
        <div
          v-if="isEditing || form.stressPhysical.length > 0 || form.stressMental.length > 0"
          class="stress-section"
          :class="{ 'span-full': !isEditing && sections?.konsequenzen === false }"
        >
          <template v-if="isEditing">
            <div class="stress-track-row">
              <StressTrack
                label="KÖRPERLICHER STRESS (KRAFT)"
                :boxes="form.stressPhysical"
                @update="form.stressPhysical = $event"
              />
              <div class="stress-track-controls">
                <button
                  type="button"
                  class="stress-ctrl-btn"
                  :disabled="form.stressPhysical.length === 0"
                  @click="removeStressBox('physical')"
                >
                  −
                </button>
                <button
                  type="button"
                  class="stress-ctrl-btn"
                  :disabled="form.stressPhysical.length >= 6"
                  @click="addStressBox('physical')"
                >
                  +
                </button>
              </div>
            </div>
            <div class="stress-track-row">
              <StressTrack
                label="GEISTIGER STRESS (WILLE)"
                :boxes="form.stressMental"
                @update="form.stressMental = $event"
              />
              <div class="stress-track-controls">
                <button
                  type="button"
                  class="stress-ctrl-btn"
                  :disabled="form.stressMental.length === 0"
                  @click="removeStressBox('mental')"
                >
                  −
                </button>
                <button
                  type="button"
                  class="stress-ctrl-btn"
                  :disabled="form.stressMental.length >= 6"
                  @click="addStressBox('mental')"
                >
                  +
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <StressTrack
              v-if="form.stressPhysical.length > 0"
              label="KÖRPERLICHER STRESS (KRAFT)"
              :boxes="form.stressPhysical"
              @update="form.stressPhysical = $event"
            />
            <StressTrack
              v-if="form.stressMental.length > 0"
              label="GEISTIGER STRESS (WILLE)"
              :boxes="form.stressMental"
              @update="form.stressMental = $event"
            />
          </template>
        </div>

        <section
          v-if="isEditing || sections?.konsequenzen !== false"
          class="sheet-section konsequenzen"
          :class="{ 'span-full': sections?.stress === false || (form.stressPhysical.length === 0 && form.stressMental.length === 0) }"
        >
          <div class="sheet-section-header">KONSEQUENZEN</div>
          <template v-if="isEditing">
            <div class="consequence-config">
              <span
                v-for="ct in CONSEQUENCE_TYPES"
                :key="ct.severity"
                class="consequence-config-item"
              >
                <button
                  type="button"
                  class="consequence-config-btn"
                  :disabled="countConsequences(ct.severity) === 0"
                  @click="removeConsequenceSlot(ct.severity)"
                >
                  −
                </button>
                <span class="consequence-config-label"
                  >{{ ct.label }} ({{ ct.severity }})</span
                >
                <button
                  type="button"
                  class="consequence-config-btn"
                  @click="addConsequenceSlot(ct.severity, ct.labelKey)"
                >
                  +
                </button>
              </span>
            </div>
            <ConsequenceSlots
              :consequences="form.consequences"
              @update="form.consequences = $event"
            />
          </template>
          <ConsequenceSlots v-else :consequences="data.consequences" :readonly="true" />
        </section>
      </div>

      <!-- GM-NOTIZEN -->
      <section
        v-if="gmModeStore.isGMMode && sections?.gmNotes !== false && (isEditing || data.gmNotes)"
        class="sheet-section gm-notes-section"
      >
        <div class="sheet-section-header">GM-NOTIZEN</div>
        <textarea
          v-if="isEditing"
          class="text-area-input"
          v-model="form.gmNotes"
          placeholder="Interne Notizen (nur im GM-Modus sichtbar)"
        />
        <div v-else class="text-area-display gm-notes-display">{{ data.gmNotes }}</div>
      </section>

      <!-- FORM ACTIONS (edit mode only) -->
      <div v-if="isEditing && !hideActions" class="form-actions">
        <FateButton variant="secondary" @click="emit('cancel')">Abbrechen</FateButton>
        <FateButton @click="save">Speichern</FateButton>
      </div>
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
.sheet-stress-row,
.red-blue-dice-section,
.gm-notes-section,
.form-actions {
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

/* NAME BAR (view mode) */
.character-name-bar {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.75rem;
  background: var(--fate-blue-dark);
  gap: 0.5rem;
}

.character-name-text {
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.character-name-bar-end {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
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

/* View mode field display */
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

/* Edit mode field inputs */
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

/* EXTRAS / STUNTS */
.text-area-display {
  padding: 0.5rem 0.75rem;
  min-height: 120px;
  white-space: pre-wrap;
  font-size: 0.875rem;
  color: var(--fate-text);
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

/* View mode stunt display */
.stunt-item {
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
  line-height: 1.4;
}

/* Edit mode stunt rows */
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

/* SECTION TOGGLE (NSC edit mode) */
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

/* STRESS + KONSEQUENZEN row */
.sheet-stress-row {
  display: grid;
  grid-template-columns: max-content 1fr;
}

.stress-section {
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-right: 1px solid var(--fate-border);
  min-width: 220px;
}

.konsequenzen {
  border-bottom: none;
}

/* Edit mode stress controls */
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
  width: 24px;
  height: 24px;
  border: 1px solid var(--fate-border);
  border-radius: 3px;
  background: white;
  color: var(--fate-text);
  font-size: 1rem;
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

/* CONSEQUENCE CONFIG (edit mode) */
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
  padding-right: 0.75rem;
  border-right: 1px solid var(--fate-border);
}

.consequence-config-item:last-child {
  padding-right: 0;
  border-right: none;
}

.consequence-config-btn {
  width: 24px;
  height: 24px;
  border: 1px solid var(--fate-border);
  border-radius: 3px;
  background: white;
  color: var(--fate-text);
  font-size: 1rem;
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
  font-size: 0.8rem;
  color: var(--fate-text);
  min-width: 70px;
  text-align: center;
}

/* GM notes section */
.gm-notes-section {
  background: white;
}

.gm-notes-display {
  background: transparent;
}

/* FORM ACTIONS (edit mode) */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.75rem;
  border-top: 1px solid var(--fate-border);
  background: var(--fate-blue-light);
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

/* RESPONSIVE */
@container character-card (width < 768px) {
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
    min-width: 0;
  }

  .allgemeines-grid {
    grid-template-columns: 1fr;
  }

  .allgemeines-right {
    align-items: flex-start;
    min-width: 0;
  }

  .form-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
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
    min-width: 0;
  }

  .allgemeines-grid {
    grid-template-columns: 1fr;
  }

  .allgemeines-right {
    align-items: flex-start;
    min-width: 0;
  }

  .form-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
