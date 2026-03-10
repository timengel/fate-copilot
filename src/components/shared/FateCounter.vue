<script setup lang="ts">
import type { ButtonSize } from '../../types'
import FateButton from './FateButton.vue'

withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  size?: ButtonSize
}>(), {
  min: 0,
  size: 'XS',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <div class="fate-counter">
    <FateButton variant="counter" :size="size" @click="emit('update:modelValue', Math.max(min, modelValue - 1))">−</FateButton>
    <span class="fate-counter-value">{{ modelValue }}</span>
    <FateButton variant="counter" :size="size" @click="emit('update:modelValue', max !== undefined ? Math.min(max, modelValue + 1) : modelValue + 1)">+</FateButton>
  </div>
</template>

<style scoped>
.fate-counter {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.fate-counter-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--fate-blue);
  text-align: center;
  min-width: 28px;
}
</style>
