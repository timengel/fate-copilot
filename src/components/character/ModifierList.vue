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
</script>

<template>
  <div class="modifier-list">
    <div v-for="(modifier, i) in modifiers" v-show="editMode || modifier.value !== 0" :key="i" class="modifier-row">
      <div class="modifier-label-row">
        <span v-if="!gmMode" class="modifier-label-text">{{ modifier.label }}</span>
        <input
          v-else
          class="modifier-label-input"
          :value="modifier.label"
          @input="updateLabel(i, $event)"
        />
        <FateButton
          v-if="gmMode"
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

    <div v-if="gmMode" class="modifier-add-row">
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

.modifier-label-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.modifier-label-text {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--fate-blue);
  flex: 1;
}

.modifier-label-input {
  flex: 1;
  border: none;
  border-bottom: 1px solid var(--fate-blue);
  padding: 2px 4px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: inherit;
  color: var(--fate-blue);
  background: transparent;
  outline: none;
}

.modifier-label-input:focus {
  border-bottom-color: var(--fate-blue-dark);
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

@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme="light"]) .modifier-row) {
    background: var(--fate-white);
  }
}
</style>
