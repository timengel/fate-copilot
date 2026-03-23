<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { Character, ConsequenceLabel, ConsequenceSeverity, Stunt } from '../../types';
import { deepClone } from '../../utils/deepClone';
import { CHARACTER_COLORS } from '../../types';
import { useGMModeStore } from '../../stores/gmMode';
import ColorPicker from '../shared/ColorPicker.vue';
import AspectFields from './AspectFields.vue';
import SkillPyramid from './SkillPyramid.vue';
import StressTrack from './StressTrack.vue';
import ConsequenceSlots from './ConsequenceSlots.vue';
import DiceTrack from './DiceTrack.vue';
import FateIconCounter from './FateIconCounter.vue';
import FateButton from '../shared/FateButton.vue';
import FateCounter from '../shared/FateCounter.vue';
import FateAvatar from '../shared/FateAvatar.vue';
import AvatarPicker from '../shared/AvatarPicker.vue';
import FateCheckbox from '../shared/FateCheckbox.vue';
import { useMarkdown } from '../../composables/useMarkdown';

const { renderMarkdown } = useMarkdown();

// Module-level constant — not reactive, shared across all instances
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

const props = defineProps<{
  character: Character;
  mode?: 'view' | 'edit';
  isNew?: boolean;
  hideActions?: boolean;
  sections?: {
    general?: boolean;
    generalRefresh?: boolean;
    generalFatePoints?: boolean;
    aspects?: boolean;
    skills?: boolean;
    extras?: boolean;
    stunts?: boolean;
    stress?: boolean;
    consequences?: boolean;
    gmNotes?: boolean;
    dice?: boolean;
    modifiers?: boolean;
  };
}>();

const emit = defineEmits<{ save: [character: Character]; cancel: [] }>();

const gmModeStore = useGMModeStore();

const form = reactive<Character>(deepClone(props.character));
const savedSnapshot = ref(deepClone(props.character));

watch(
  () => props.character,
  (character) => {
    Object.assign(form, deepClone(character));
    savedSnapshot.value = deepClone(character);
  },
  { deep: true },
);

const isEditing = computed(() => props.mode === 'edit');
const isDirty = computed(
  () => props.isNew || JSON.stringify(form) !== JSON.stringify(savedSnapshot.value),
);

const data = computed(() => (isEditing.value ? form : props.character));
const visibleConsequences = computed(() => data.value.consequences.filter((con) => con.value.trim() !== ''));
const hasVisibleStress = computed(
  () => isEditing.value || (sectionsEnabled('stress') && (data.value.stressPhysical.length > 0 || data.value.stressMental.length > 0)),
);
const hasVisibleConsequences = computed(
  () => isEditing.value || (sectionsEnabled('consequences') && visibleConsequences.value.length > 0),
);
const hasVisibleDice = computed(
  () => isEditing.value || ((props.sections?.dice ?? true) && !!(data.value.redDice || data.value.blueDice)),
);
const hasVisibleModifiers = computed(
  () => isEditing.value || ((props.sections?.modifiers ?? true) && !!(data.value.pureDamage || data.value.deflection)),
);

function sectionsEnabled(section: 'stress' | 'consequences') {
  return props.sections?.[section] !== false;
}

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
const showExtras = ref(form.type !== 'nsc' || !!form.extras?.trim());
const showStunts = ref(form.type !== 'nsc' || form.stunts.length > 0);

