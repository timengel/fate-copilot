<script setup lang="ts">
import { ToggleVariant } from '../../types';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    label?: string;
    variant?: ToggleVariant;
  }>(),
  {
    variant: ToggleVariant.Primary,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>

<template>
  <label
    :class="['fate-toggle', `fate-toggle--${variant}`]"
    @click="emit('update:modelValue', !props.modelValue)"
  >
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
  letter-spacing: 0.04em;
}

.toggle-track {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  border: 1.5px solid;
  transition:
    background 0.2s,
    border-color 0.2s;
  flex-shrink: 0;
}

.toggle-knob {
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transition:
    transform 0.2s,
    background 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.toggle-track--on .toggle-knob {
  transform: translateY(-50%) translateX(16px);
}

.toggle-state {
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 2rem;
  letter-spacing: 0.04em;
  text-align: center;
}

/* === primary (light backgrounds, blue active) === */
.fate-toggle--primary .toggle-label {
  color: var(--fate-text);
}

.fate-toggle--primary .toggle-track {
  background: var(--fate-toggle-track-bg);
  border-color: var(--fate-toggle-track-border);
}

.fate-toggle--primary .toggle-track--on {
  background: var(--fate-blue);
  border-color: var(--fate-blue);
}

.fate-toggle--primary .toggle-knob {
  background: white;
}

.fate-toggle--primary .toggle-track--on .toggle-knob {
  background: white;
}

.fate-toggle--primary .toggle-state {
  color: var(--fate-text-light);
}

/* === ghost (dark/colored backgrounds, white-based) === */
.fate-toggle--ghost .toggle-label {
  color: white;
}

.fate-toggle--ghost .toggle-track {
  background: var(--fate-toggle-ghost-track);
  border-color: rgba(255, 255, 255, 0.35);
}

.fate-toggle--ghost .toggle-track--on {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.9);
}

.fate-toggle--ghost .toggle-knob {
  background: rgba(255, 255, 255, 0.7);
}

.fate-toggle--ghost .toggle-track--on .toggle-knob {
  background: var(--fate-blue-dark, #1480b0);
}

.fate-toggle--ghost .toggle-state {
  color: rgba(255, 255, 255, 0.75);
}

/* === danger (light backgrounds, red when active) === */
.fate-toggle--danger .toggle-label {
  color: var(--fate-text);
}

.fate-toggle--danger .toggle-track {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.18);
}

.fate-toggle--danger .toggle-track--on {
  background: var(--fate-red);
  border-color: var(--fate-red);
}

.fate-toggle--danger .toggle-knob {
  background: white;
}

.fate-toggle--danger .toggle-track--on .toggle-knob {
  background: white;
}

.fate-toggle--danger .toggle-state {
  color: var(--fate-text-light);
}
</style>
