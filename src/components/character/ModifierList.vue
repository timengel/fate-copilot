<script setup lang="ts">
import type { Modifier } from '../../types';
import FateButton from '../shared/FateButton.vue';
import FateIconCounter from './FateIconCounter.vue';

const props = defineProps<{
  modifiers: Modifier[];
  editMode: boolean;
  gmMode: boolean;
}>();

const emit = defineEmits<{
  'update:modifiers': [modifiers: Modifier[]];
}>();

function updateValue(index: number, value: number) {
  const updated = props.modifiers.map((m, i) => (i === index ? { ...m, value } : m));
  emit('update:modifiers', updated);
}

function updateLabel(index: number, e: Event) {
  if (!(e.target instanceof HTMLInputElement)) return;
  const updated = props.modifiers.map((m, i) => (i === index ? { ...m, label: e.target.value } : m));
  emit('update:modifiers', updated);
}

function addModifier() {
  emit('update:modifiers', [...props.modifiers, { label: 'Neuer Modifikator', value: 0 }]);
}

function removeModifier(index: number) {
  emit('update:modifiers', props.modifiers.filter((_, i) => i !== index));
}

function isVisibleModifier(modifier: Modifier) {
  return props.editMode || modifier.value !== 0;
}
</script>

<template>
  <div class="modifier-list">
    <div
      v-for="(modifier, i) in modifiers"
      v-show="isVisibleModifier(modifier)"
      :key="i"
      class="modifier-row"
      :class="{ 'modifier-row--last-visible': i === modifiers.map((entry) => isVisibleModifier(entry)).lastIndexOf(true) }"
    >
      <div class="modifier-label-wrap">
        <div class="modifier-label-row" :class="{ 'modifier-label-row--editable': editMode }">
          <span v-if="!editMode" class="modifier-label-text">{{ modifier.label }}</span>
          <input
            v-else
            class="modifier-label-input"
            :value="modifier.label"
            @input="updateLabel(i, $event)"
          />
        </div>
        <FateButton
          v-if="editMode"
          class="modifier-remove-btn"
          variant="danger"
          size="S"
          icon="close"
          @click="removeModifier(i)"
        />
      </div>
      <FateIconCounter
        :label="modifier.label"
        :count="modifier.value"
        :min="-8"
        :max="8"
        :readonly="!editMode"
        hideLabel
        @update="updateValue(i, $event)"
      />
    </div>

    <div v-if="editMode" class="modifier-add-row">
      <FateButton variant="secondary" size="S" class="btn-add" @click="addModifier">
        + Modifikator
      </FateButton>
    </div>
  </div>
</template>

<style scoped>
.modifier-list {
  padding: 0.25rem 0;
}

.modifier-row {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--fate-light-border);
}

.modifier-row--last-visible {
  border-bottom: none;
}

.modifier-label-row {
  --editable-label-bg: color-mix(in srgb, var(--fate-blue-light) 90%, var(--fate-white) 10%);
  --editable-label-active-bg: color-mix(in srgb, var(--fate-white) 82%, var(--fate-blue-light) 18%);
  --editable-label-border: color-mix(in srgb, var(--fate-blue) 40%, transparent);
  --editable-label-border-active: color-mix(in srgb, var(--fate-blue) 72%, var(--fate-white) 28%);
  --editable-label-shadow:
    0 2px 5px color-mix(in srgb, var(--fate-blue) 12%, transparent),
    0 5px 10px color-mix(in srgb, var(--fate-blue) 8%, transparent);
  display: flex;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--fate-blue);
  background: var(--fate-blue-light);
  padding: 2px 4px;
}

.modifier-label-wrap {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.modifier-label-row--editable {
  border: 1px dashed var(--editable-label-border);
  border-radius: 4px;
  padding: 3px 6px;
  flex: 1;
  min-height: 100%;
  background: var(--editable-label-bg);
}

.modifier-label-row--editable:focus-within {
  border-color: var(--editable-label-border-active);
  background: var(--editable-label-active-bg);
  box-shadow: var(--editable-label-shadow);
}

.modifier-label-row:not(.modifier-label-row--editable) {
  flex: 1;
}

.modifier-label-text {
  flex: 1;
}

.modifier-label-input {
  flex: 1;
  align-self: stretch;
  height: 100%;
  border: none;
  padding: 0;
  font-size: inherit;
  font-weight: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  font-family: inherit;
  color: inherit;
  background: transparent;
  outline: none;
}

.modifier-remove-btn {
  align-self: stretch;
}

.modifier-remove-btn :deep(.fate-btn) {
  height: 100%;
}

.modifier-add-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  align-items: center;
}

.btn-add {
  background: var(--fate-blue) !important;
  color: white !important;
}

.btn-add:hover {
  background: var(--fate-blue-dark) !important;
}

:global([data-theme="dark"] .modifier-row) {
  background: var(--fate-white);
}

:global([data-theme="dark"] .modifier-label-row) {
  --editable-label-bg: color-mix(in srgb, var(--fate-blue) 28%, var(--fate-white) 72%);
  --editable-label-active-bg: color-mix(in srgb, var(--fate-white) 86%, var(--fate-blue) 14%);
  --editable-label-border: color-mix(in srgb, var(--fate-blue) 52%, var(--fate-white) 48%);
  --editable-label-border-active: color-mix(in srgb, var(--fate-blue) 68%, var(--fate-white) 32%);
  --editable-label-shadow:
    0 2px 6px color-mix(in srgb, var(--fate-white) 14%, transparent),
    0 6px 12px color-mix(in srgb, var(--fate-white) 8%, transparent);
  background: color-mix(in srgb, var(--fate-blue) 30%, var(--fate-white) 70%);
  color: white;
}

@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme="light"]) .modifier-row) {
    background: var(--fate-white);
  }

  :global(:root:not([data-theme="light"]) .modifier-label-row) {
    --editable-label-bg: color-mix(in srgb, var(--fate-blue) 28%, var(--fate-white) 72%);
    --editable-label-active-bg: color-mix(in srgb, var(--fate-white) 86%, var(--fate-blue) 14%);
    --editable-label-border: color-mix(in srgb, var(--fate-blue) 52%, var(--fate-white) 48%);
    --editable-label-border-active: color-mix(in srgb, var(--fate-blue) 68%, var(--fate-white) 32%);
    --editable-label-shadow:
      0 2px 6px color-mix(in srgb, var(--fate-white) 14%, transparent),
      0 6px 12px color-mix(in srgb, var(--fate-white) 8%, transparent);
    background: color-mix(in srgb, var(--fate-blue) 30%, var(--fate-white) 70%);
    color: white;
  }
}
</style>