watch(
  () => form.type,
  (newType) => {
    showExtras.value = newType !== 'nsc' || !!form.extras?.trim();
    showStunts.value = newType !== 'nsc' || form.stunts.length > 0;
  },
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
function addConsequenceSlot(severity: ConsequenceSeverity, labelKey: ConsequenceLabel) {
  const idx = form.consequences.map((c) => c.severity).lastIndexOf(severity);
  form.consequences.splice(idx === -1 ? form.consequences.length : idx + 1, 0, {
    severity,
    label: labelKey,
    value: '',
  });
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
  const saved = deepClone(form);
  emit('save', saved);
  savedSnapshot.value = saved;
}

defineExpose({ save });
</script>

<template>
  <div class="character-sheet" :style="colorVars">
    <!-- NSC hidden in Player View (view mode only) -->
    <template v-if="isNscHidden">
      <section class="sheet-section general">
        <div class="sheet-section-header">NSC</div>
        <div class="nsc-hidden-body">
          <div class="nsc-hidden-name">{{ data.name || 'Unbenannt' }}</div>
          <div v-if="data.highConcept" class="nsc-hidden-concept">{{ data.highConcept }}</div>
          <div class="nsc-hidden-label">Details sind im GM-Modus sichtbar.</div>
        </div>
      </section>
    </template>

    <template v-else>
      <!-- Name Bar -->
      <div class="character-name-bar">
        <FateAvatar :value="data.avatar" />
        <span class="character-name-text">{{ data.name || 'Unbenannt' }}</span>
        <span v-if="!isEditing" class="character-type-badge">{{
          data.type === 'nsc' ? 'NSC' : 'SC'
        }}</span>
        <span v-if="!isEditing && data.archived" class="character-archived-badge">ARCHIVIERT</span>
        <div class="character-name-bar-end">
          <slot v-if="!isEditing" name="name-bar-actions" />
          <slot v-else name="edit-bar-actions" :isDirty="isDirty" />
        </div>
      </div>

      <!-- ALLGEMEINES -->
      <section
        v-if="isEditing || sections?.general !== false"
        class="sheet-section general"
      >
        <div class="sheet-section-header">ALLGEMEINES</div>
        <div class="general-grid">
          <div class="general-left">
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
            <div v-if="isEditing || data.description" class="field-row field-row--multiline">
              <label class="field-label">Beschreibung</label>
              <textarea
                v-if="isEditing"
                class="field-input field-textarea"
                v-model="form.description"
                placeholder="Kurzbeschreibung"
              />
              <span v-else class="field-value field-description">{{ data.description }}</span>
            </div>
            <div v-if="isEditing" class="field-row">
              <label class="field-label">Farbe</label>
              <ColorPicker v-model="form.color" />
            </div>
            <div v-if="isEditing" class="field-row">
              <label class="field-label">Avatar</label>
              <AvatarPicker v-model="form.avatar" />
            </div>
          </div>
          <div class="general-right">
            <div
              v-if="isEditing && (sections?.generalRefresh !== false || sections?.generalFatePoints !== false)"
              class="field-stats-edit"
            >
              <div v-if="sections?.generalFatePoints !== false" class="field-stat">
                <label class="field-label">Fate-Punkte</label>
                <FateCounter v-model="form.fatePoints" />
              </div>
              <div v-if="sections?.generalRefresh !== false && form.type !== 'nsc'" class="field-stat">
                <label class="field-label">Erholungsrate</label>
                <FateCounter v-model="form.refresh" :min="1" :max="10" />
              </div>
            </div>
            <div
              v-if="!isEditing && (sections?.generalRefresh !== false || sections?.generalFatePoints !== false)"
              class="field-stats-view"
            >
              <div v-if="sections?.generalFatePoints !== false" class="field-stat">
                <span class="field-label">Fate-Punkte</span>
                <span class="field-value fate-points">{{ data.fatePoints }}</span>
              </div>
              <div v-if="sections?.generalRefresh !== false && data.type !== 'nsc'" class="field-stat">
                <span class="field-label">Erholungsrate</span>
                <span class="field-value refresh-value">{{ data.refresh }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ASPEKTE -->
      <section
        v-if="isEditing || sections?.aspects !== false"
        class="sheet-section aspects"
        :class="{ 'span-full': !isEditing && sections?.skills === false }"
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
        v-if="isEditing || sections?.skills !== false"
        class="sheet-section skills"
        :class="{ 'span-full': !isEditing && sections?.aspects === false }"
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
        v-if="isEditing || (sections?.extras !== false && data.extras?.trim())"
        class="sheet-section extras"
        :class="{ 'span-full': !isEditing && (sections?.stunts === false || data.stunts.length === 0) }"
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
        <div v-else class="text-area-display markdown-content" v-html="renderMarkdown(data.extras)" />
      </section>

      <!-- STUNTS -->
      <section
        v-if="isEditing || (sections?.stunts !== false && data.stunts.length > 0)"
        class="sheet-section stunts"
        :class="{ 'span-full': !isEditing && (sections?.extras === false || !data.extras?.trim()) }"
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
            <FateButton icon="close" variant="danger" size="S" @click="removeStunt(i)" name="close"></FateButton>
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
        v-if="hasVisibleStress || hasVisibleConsequences"
        class="sheet-stress-row"
      >
        <div
          v-if="hasVisibleStress"
          class="stress-section"
          :class="{ 'span-full': !hasVisibleConsequences }"
        >
          <div class="sheet-section-header">STRESS</div>
          <div class="stress-content">
          <template v-if="isEditing">
            <div class="stress-track-row">
              <div class="stress-track-wrap">
                <StressTrack
                  label="KÖRPERLICHER STRESS (KRAFT)"
                  :boxes="form.stressPhysical"
                  @update="form.stressPhysical = $event"
                />
              </div>
              <div class="stress-track-controls">
                <FateButton
                  class="stress-ctrl-btn"
                  variant="counter"
                  size="S"
                  icon="minus"
                  :disabled="form.stressPhysical.length === 0"
                  @click="removeStressBox('physical')"
                />
                <FateButton
                  class="stress-ctrl-btn"
                  variant="counter"
                  size="S"
                  icon="plus"
                  :disabled="form.stressPhysical.length >= 6"
                  @click="addStressBox('physical')"
                />
              </div>
            </div>
            <div class="stress-track-row">
              <div class="stress-track-wrap">
                <StressTrack
                  label="GEISTIGER STRESS (WILLE)"
                  :boxes="form.stressMental"
                  @update="form.stressMental = $event"
                />
              </div>
              <div class="stress-track-controls">
                <FateButton
                  class="stress-ctrl-btn"
                  variant="counter"
                  size="S"
                  icon="minus"
                  :disabled="form.stressMental.length === 0"
                  @click="removeStressBox('mental')"
                />
                <FateButton
                  class="stress-ctrl-btn"
                  variant="counter"
                  size="S"
                  icon="plus"
                  :disabled="form.stressMental.length >= 6"
                  @click="addStressBox('mental')"
                />
              </div>
            </div>
          </template>
          <template v-else>
            <StressTrack
              v-if="data.stressPhysical.length > 0"
              label="KÖRPERLICHER STRESS (KRAFT)"
              :boxes="data.stressPhysical"
              @update="(boxes) => { form.stressPhysical = boxes; save(); }"
            />
            <StressTrack
              v-if="data.stressMental.length > 0"
              label="GEISTIGER STRESS (WILLE)"
              :boxes="data.stressMental"
              @update="(boxes) => { form.stressMental = boxes; save(); }"
            />
          </template>
          </div>
        </div>

        <section
          v-if="hasVisibleConsequences"
          class="sheet-section consequences"
          :class="{ 'span-full': !hasVisibleStress }"
        >
          <div class="sheet-section-header">KONSEQUENZEN</div>
          <template v-if="isEditing">
            <div class="consequence-config">
              <FateButton
                v-for="ct in CONSEQUENCE_TYPES"
                :key="ct.severity"
                type="button"
                variant="secondary"
                size="S"
                icon="add"
                class="consequence-config-btn"
                @click="addConsequenceSlot(ct.severity, ct.labelKey)"
              >{{ ct.label }} ({{ ct.severity }})</FateButton>
            </div>
            <ConsequenceSlots
              :consequences="form.consequences"
              @update="form.consequences = $event"
            />
          </template>
          <ConsequenceSlots v-else :consequences="visibleConsequences" :readonly="true" />
        </section>
      </div>

      <!-- WÜRFEL -->
      <section v-if="hasVisibleDice" class="sheet-section dice-section">
        <div class="sheet-section-header">WÜRFEL</div>
        <div class="dice-tracks">
          <DiceTrack
            v-if="isEditing || data.redDice"
            label="ROTE WÜRFEL"
            color="red"
            :count="isEditing ? (form.redDice ?? 0) : (data.redDice ?? 0)"
            :readonly="!isEditing"
            @update="form.redDice = $event"
          />
          <DiceTrack
            v-if="isEditing || data.blueDice"
            label="BLAUE WÜRFEL"
            color="blue"
            :count="isEditing ? (form.blueDice ?? 0) : (data.blueDice ?? 0)"
            :readonly="!isEditing"
            @update="form.blueDice = $event"
          />
        </div>
      </section>

      <!-- PURER SCHADEN & DEFLEKTION -->
      <section v-if="hasVisibleModifiers" class="sheet-section modifiers-section">
        <div class="sheet-section-header">MODIFIERS</div>
        <div class="dice-tracks">
          <FateIconCounter
            v-if="isEditing || data.pureDamage"
            label="PURER SCHADEN"
            :count="isEditing ? (form.pureDamage ?? 0) : (data.pureDamage ?? 0)"
            :min="-8"
            :max="8"
            :readonly="!isEditing"
            @update="form.pureDamage = $event"
          />
          <FateIconCounter
            v-if="isEditing || data.deflection"
            label="DEFLEKTION"
            color="blue"
            :count="isEditing ? (form.deflection ?? 0) : (data.deflection ?? 0)"
            :min="-8"
            :max="8"
            :readonly="!isEditing"
            @update="form.deflection = $event"
          />
        </div>
      </section>

      <!-- GM OPTIONS -->
      <section
        v-if="gmModeStore.isGMMode && sections?.gmNotes !== false && (isEditing || data.gmNotes)"
        class="sheet-section gm-notes-section"
      >
        <div class="sheet-section-header">GM OPTIONS</div>
        <FateCheckbox
          v-if="isEditing"
          :modelValue="!!form.archived"
          label="Archiviert"
          @update:modelValue="form.archived = $event"
        />
        <div v-if="isEditing" class="gm-options-divider" />
        <textarea
          v-if="isEditing"
          class="text-area-input"
          v-model="form.gmNotes"
          placeholder="GM Notizen..."
        />
        <div v-else class="text-area-display gm-notes-display markdown-content" v-html="renderMarkdown(data.gmNotes)" />
      </section>

      <!-- FORM ACTIONS (edit mode only) -->
      <div v-if="isEditing && !hideActions" class="form-actions">
        <FateButton variant="secondary" icon="close" @click="emit('cancel')"><span class="btn-label">Abbrechen</span></FateButton>
        <FateButton icon="check" :disabled="!isDirty" @click="save"><span class="btn-label">Speichern</span></FateButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.character-sheet {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: color-mix(in srgb, var(--fate-white) 72%, var(--fate-blue-light) 28%);
  border-radius: 6px;
  overflow: clip;
  font-size: 0.875rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

/* Full-width grid children */
.character-name-bar,
.general,
.sheet-stress-row,
.red-blue-dice-section,
.gm-notes-section,
.form-actions {
  grid-column: 1 / -1;
}

/* Left-column sections get a right-side divider */
.aspects,
.extras {
  border-right: none;
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
  min-width: 0;
}

.character-name-text {
  flex: 1 1 auto;
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
  flex-shrink: 0;
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

.character-archived-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff6cf;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 3px;
  padding: 1px 5px;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

/* ALLGEMEINES */
.general-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  align-items: start;
}

.general-right {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem;
  min-width: 160px;
  justify-self: end;
}

.general-grid .field-label {
  width: 110px;
  min-width: 110px;
}

.general-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 3px 0;
}

.field-row--multiline {
  align-items: start;
}

.field-row--stats {
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
}

.field-stats-edit {
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  gap: 0.5rem;
}

.field-stats-view {
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  gap: 0.5rem;
}

.field-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
}

.field-row--stats .field-stat + .field-stat {
  border-left: 1px solid color-mix(in srgb, var(--fate-blue) 28%, var(--fate-white) 72%);
  padding-left: 1rem;
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
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white) 28%);
  border-radius: 4px;
  background: color-mix(in srgb, var(--fate-white) 90%, var(--fate-blue-light) 10%);
  min-width: 120px;
  min-height: 1.4em;
  padding: 0.3rem 0.45rem;
  color: var(--fate-text);
  font-size: 0.875rem;
}

