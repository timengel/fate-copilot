<script setup lang="ts">
import type { ButtonIcon } from '../../types';
import FateButton from '../shared/FateButton.vue';
import FateIcon from '../shared/FateIcon.vue';

withDefaults(
  defineProps<{
    count: number;
    label: string;
    iconPositive?: ButtonIcon;
    iconNegative?: ButtonIcon;
    readonly?: boolean;
    min?: number;
    max?: number;
    color?: 'red' | 'blue';
  }>(),
  {
    iconPositive: 'die-plus',
    iconNegative: 'die-minus',
    min: 0,
    max: 8,
  },
);

const emit = defineEmits<{
  update: [count: number];
}>();
</script>

<template>
  <div class="icon-counter" :class="color">
    <div class="icon-label">{{ label }}</div>
    <div class="icon-row">
      <span class="icon-count">{{ count > 0 ? '+' + count : count }}</span>
      <FateIcon v-for="i in Math.abs(count)" :key="i" :name="count >= 0 ? iconPositive : iconNegative" :size="24" class="icon-item" />
      <div v-if="!readonly" class="icon-controls">
        <FateButton
          variant="counter"
          icon="minus"
          size="S"
          aria-label="Verringern"
          :disabled="count <= min"
          @click="emit('update', Math.max(min, count - 1))"
        />
        <FateButton
          variant="counter"
          icon="plus"
          size="S"
          aria-label="Erhöhen"
          :disabled="count >= max"
          @click="emit('update', Math.min(max, count + 1))"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-counter.red {
  --icon-color: #dc2626;
  --icon-color-light: #fee2e2;
}

.icon-counter.blue {
  --icon-color: #1480b0;
  --icon-color-light: #e8f4fb;
}

.icon-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--icon-color, var(--fate-blue));
  background: var(--icon-color-light, var(--fate-blue-light));
  padding: 2px 4px;
  margin-bottom: 4px;
}

.icon-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 32px;
  flex-wrap: wrap;
}

.icon-count {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--icon-color, var(--fate-blue));
  background: var(--icon-color-light, var(--fate-blue-light));
  border: 2px solid var(--icon-color, var(--fate-blue));
  border-radius: 4px;
  width: 32px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 4px;
}

.icon-item {
  color: var(--icon-color, var(--fate-blue));
  flex-shrink: 0;
}

.icon-controls {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

:global([data-theme='dark'] .icon-label),
:global([data-theme='dark'] .icon-count) {
  background: color-mix(in srgb, var(--icon-color, var(--fate-blue)) 30%, var(--fate-white) 70%);
  color: white;
}

@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme='light']) .icon-label),
  :global(:root:not([data-theme='light']) .icon-count) {
    background: color-mix(in srgb, var(--icon-color, var(--fate-blue)) 30%, var(--fate-white) 70%);
    color: white;
  }
}
</style>
