<script setup lang="ts">
export interface FateTabOption {
  value: string;
  label: string;
}

withDefaults(
  defineProps<{
    modelValue: string;
    options: ReadonlyArray<FateTabOption>;
    ariaLabel?: string;
  }>(),
  {
    ariaLabel: 'Auswahl',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="fate-tab-selector" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="fate-tab-selector__option"
      :class="{ 'fate-tab-selector__option--active': modelValue === option.value }"
      :aria-selected="modelValue === option.value"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.fate-tab-selector {
  display: inline-flex;
  gap: 0.3rem;
  width: fit-content;
  max-width: 100%;
  padding: 0.25rem;
  border-radius: 999px;
  background: var(--fate-blue-light);
}

.fate-tab-selector__option {
  appearance: none;
  border: none;
  background: transparent;
  color: var(--fate-text-light);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    box-shadow 0.15s;
}

.fate-tab-selector__option--active {
  background: var(--fate-white);
  color: var(--fate-blue-dark);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.14);
}

:global([data-theme="dark"] .fate-tab-selector__option:not(.fate-tab-selector__option--active)) {
  color: color-mix(in srgb, var(--fate-text-light) 68%, transparent);
}

@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme="light"]) .fate-tab-selector__option:not(.fate-tab-selector__option--active)) {
    color: color-mix(in srgb, var(--fate-text-light) 68%, transparent);
  }
}
</style>