.general-left .field-value {
  flex: 1 1 auto;
  min-width: 0;
}

.general .field-value {
  border: none;
  border-radius: 0;
  background: transparent;
  min-width: 0;
  padding: 0;
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
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white) 28%);
  border-radius: 4px;
  padding: 0.3rem 0.45rem;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: color-mix(in srgb, var(--fate-white) 94%, var(--fate-blue-light) 6%);
  width: 100%;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.field-input:focus {
  border-color: var(--fate-blue);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--fate-blue-light) 70%, var(--fate-white) 30%);
}

.field-textarea {
  field-sizing: content;
  resize: vertical;
  min-height: 3em;
  padding: 0.45rem 0.55rem;
}

/* EXTRAS / STUNTS */
.text-area-display {
  padding: 0.6rem 0.75rem;
  white-space: pre-wrap;
  font-size: 0.875rem;
  color: var(--fate-text);
  background: color-mix(in srgb, var(--fate-white) 90%, var(--fate-blue-light) 10%);
}

.text-area-display.markdown-content {
  white-space: normal;
}

.markdown-content :deep(p) { margin: 0 0 0.5em; }
.markdown-content :deep(p:last-child) { margin-bottom: 0; }
.markdown-content :deep(ul),
.markdown-content :deep(ol) { margin: 0.25em 0 0.5em 1.25em; padding: 0; }
.markdown-content :deep(li) { margin-bottom: 0.15em; }
.markdown-content :deep(strong) { font-weight: 600; }
.markdown-content :deep(em) { font-style: italic; }
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) { margin: 0.5em 0 0.25em; font-size: 1em; font-weight: 700; }
.markdown-content :deep(code) {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.1);
  padding: 0 3px;
  border-radius: 2px;
}

