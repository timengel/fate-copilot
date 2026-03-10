<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label class="fate-toggle" @click="emit('update:modelValue', !props.modelValue)">
    <span v-if="label" class="toggle-label">{{ label }}</span>
    <span class="toggle-track" :class="{ 'toggle-track--on': modelValue }">
      <span class="toggle-knob"></span>
    </span>
    <span class="toggle-state">{{ modelValue ? 'An' : 'Aus' }}</span>
  </label>
</template>

<style scoped>
.fate-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.toggle-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  letter-spacing: 0.04em;
}

.toggle-track {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: rgba(180, 180, 180, 0.4);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
}

.toggle-track--on {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.9);
}

.toggle-knob {
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  transition: transform 0.2s, background 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.toggle-track--on .toggle-knob {
  transform: translateY(-50%) translateX(16px);
  background: var(--fate-blue-dark, #1480b0);
}

.toggle-state {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  min-width: 2rem;
  letter-spacing: 0.04em;
}
</style>
