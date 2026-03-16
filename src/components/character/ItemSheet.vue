<script setup lang="ts">
import { computed, reactive, toRaw, watch } from 'vue';
import type { Item, Stunt } from '../../types';
import { CHARACTER_COLORS } from '../../types';
import { useGMModeStore } from '../../stores/gmMode';
import ColorPicker from '../shared/ColorPicker.vue';
import StressTrack from './StressTrack.vue';
import DiceTrack from './DiceTrack.vue';
import FateButton from '../shared/FateButton.vue';

const props = defineProps<{
  item: Item;
  mode?: 'view' | 'edit';
  hideActions?: boolean;
}>();

const emit = defineEmits<{ save: [item: Item]; cancel: [] }>();

const gmModeStore = useGMModeStore();

const form = reactive<Item>(structuredClone(toRaw(props.item)));

watch(
  () => props.item,
  (item) => {
    Object.assign(form, structuredClone(toRaw(item)));
  },
  { deep: true },
);

const isEditing = computed(() => props.mode === 'edit');
const data = computed(() => (isEditing.value ? form : props.item));

const colorVars = computed(() => {
  const found = CHARACTER_COLORS.find((c) => c.id === (data.value.color ?? 'pfau'));
  const c = found ?? CHARACTER_COLORS[0]!;
  return {
    '--fate-blue': c.primary,
    '--fate-blue-dark': c.dark,
    '--fate-blue-light': c.light,
  };
});



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
  emit('save', structuredClone(toRaw(form)));
}

defineExpose({ save });
</script>

<template>
  <div class="item-sheet" :style="colorVars">
    <!-- Name Bar -->
    <div class="item-name-bar">
      <span class="item-name-text">{{ data.name || '(Unbenannt)' }}</span>
      <span v-if="!isEditing" class="item-type-badge">ITEM</span>
      <div class="item-name-bar-end">
        <slot v-if="!isEditing" name="name-bar-actions" />
        <slot v-else name="edit-bar-actions" />
      </div>
    </div>

    <!-- ALLGEMEINES -->
    <section class="sheet-section allgemeines">
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
      </div>
    </section>

    <!-- ASPEKTE -->
    <section v-if="isEditing || data.aspects.some(a => a)" class="sheet-section aspekte span-full">
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
            <FateButton variant="danger" size="S" @click="removeAspect(i)">✕</FateButton>
          </template>
        </div>
        <div v-if="isEditing" class="aspect-add-row">
          <FateButton variant="secondary" size="S" class="btn-flavor" @click="addAspect">+ Aspekt</FateButton>
        </div>
      </div>
    </section>

    <!-- EXTRAS -->
    <section v-if="isEditing || data.extras?.trim()" class="sheet-section extras">
      <div class="sheet-section-header">EXTRAS</div>
      <textarea
        v-if="isEditing"
        class="text-area-input"
        v-model="form.extras"
        placeholder="Extras beschreiben..."
      />
      <div v-else class="text-area-display">{{ data.extras || '' }}</div>
    </section>

    <!-- STUNTS -->
    <section v-if="isEditing || data.stunts.length > 0" class="sheet-section stunts">
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

    <!-- STRESS -->
    <div v-if="isEditing || data.stressPhysical.length > 0 || data.stressMental.length > 0" class="sheet-stress-row">
      <div class="stress-section span-full">
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
            <div class="stress-track-wrap">
              <StressTrack
                label="GEISTIGER STRESS"
                :boxes="form.stressMental"
                @update="form.stressMental = $event"
              />
            </div>
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
    </div>

    <!-- ROTE & BLAUE WÜRFEL -->
    <section
      v-if="isEditing || data.redDice || data.blueDice"
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

    <!-- GM-NOTIZEN -->
    <section
      v-if="gmModeStore.isGMMode && (isEditing || data.gmNotes)"
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
      <FateButton variant="secondary" icon="close" @click="emit('cancel')"><span class="btn-label">Abbrechen</span></FateButton>
      <FateButton icon="check" @click="save"><span class="btn-label">Speichern</span></FateButton>
    </div>
  </div>
</template>

<style scoped>
.item-sheet {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: clip;
  font-size: 0.875rem;
}

/* Full-width grid children */
.item-name-bar,
.allgemeines,
.sheet-stress-row,
.red-blue-dice-section,
.gm-notes-section,
.form-actions {
  grid-column: 1 / -1;
}

/* Left-column sections get a right-side divider */
.extras {
  border-right: 1px solid var(--fate-border);
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
}

.item-name-text {
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

/* SHEET SECTION */
.sheet-section {
  border-bottom: 1px solid var(--fate-border);
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
  padding: 0.5rem 0.75rem;
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
}

.stunt-item {
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
  line-height: 1.4;
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

/* STRESS */
.sheet-stress-row {
  grid-column: 1 / -1;
  border-bottom: 1px solid var(--fate-border);
}

.stress-section {
  display: flex;
  flex-direction: column;
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

/* RED & BLUE DICE */
.red-blue-dice-section {
  background: white;
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
  background: white;
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
  border-top: 1px solid var(--fate-border);
  background: var(--fate-blue-light);
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
  border-bottom: 1px solid var(--fate-blue-light);
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
  border: none;
  border-bottom: 1px solid var(--fate-border);
  padding: 2px 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: transparent;
  outline: none;
}

.aspect-input:focus {
  border-bottom-color: var(--fate-blue);
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
}

@container character-card (width < 480px) {
  .form-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .form-actions .btn-label {
    display: none;
  }

  .form-actions :deep(.fate-btn) {
    padding: 0;
    width: 32px;
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
}

@container main (width < 480px) {
  .form-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .form-actions .btn-label {
    display: none;
  }

  .form-actions :deep(.fate-btn) {
    padding: 0;
    width: 32px;
    justify-content: center;
  }
}
</style>
