<script setup lang="ts">
import { DropdownVariant, type ButtonSize } from '@fate/types';
import FateIcon from './FateIcon.vue';

export interface FateDropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FateDropdownGroup {
  label: string;
  options: ReadonlyArray<FateDropdownOption>;
}

withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    options?: ReadonlyArray<FateDropdownOption>;
    groups?: ReadonlyArray<FateDropdownGroup>;
    variant?: DropdownVariant;
    size?: ButtonSize;
    disabled?: boolean;
  }>(),
  {
    modelValue: '',
    placeholder: '',
    options: () => [],
    groups: () => [],
    variant: DropdownVariant.Secondary,
    size: 'M',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

function onChange(event: Event) {
  if (!(event.target instanceof HTMLSelectElement)) return;
  emit('update:modelValue', event.target.value);
  emit('change', event.target.value);
}
</script>

<template>
  <div
    :class="[
      'fate-dropdown',
      `fate-dropdown--${variant}`,
      `fate-dropdown--${size}`,
      { 'fate-dropdown--disabled': disabled },
    ]"
  >
    <select
      class="fate-dropdown__select"
      :value="modelValue"
      :disabled="disabled"
      @change="onChange"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
      <optgroup v-for="group in groups" :key="group.label" :label="group.label">
        <option
          v-for="option in group.options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </optgroup>
    </select>
    <span class="fate-dropdown__icon" aria-hidden="true">
      <FateIcon name="chevron-right" :size="16" />
    </span>
  </div>
</template>

<style scoped>
.fate-dropdown {
  --dropdown-bg: var(--fate-btn-secondary-bg);
  --dropdown-bg-hover: var(--fate-btn-secondary-hover);
  --dropdown-fg: var(--fate-text);
  --dropdown-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  --btn-size: 32px;
  --dropdown-padding-x: 1rem;
  --dropdown-min-width: 13rem;
  --dropdown-max-width: min(100%, 24rem);

  position: relative;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-width: var(--dropdown-min-width);
  max-width: var(--dropdown-max-width);
  border-radius: 4px;
  background: var(--dropdown-bg);
  color: var(--dropdown-fg);
  font-weight: 500;
  box-shadow: var(--dropdown-shadow);
  transition:
    background 0.15s,
    opacity 0.15s,
    box-shadow 0.15s;
}

.fate-dropdown:hover {
  background: var(--dropdown-bg-hover);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.fate-dropdown__select {
  appearance: none;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: inherit;
  line-height: normal;
  width: 100%;
  min-width: 0;
  height: var(--btn-size);
  padding: 0 var(--dropdown-padding-x);
  padding-right: calc(var(--dropdown-padding-x) + 1.5rem);
  cursor: pointer;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.fate-dropdown__icon {
  position: absolute;
  right: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transform: rotate(90deg);
}

.fate-dropdown__select:disabled {
  cursor: not-allowed;
}

.fate-dropdown--disabled {
  opacity: 0.4;
  pointer-events: none;
}

.fate-dropdown--primary {
  --dropdown-bg: var(--fate-blue);
  --dropdown-bg-hover: var(--fate-blue-dark);
  --dropdown-fg: white;
}

.fate-dropdown--secondary {
  --dropdown-bg: var(--fate-btn-secondary-bg);
  --dropdown-bg-hover: var(--fate-btn-secondary-hover);
  --dropdown-fg: var(--fate-text);
}

.fate-dropdown--danger-outline {
  --dropdown-bg: var(--fate-btn-danger-outline-bg);
  --dropdown-bg-hover: var(--fate-btn-danger-outline-hover);
  --dropdown-fg: var(--fate-red);
}

.fate-dropdown--danger {
  --dropdown-bg: var(--fate-red);
  --dropdown-bg-hover: var(--fate-btn-danger-hover);
  --dropdown-fg: white;
}

.fate-dropdown--add {
  --dropdown-bg: var(--fate-blue-light);
  --dropdown-bg-hover: color-mix(in srgb, var(--fate-blue-light) 60%, var(--fate-blue) 40%);
  --dropdown-fg: var(--fate-blue);
}

.fate-dropdown--outline {
  --dropdown-bg: rgba(255, 255, 255, 0.15);
  --dropdown-bg-hover: rgba(255, 255, 255, 0.28);
  --dropdown-fg: white;
  --dropdown-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.fate-dropdown--subtle {
  --dropdown-bg: transparent;
  --dropdown-bg-hover: rgba(0, 0, 0, 0.06);
  --dropdown-fg: var(--fate-text-light);
  --dropdown-shadow: none;
  border: 1px solid var(--fate-border);
}

.fate-dropdown--ghost {
  --dropdown-bg: transparent;
  --dropdown-bg-hover: transparent;
  --dropdown-fg: var(--fate-text);
  --dropdown-shadow: none;
}

.fate-dropdown--link {
  --dropdown-bg: transparent;
  --dropdown-bg-hover: transparent;
  --dropdown-fg: var(--fate-blue);
  --dropdown-shadow: none;
}

.fate-dropdown--XS {
  --btn-size: 20px;
  --dropdown-padding-x: 0.3rem;
  font-size: 0.7rem;
}

.fate-dropdown--S {
  --btn-size: 24px;
  --dropdown-padding-x: 0.6rem;
  font-size: 0.8rem;
}

.fate-dropdown--M {
  --btn-size: 32px;
  --dropdown-padding-x: 1rem;
  font-size: 0.875rem;
}

.fate-dropdown--L {
  --btn-size: 40px;
  --dropdown-padding-x: 1.25rem;
  font-size: 1rem;
}

.fate-dropdown--XL {
  --btn-size: 48px;
  --dropdown-padding-x: 1.6rem;
  font-size: 1.1rem;
}

.fate-dropdown--XXL {
  --btn-size: 56px;
  --dropdown-padding-x: 2rem;
  font-size: 1.2rem;
}
</style>