.text-area-input {
  field-sizing: content;
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white) 28%);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: color-mix(in srgb, var(--fate-white) 94%, var(--fate-blue-light) 6%);
  resize: vertical;
  outline: none;
  min-height: 80px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stunts-list {
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
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
  align-items: start;
  gap: 0.5rem;
}

.stunt-edit-fields {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.stunt-name-input {
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white) 28%);
  border-radius: 4px;
  padding: 0.3rem 0.45rem;
  font-size: 0.8rem;
  font-family: inherit;
  font-weight: 600;
  color: var(--fate-text);
  background: color-mix(in srgb, var(--fate-white) 94%, var(--fate-blue-light) 6%);
  outline: none;
  width: 100%;
}

.stunt-desc-textarea {
  field-sizing: content;
  resize: none;
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white) 28%);
  border-radius: 4px;
  padding: 0.3rem 0.45rem;
  font-size: 0.75rem;
  font-family: inherit;
  color: var(--fate-text-light);
  background: color-mix(in srgb, var(--fate-white) 94%, var(--fate-blue-light) 6%);
  outline: none;
  width: 100%;
  min-height: 1.5em;
  overflow: hidden;
}

.stunt-name-input:focus,
.stunt-desc-textarea:focus {
  border-color: var(--fate-blue);
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
  background: color-mix(in srgb, var(--fate-white) 90%, var(--fate-blue-light) 10%);
}

