<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { Consequence, ConsequenceLabel, ConsequenceSeverity, Item, Stunt } from '../../types';
import { deepClone } from '../../utils/deepClone';
import { CHARACTER_COLORS } from '../../types';
import { useGMModeStore } from '../../stores/gmMode';
import ColorPicker from '../shared/ColorPicker.vue';
import FateAvatar from '../shared/FateAvatar.vue';
import AvatarPicker from '../shared/AvatarPicker.vue';
import FateCheckbox from '../shared/FateCheckbox.vue';
import StressTrack from './StressTrack.vue';
import DiceTrack from './DiceTrack.vue';
import FateIconCounter from './FateIconCounter.vue';
import ConsequenceSlots from './ConsequenceSlots.vue';
import FateButton from '../shared/FateButton.vue';
import { useMarkdown } from '../../composables/useMarkdown';

const { renderMarkdown } = useMarkdown();

const props = defineProps<{
  item: Item;
  mode?: 'view' | 'edit';
  isNew?: boolean;
  hideActions?: boolean;
  sections?: {
    general?: boolean;
    aspects?: boolean;
    extras?: boolean;
    stunts?: boolean;
    stress?: boolean;
    gmNotes?: boolean;
    dice?: boolean;
    consequences?: boolean;
    modifiers?: boolean;
  };
}>();

const emit = defineEmits<{ save: [item: Item]; cancel: [] }>();

const gmModeStore = useGMModeStore();

const form = reactive<Item>(deepClone(props.item));
const savedSnapshot = ref(deepClone(props.item));

watch(
  () => props.item,
  (item) => {
    Object.assign(form, deepClone(item));
    savedSnapshot.value = deepClone(item);
  },
  { deep: true },
);

const isEditing = computed(() => props.mode === 'edit');
const isDirty = computed(
  () => props.isNew || JSON.stringify(form) !== JSON.stringify(savedSnapshot.value),
);
const data = computed(() => (isEditing.value ? form : props.item));

