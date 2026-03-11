<script setup lang="ts">
import type { StressBox } from '../../types';

const props = defineProps<{
  boxes: StressBox[];
  label: string;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  update: [boxes: StressBox[]];
}>();

function toggle(index: number) {
  if (props.readonly) return;
  const updated = props.boxes.map((b, i) => (i === index ? { ...b, checked: !b.checked } : b));
  emit('update', updated);
}
</script>

<template>
  <div class="stress-track">
    <div class="stress-label">{{ label }}</div>
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
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--fate-blue);
  background: var(--fate-blue-light);
  padding: 2px 4px;
  margin-bottom: 4px;
}

.stress-boxes {
  display: flex;
  gap: 4px;
}

.stress-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.stress-box input[type='checkbox'] {
  width: 22px;
  height: 22px;
  margin: 0;
  cursor: pointer;
  appearance: none;
  border: 2px solid var(--fate-blue);
  border-radius: 2px;
  background: white;
  position: relative;
  transition: background 0.1s;
}

.stress-box input[type='checkbox']:checked {
  background: var(--fate-blue);
}

.stress-box input[type='checkbox']:checked::after {
  content: '✕';
  position: absolute;
  color: white;
  font-size: 14px;
  font-weight: 700;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
</style>
