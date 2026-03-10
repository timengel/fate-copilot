<script setup lang="ts">
import type { Consequence, ConsequenceLabel } from '../../types'

const props = defineProps<{
  consequences: Consequence[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  update: [consequences: Consequence[]]
}>()

const LABELS: Record<ConsequenceLabel, string> = {
  mild: 'Leicht',
  moderate: 'Mittel',
  severe: 'Schwer',
  extreme: 'Extrem',
}

function updateValue(index: number, value: string) {
  const updated = props.consequences.map((c, i) =>
    i === index ? { ...c, value } : c
  )
  emit('update', updated)
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
        @input="updateValue(i, ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
