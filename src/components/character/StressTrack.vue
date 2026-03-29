<script setup lang="ts">
import type { StressBox } from '../../types';

const props = defineProps<{
  boxes: StressBox[];
  label: string;
  readonly?: boolean;
  editableLabel?: boolean;
}>();

const emit = defineEmits<{
  update: [boxes: StressBox[]];
  'update:label': [label: string];
}>();

function toggle(index: number) {
  if (props.readonly) return;
  const updated = props.boxes.map((b, i) => (i === index ? { ...b, checked: !b.checked } : b));
  emit('update', updated);
}

function onLabelInput(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) return;
  emit('update:label', event.target.value);
}
</script>

<template>
  <div class="stress-track">
    <div class="stress-label" :class="{ 'stress-label--editable': editableLabel }">
      <input
        v-if="editableLabel"
        class="stress-label-input"
        :value="label"
        placeholder="Stress-Titel"
        @input="onLabelInput"
      />
      <template v-else>{{ label }}</template>
    </div>
    <div class="stress-boxes">
      <label
        v-for="(box, i) in boxes"
        :key="i"
        class="stress-box"
        :class="{ checked: box.checked, readonly }"
      >
        <input type="checkbox" :checked="box.checked" :disabled="readonly" @change="toggle(i)" />
        <span class="box-value">{{ box.value }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.stress-track {
}

.stress-label {
  --editable-label-bg: color-mix(in srgb, var(--fate-blue-light) 90%, var(--fate-white) 10%);
  --editable-label-active-bg: color-mix(in srgb, var(--fate-white) 82%, var(--fate-blue-light) 18%);
  --editable-label-border: color-mix(in srgb, var(--fate-blue) 40%, transparent);
  --editable-label-border-active: color-mix(in srgb, var(--fate-blue) 72%, var(--fate-white) 28%);
  --editable-label-shadow:
    0 2px 5px color-mix(in srgb, var(--fate-blue) 12%, transparent),
    0 5px 10px color-mix(in srgb, var(--fate-blue) 8%, transparent);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--fate-blue);
  background: var(--fate-blue-light);
  padding: 2px 4px;
  margin-bottom: 4px;
}

.stress-label--editable {
  border: 1px dashed var(--editable-label-border);
  border-radius: 4px;
  padding: 3px 6px;
  background: var(--editable-label-bg);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.stress-label--editable:focus-within {
  border-color: var(--editable-label-border-active);
  background: var(--editable-label-active-bg);
  box-shadow: var(--editable-label-shadow);
}

.stress-label-input {
  width: 100%;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  padding: 0;
  outline: none;
  cursor: text;
}

.stress-label-input::placeholder {
  color: inherit;
  opacity: 0.7;
}

.stress-boxes {
  display: flex;
  gap: 4px;
  min-height: 50px;
}

.stress-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.stress-box input[type='checkbox'] {
  width: 32px;
  height: 32px;
  margin: 0;
  cursor: pointer;
  appearance: none;
  border: 3px solid var(--fate-blue);
  box-sizing: border-box;
  border-radius: 2px;
  background: var(--fate-white);
  position: relative;
  transition: background 0.1s;
}

.stress-box input[type='checkbox']:checked {
  background: var(--fate-blue);
}

.stress-box input[type='checkbox']:checked::after {
  content: '✕';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.stress-box.readonly input[type='checkbox'] {
  cursor: default;
}

.box-value {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--fate-blue);
  margin-top: 1px;
}

@container (width < 350px) {
  /* Stress-Boxen: größere Tap-Area via Padding */
  .stress-box {
    padding: 6px 4px;
  }
}

:global([data-theme="dark"] .stress-label) {
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
  :global(:root:not([data-theme="light"]) .stress-label) {
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
