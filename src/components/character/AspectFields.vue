<script setup lang="ts">
const props = defineProps<{
  highConcept: string
  trouble: string
  aspects: string[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:highConcept': [value: string]
  'update:trouble': [value: string]
  'update:aspects': [aspects: string[]]
}>()

function updateAspect(index: number, value: string) {
  const updated = [...props.aspects]
  updated[index] = value
  emit('update:aspects', updated)
}
</script>

<template>
  <div class="aspect-fields">
    <div class="aspect-row">
      <label class="aspect-label">Konzept</label>
      <span v-if="readonly" class="aspect-value">{{ highConcept || '—' }}</span>
      <input
        v-else
        class="aspect-input"
        :value="highConcept"
        placeholder="High Concept"
        @input="emit('update:highConcept', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="aspect-row">
      <label class="aspect-label">Dilemma</label>
      <span v-if="readonly" class="aspect-value">{{ trouble || '—' }}</span>
      <input
        v-else
        class="aspect-input"
        :value="trouble"
        placeholder="Trouble"
        @input="emit('update:trouble', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div v-for="(aspect, i) in aspects" :key="i" class="aspect-row">
      <label class="aspect-label"></label>
      <span v-if="readonly" class="aspect-value">{{ aspect || '—' }}</span>
      <input
        v-else
        class="aspect-input"
        :value="aspect"
        placeholder="Weiterer Aspekt"
        @input="updateAspect(i, ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
