<script setup lang="ts">
import type { Consequence, ConsequenceLabel } from '../../types';

const props = defineProps<{
  consequences: Consequence[];
  readonly?: boolean;
}>();

const emit = defineEmits<{
  update: [consequences: Consequence[]];
}>();

const LABELS: Record<ConsequenceLabel, string> = {
  mild: 'Leicht',
  moderate: 'Mittel',
  severe: 'Schwer',
  extreme: 'Extrem',
};

function updateValue(index: number, value: string) {
  const updated = props.consequences.map((c, i) => (i === index ? { ...c, value } : c));
  emit('update', updated);
}

function onValueInput(i: number, e: Event) {
  if (e.target instanceof HTMLInputElement) updateValue(i, e.target.value);
}
</script>

<template>
  <div class="consequence-slots">
    <div v-for="(con, i) in consequences" :key="i" class="consequence-row">
      <span class="consequence-severity">{{ con.severity }}</span>
      <span class="consequence-label">{{ LABELS[con.label] }}</span>
      <span v-if="readonly" class="consequence-value">{{ con.value || '—' }}</span>
      <input
        v-else
        class="consequence-input"
        :value="con.value"
        :placeholder="`${LABELS[con.label]} Konsequenz`"
        @input="onValueInput(i, $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.consequence-slots {
  padding: 0.4rem 0.75rem;
}

.consequence-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 3px 0;
  border-bottom: 1px solid var(--fate-blue-light);
}

.consequence-row:last-child {
  border-bottom: none;
}

.consequence-severity {
  font-size: 1rem;
  font-weight: 900;
  color: var(--fate-blue);
  min-width: 20px;
  text-align: center;
}

.consequence-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--fate-blue);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 55px;
}

.consequence-value {
  flex: 1;
  font-size: 0.875rem;
  color: var(--fate-text);
  border-bottom: 1px solid var(--fate-border);
  min-height: 1.4em;
  padding: 1px 2px;
}

.consequence-input {
  flex: 1;
  border: none;
  border-bottom: 1px solid var(--fate-border);
  padding: 2px 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: transparent;
  outline: none;
}

.consequence-input:focus {
  border-bottom-color: var(--fate-blue);
}
</style>