const show = computed(() => ({
  general: isEditing.value || (props.sections?.general ?? true),
  aspects: isEditing.value || (props.sections?.aspects ?? true),
  extras: isEditing.value || (props.sections?.extras ?? true),
  stunts: isEditing.value || (props.sections?.stunts ?? true),
  stress: isEditing.value || (props.sections?.stress ?? true),
  gmNotes: isEditing.value || (props.sections?.gmNotes ?? true),
  dice: isEditing.value || (props.sections?.dice ?? true),
  consequences: props.sections?.consequences !== false,
  modifiers: isEditing.value || (props.sections?.modifiers ?? true),
}));
const isItemHidden = computed(
  () => !isEditing.value && !gmModeStore.isGMMode && !!props.item.hidden,
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



const CONSEQUENCE_TYPES: { label: string; severity: ConsequenceSeverity; labelKey: ConsequenceLabel }[] = [
  { label: 'Leicht', severity: 2, labelKey: 'mild' },
  { label: 'Mittel', severity: 4, labelKey: 'moderate' },
  { label: 'Schwer', severity: 6, labelKey: 'severe' },
  { label: 'Extrem', severity: 8, labelKey: 'extreme' },
];

const visibleConsequences = computed(() =>
  (data.value.consequences ?? []).filter((c: Consequence) => c.value.trim() !== ''),
);

const hasVisibleStress = computed(
  () => show.value.stress && (isEditing.value || data.value.stressPhysical.length > 0 || data.value.stressMental.length > 0),
);

const hasVisibleConsequences = computed(
  () => isEditing.value || (show.value.consequences && visibleConsequences.value.length > 0),
);

function addConsequenceSlot(severity: ConsequenceSeverity, labelKey: ConsequenceLabel) {
  if (!form.consequences) form.consequences = [];
  const idx = form.consequences.map((c: Consequence) => c.severity).lastIndexOf(severity);
  form.consequences.splice(idx === -1 ? form.consequences.length : idx + 1, 0, {
    severity,
    label: labelKey,
    value: '',
  });
}

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

function addStressBox(track: 'physical' | 'mental') {
  const arr = track === 'physical' ? form.stressPhysical : form.stressMental;
  const nextValue = arr.length > 0 ? arr[arr.length - 1]!.value + 1 : 1;
  arr.push({ value: nextValue, checked: false });
}

function removeStressBox(track: 'physical' | 'mental') {
  const arr = track === 'physical' ? form.stressPhysical : form.stressMental;
  if (arr.length > 0) arr.pop();
}

function updateAspect(index: number, value: string) {
  form.aspects[index] = value;
}

function onAspectInput(index: number, e: Event) {
  if (e.target instanceof HTMLInputElement) updateAspect(index, e.target.value);
}

function addAspect() {
  form.aspects.push('');
}

function removeAspect(index: number) {
  form.aspects.splice(index, 1);
}

function save() {
  const saved = deepClone(form);
  emit('save', saved);
  savedSnapshot.value = saved;
}

defineExpose({ save });
</script>

<template>
  <div v-if="isItemHidden" class="item-sheet item-sheet--hidden" :style="colorVars">
    <div class="item-name-bar">
      <FateAvatar :value="props.item.avatar" />
      <span class="item-name-text">{{ props.item.name || 'Unbenannt' }}</span>
    </div>
    <div class="item-hidden-body">
      <div class="item-hidden-label">Details sind im GM-Modus sichtbar.</div>
    </div>
  </div>

  <div v-else class="item-sheet" :style="colorVars">
    <!-- Name Bar -->
    <div class="item-name-bar">
      <FateAvatar :value="data.avatar" />
      <span class="item-name-text">{{ data.name || 'Unbenannt' }}</span>
      <span v-if="!isEditing" class="item-type-badge">ITEM</span>
      <span v-if="!isEditing && data.archived" class="item-archived-badge">ARCHIVIERT</span>
      <span v-if="!isEditing && gmModeStore.isGMMode && data.hidden" class="item-hidden-badge">VERSTECKT</span>
      <div class="item-name-bar-end">
        <slot v-if="!isEditing" name="name-bar-actions" />
        <slot v-else name="edit-bar-actions" :isDirty="isDirty" />
      </div>
    </div>

    <!-- ALLGEMEINES -->
    <section v-show="show.general" class="sheet-section allgemeines">
      <div class="sheet-section-header">ALLGEMEINES</div>
      <div class="allgemeines-grid">
        <div class="allgemeines-left">
          <div class="field-row">
            <label class="field-label">Name</label>
            <input
              v-if="isEditing"
              class="field-input"
              v-model="form.name"
              placeholder="Name des Gegenstands"
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
      </div>
    </section>

    <!-- ASPEKTE -->
    <section v-if="show.aspects && (isEditing || data.aspects.some(a => a))" class="sheet-section aspekte span-full">
      <div class="sheet-section-header">ASPEKTE</div>
      <div class="aspect-fields">
        <div v-for="(aspect, i) in (isEditing ? form.aspects : data.aspects)" :key="i" class="aspect-row">
          <span v-if="!isEditing" class="aspect-value">{{ aspect }}</span>
          <template v-else>
            <input
              class="aspect-input"
              :value="aspect"
              placeholder="Aspekt"
              @input="onAspectInput(i, $event)"
            />
            <FateButton variant="danger" size="M" icon="close" @click="removeAspect(i)" />
          </template>
        </div>
        <div v-if="isEditing" class="aspect-add-row">
          <FateButton variant="secondary" size="S" class="btn-flavor" @click="addAspect">+ Aspekt</FateButton>
        </div>
      </div>
    </section>

    <!-- EXTRAS -->
    <section
      v-if="show.extras && (isEditing || data.extras?.trim())"
      class="sheet-section extras"
      :class="{ 'span-full': !isEditing && (!show.stunts || data.stunts.length === 0) }"
    >
      <div class="sheet-section-header">EXTRAS</div>
      <textarea
        v-if="isEditing"
        class="text-area-input"
        v-model="form.extras"
        placeholder="Extras beschreiben..."
      />
      <div v-else class="text-area-display markdown-content" v-html="renderMarkdown(data.extras)" />
    </section>

    <!-- STUNTS -->
    <section
      v-if="show.stunts && (isEditing || data.stunts.length > 0)"
      class="sheet-section stunts"
      :class="{ 'span-full': !isEditing && (!show.extras || !data.extras?.trim()) }"
    >
      <div class="sheet-section-header">STUNTS</div>
      <div v-if="isEditing" class="stunts-list">
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
          <FateButton icon="close" variant="danger" size="S" @click="removeStunt(i)"></FateButton>
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
    <div v-if="hasVisibleStress || hasVisibleConsequences" class="sheet-stress-row">
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
                label="KÖRPERLICHER STRESS"
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
                label="GEISTIGER STRESS"
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
            label="KÖRPERLICHER STRESS"
            :boxes="data.stressPhysical"
          />
          <StressTrack
            v-if="data.stressMental.length > 0"
            label="GEISTIGER STRESS"
            :boxes="data.stressMental"
          />
        </template>
        </div>
      </div>

      <!-- KONSEQUENZEN -->
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
            :consequences="form.consequences ?? []"
            @update="form.consequences = $event"
          />
        </template>
        <ConsequenceSlots v-else :consequences="visibleConsequences" :readonly="true" />
      </section>
    </div>

    <!-- ROTE & BLAUE WÜRFEL -->
    <section
      v-if="show.dice && (isEditing || data.redDice || data.blueDice)"
      class="sheet-section red-blue-dice-section"
    >
      <div class="sheet-section-header">ROTE &amp; BLAUE WÜRFEL</div>
      <div class="dice-tracks">
        <DiceTrack
          v-if="isEditing || data.redDice"
          label="ROTE WÜRFEL"
          color="red"
          :count="isEditing ? form.redDice : data.redDice"
          :readonly="!isEditing"
          @update="form.redDice = $event"
        />
        <DiceTrack
          v-if="isEditing || data.blueDice"
          label="BLAUE WÜRFEL"
          color="blue"
          :count="isEditing ? form.blueDice : data.blueDice"
          :readonly="!isEditing"
          @update="form.blueDice = $event"
        />
      </div>
      <p v-if="isEditing" class="dice-hint">
        Rote Würfel ersetzen beim Angriff reguläre Fate-Würfel (+1 Schaden pro +). Blaue Würfel
        ersetzen bei der Verteidigung reguläre Fate-Würfel (absorbieren 1 Schaden pro +).
      </p>
    </section>

    <!-- PURER SCHADEN & DEFLEKTION -->
    <section
      v-if="show.modifiers && (isEditing || data.pureDamage || data.deflection)"
      class="sheet-section modifiers-section"
    >
      <div class="sheet-section-header">MODIFIERS</div>
      <div class="dice-tracks">
        <FateIconCounter
          v-if="isEditing || data.pureDamage"
          label="PURER SCHADEN"
          icon="die-plus"
          :count="isEditing ? (form.pureDamage ?? 0) : (data.pureDamage ?? 0)"
          :readonly="!isEditing"
          @update="form.pureDamage = $event"
        />
        <FateIconCounter
          v-if="isEditing || data.deflection"
          label="DEFLEKTION"
          icon="die-minus"
          color="blue"
          :count="isEditing ? (form.deflection ?? 0) : (data.deflection ?? 0)"
          :readonly="!isEditing"
          @update="form.deflection = $event"
        />
      </div>
    </section>

    <!-- GM OPTIONS -->
    <section
      v-if="show.gmNotes && gmModeStore.isGMMode && (isEditing || data.gmNotes)"
      class="sheet-section gm-notes-section"
    >
      <div class="sheet-section-header">GM OPTIONS</div>
      <FateCheckbox
        v-if="isEditing"
        :modelValue="!!form.archived"
        label="Archiviert"
        @update:modelValue="form.archived = $event"
      />
      <FateCheckbox
        v-if="isEditing"
        :modelValue="!!form.hidden"
        label="Versteckt (GM-only)"
        @update:modelValue="form.hidden = $event"
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
  </div>
</template>

<style scoped>
.item-sheet {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: color-mix(in srgb, var(--fate-white) 72%, var(--fate-blue-light) 28%);
  border-radius: 6px;
  overflow: clip;
  font-size: 0.875rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.item-sheet--hidden {
  display: block;
}

.item-hidden-body {
  padding: 1rem 0.9rem;
  text-align: center;
}

.item-hidden-label {
  font-size: 0.8rem;
  color: var(--fate-text-light);
  font-style: italic;
}

.item-hidden-badge {
  background: rgba(255, 255, 255, 0.18);
  color: #fff6cf;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.item-archived-badge {
  background: rgba(255, 255, 255, 0.18);
  color: #fff6cf;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.item-type-badge {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  letter-spacing: 0.05em;
}

/* Full-width grid children */
.item-name-bar,
.allgemeines,
.sheet-stress-row,
.gm-notes-section,
.form-actions {
  grid-column: 1 / -1;
}

/* Left-column sections get a right-side divider */
.extras {
  border-right: none;
}

.span-full {
  grid-column: 1 / -1;
  border-right: none;
}

/* NAME BAR */
.item-name-bar {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.75rem;
  background: var(--fate-blue-dark);
  gap: 0.5rem;
  min-width: 0;
}

.item-name-text {
  flex: 1 1 auto;
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.item-name-bar-end {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
  flex-shrink: 0;
}

.item-type-badge {
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
  grid-template-columns: 1fr;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  align-items: start;
}

.allgemeines-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.allgemeines-grid .field-label {
  width: 110px;
  min-width: 110px;
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
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white)28%);
  border-radius: 4px;
  background: color-mix(in srgb, var(--fate-white) 90%, var(--fate-blue-light) 10%);
  min-width: 120px;
  min-height: 1.4em;
  padding: 0.3rem 0.45rem;
  color: var(--fate-text);
  font-size: 0.875rem;
}

.allgemeines-left .field-value,
.allgemeines-left .field-input {
  flex: 1 1 auto;
  min-width: 0;
}

.field-value.field-description {
  min-height: 2.8em;
  white-space: pre-wrap;
}

.field-input {
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white)28%);
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
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--fate-blue-light) 70%, var(--fate-white)30%);
}

