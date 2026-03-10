<script setup lang="ts">
import FateButton from './FateButton.vue'

withDefaults(defineProps<{
  modelValue: number
  min?: number
}>(), {
  min: 0,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <div class="fate-counter">
    <FateButton variant="counter" @click="emit('update:modelValue', Math.max(min, modelValue - 1))">−</FateButton>
    <span class="fate-counter-value">{{ modelValue }}</span>
    <FateButton variant="counter" @click="emit('update:modelValue', modelValue + 1)">+</FateButton>
  </div>
</template>

<style scoped>
.fate-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fate-counter-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--fate-blue);
  text-align: center;
  min-width: 40px;
}
</style>