.stress-section {
  display: flex;
  flex-direction: column;
  min-width: 310px;
}

.stress-content {
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.consequences {
  border-bottom: none;
}

/* Edit mode stress controls */
.stress-track-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
}

.stress-track-wrap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.stress-track-controls {
  display: flex;
  flex-direction: row;
  gap: 4px;
  padding-bottom: 2px;
  flex-shrink: 0;
}

.stress-ctrl-btn {
  padding: 0;
}

/* CONSEQUENCE CONFIG (edit mode) */
.consequence-config {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  overflow: hidden;
}


/* Würfel section */
.dice-tracks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
}

/* GM notes section */
.gm-notes-section {
  background: color-mix(in srgb, var(--fate-white) 90%, var(--fate-blue-light) 10%);
}

.gm-options-divider {
  height: 1px;
  margin: 0;
  background: rgba(0, 0, 0, 0.08);
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
  background: color-mix(in srgb, var(--fate-white) 88%, var(--fate-blue-light) 12%);
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

  .aspects,
  .extras {
    border-right: none;
  }

  .sheet-stress-row {
    grid-template-columns: 1fr;
  }

  .stress-section {
    border-right: none;
    min-width: 0;
  }

  .general-grid {
    grid-template-columns: 1fr;
  }

  .general-right {
    align-items: stretch;
    min-width: 0;
    justify-self: end;
  }

  .form-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@container character-card (width < 480px) {
  .field-row {
    flex-direction: column;
    align-items: stretch;
  }

  .general-grid .field-label {
    width: auto;
    min-width: 0;
  }
}

@container character-card (width <= 325px) {
  .field-stat + .field-stat {
    border-left: none;
    padding-left: 0;
  }

  .form-actions .btn-label,
  .character-name-bar :deep(.btn-label) {
    display: none;
  }

  .form-actions :deep(.fate-btn),
  .character-name-bar :deep(.fate-btn) {
    padding: 0;
    width: var(--btn-size, 32px);
    justify-content: center;
  }
}

@container main (width < 768px) {
  .character-sheet {
    grid-template-columns: 1fr;
  }

  .aspects,
  .extras {
    border-right: none;
  }

  .sheet-stress-row {
    grid-template-columns: 1fr;
  }

  .stress-section {
    border-right: none;
    min-width: 0;
  }

  .general-grid {
    grid-template-columns: 1fr;
  }

  .general-right {
    align-items: stretch;
    min-width: 0;
    justify-self: end;
  }

  .form-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@container main (width < 480px) {
  .field-row {
    flex-direction: column;
    align-items: stretch;
  }

  .general-grid .field-label {
    width: auto;
    min-width: 0;
  }
}

@container main (width <= 325px) {
  .field-stat + .field-stat {
    border-left: none;
    padding-left: 0;
  }

  .form-actions .btn-label,
  .character-name-bar :deep(.btn-label) {
    display: none;
  }

  .form-actions :deep(.fate-btn),
  .character-name-bar :deep(.fate-btn) {
    padding: 0;
    width: var(--btn-size, 32px);
    justify-content: center;
  }
}

:global([data-theme="dark"] .character-sheet),
:global([data-theme="dark"] .sheet-stress-row),
:global([data-theme="dark"] .consequence-row-flex),
:global([data-theme="dark"] .gm-notes-section),
:global([data-theme="dark"] .form-actions),
:global([data-theme="dark"] .sheet-section),
:global([data-theme="dark"] .text-area-display),
:global([data-theme="dark"] .field-value) {
  background: var(--fate-white);
}

:global([data-theme="dark"] .field-input),
:global([data-theme="dark"] .text-area-input),
:global([data-theme="dark"] .stunt-name-input),
:global([data-theme="dark"] .stunt-desc-textarea) {
  background: var(--fate-bg);
}

@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme="light"]) .character-sheet),
  :global(:root:not([data-theme="light"]) .sheet-stress-row),
  :global(:root:not([data-theme="light"]) .consequence-row-flex),
  :global(:root:not([data-theme="light"]) .gm-notes-section),
  :global(:root:not([data-theme="light"]) .form-actions),
  :global(:root:not([data-theme="light"]) .sheet-section),
  :global(:root:not([data-theme="light"]) .text-area-display),
  :global(:root:not([data-theme="light"]) .field-value) {
    background: var(--fate-white);
  }

  :global(:root:not([data-theme="light"]) .field-input),
  :global(:root:not([data-theme="light"]) .text-area-input),
  :global(:root:not([data-theme="light"]) .stunt-name-input),
  :global(:root:not([data-theme="light"]) .stunt-desc-textarea) {
    background: var(--fate-bg);
  }
}
</style>