.field-textarea {
  field-sizing: content;
  resize: vertical;
  min-height: 3em;
  padding: 0.45rem 0.55rem;
}

/* SHEET SECTION */
.sheet-section {
  background: color-mix(in srgb, var(--fate-white) 90%, var(--fate-blue-light) 10%);
}

.sheet-section-header {
  background: var(--fate-blue);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 3px 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white)28%);
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

.stunt-item {
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
  line-height: 1.4;
}

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
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white)28%);
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
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white)28%);
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

/* SECTION TOGGLE */
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
  grid-column: 1 / -1;
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
  gap: 2px;
  padding-bottom: 2px;
  flex-shrink: 0;
}

.stress-ctrl-btn {
  padding: 0;
}

/* CONSEQUENCES */
.consequences {
  border-bottom: none;
}

.consequence-config {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  overflow: hidden;
}


/* RED & BLUE DICE + MODIFIERS */
.red-blue-dice-section,
.modifiers-section {
  background: color-mix(in srgb, var(--fate-white) 90%, var(--fate-blue-light) 10%);
}

.dice-tracks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
}

.dice-hint {
  font-size: 0.78rem;
  color: var(--fate-text-light);
  margin-top: 0.5rem;
  margin-bottom: 0;
  line-height: 1.4;
  padding: 0 0.75rem 0.5rem;
}

