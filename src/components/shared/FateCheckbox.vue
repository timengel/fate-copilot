<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  label?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>

<template>
  <label class="fate-checkbox" @click.prevent="emit('update:modelValue', !props.modelValue)">
    <span class="checkbox-box" :class="{ 'checkbox-box--checked': modelValue }">
      <span v-if="modelValue" class="checkbox-checkmark" />
    </span>
    <span v-if="label" class="checkbox-label">{{ label }}</span>
  </label>
</template>

<style scoped>
.fate-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-box {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1.5px solid var(--fate-border);
  background: white;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.fate-checkbox:hover .checkbox-box {
  border-color: var(--fate-blue);
}

.checkbox-box--checked {
  background: var(--fate-blue);
  border-color: var(--fate-blue);
}

.checkbox-checkmark {
  position: absolute;
  top: 2px;
  left: 6px;
  width: 6px;
  height: 10px;
  border-right: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(45deg);
}

.checkbox-label {
  font-size: 0.8rem;
  color: var(--fate-text-light);
  white-space: nowrap;
}
</style>
