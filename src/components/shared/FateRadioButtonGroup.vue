<script setup lang="ts">
defineProps<{
  modelValue: string;
  options: { value: string; label: string }[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="fate-radio-group">
    <label
      v-for="option in options"
      :key="option.value"
      class="fate-radio"
      @click.prevent="emit('update:modelValue', option.value)"
    >
      <span class="radio-ring" :class="{ 'radio-ring--checked': modelValue === option.value }">
        <span v-if="modelValue === option.value" class="radio-dot" />
      </span>
      <span class="radio-label">{{ option.label }}</span>
    </label>
  </div>
</template>

<style scoped>
.fate-radio-group {
  display: flex;
  flex-direction: column;
}

.fate-radio {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  user-select: none;
}

.radio-ring {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid var(--fate-border);
  background: white;
  transition: border-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fate-radio:hover .radio-ring {
  border-color: var(--fate-blue);
}

.radio-ring--checked {
  border-color: var(--fate-blue);
}

.radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--fate-blue);
}

.radio-label {
  font-size: 0.8rem;
  color: var(--fate-text-light);
  white-space: nowrap;
}
</style>