/* GM NOTES */
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

/* FORM ACTIONS */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.75rem;
  background: color-mix(in srgb, var(--fate-white) 88%, var(--fate-blue-light) 12%);
}

/* ASPECTS */
.aspect-fields {
  padding: 0.25rem 0;
}

.aspect-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 3px 0.75rem;
  background: color-mix(in srgb, var(--fate-white) 91%, var(--fate-blue-light) 9%);
  border-bottom: 1px solid var(--fate-light-border);
}

.aspect-row:last-child {
  border-bottom: none;
}

.aspect-label {
  font-size: 0.7rem;
  color: var(--fate-blue);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 70px;
  flex-shrink: 0;
}

.aspect-value {
  flex: 1;
  min-height: 1.4em;
  padding: 1px 2px;
  color: var(--fate-text);
}

.aspect-input {
  flex: 1;
  min-width: 0;
  border: 1px solid color-mix(in srgb, var(--fate-blue-light) 72%, var(--fate-white)28%);
  border-radius: 4px;
  padding: 0.3rem 0.45rem;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: color-mix(in srgb, var(--fate-white) 94%, var(--fate-blue-light) 6%);
  outline: none;
}

.aspect-input:focus {
  border-color: var(--fate-blue);
}

.btn-flavor {
  background: var(--fate-blue) !important;
  color: white !important;
}
.btn-flavor:hover {
  background: var(--fate-blue-dark) !important;
}

.aspect-add-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  align-items: center;
}

/* RESPONSIVE */
@container character-card (width < 768px) {
  .item-sheet {
    grid-template-columns: 1fr;
  }

  .extras {
    border-right: none;
  }

  .sheet-stress-row {
    grid-template-columns: 1fr;
  }
}

@container character-card (width < 480px) {
  .form-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .form-actions .btn-label,
  .item-name-bar :deep(.btn-label) {
    display: none;
  }

  .form-actions :deep(.fate-btn),
  .item-name-bar :deep(.fate-btn) {
    padding: 0;
    width: var(--btn-size, 32px);
    justify-content: center;
  }
}

@container main (width < 768px) {
  .item-sheet {
    grid-template-columns: 1fr;
  }

  .extras {
    border-right: none;
  }

  .sheet-stress-row {
    grid-template-columns: 1fr;
  }
}

@container main (width < 480px) {
  .form-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .form-actions .btn-label,
  .item-name-bar :deep(.btn-label) {
    display: none;
  }

  .form-actions :deep(.fate-btn),
  .item-name-bar :deep(.fate-btn) {
    padding: 0;
    width: var(--btn-size, 32px);
    justify-content: center;
  }
}

:global([data-theme="dark"] .item-sheet),
:global([data-theme="dark"] .sheet-stress-row),
:global([data-theme="dark"] .gm-notes-section),
:global([data-theme="dark"] .form-actions),
:global([data-theme="dark"] .sheet-section),
:global([data-theme="dark"] .red-blue-dice-section),
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
  :global(:root:not([data-theme="light"]) .item-sheet),
  :global(:root:not([data-theme="light"]) .sheet-stress-row),
  :global(:root:not([data-theme="light"]) .gm-notes-section),
  :global(:root:not([data-theme="light"]) .form-actions),
  :global(:root:not([data-theme="light"]) .sheet-section),
  :global(:root:not([data-theme="light"]) .red-blue-dice-section),
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
