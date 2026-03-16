<script setup lang="ts">
const props = defineProps<{
  highConcept: string;
  trouble: string;
  aspects: string[];
  readonly?: boolean;
}>();

const emit = defineEmits<{
  'update:highConcept': [value: string];
  'update:trouble': [value: string];
  'update:aspects': [aspects: string[]];
}>();

function updateAspect(index: number, value: string) {
  const updated = [...props.aspects];
  updated[index] = value;
  emit('update:aspects', updated);
}

function onHighConceptInput(e: Event) {
  if (e.target instanceof HTMLInputElement) emit('update:highConcept', e.target.value);
}

function onTroubleInput(e: Event) {
  if (e.target instanceof HTMLInputElement) emit('update:trouble', e.target.value);
}

function onAspectInput(index: number, e: Event) {
  if (e.target instanceof HTMLInputElement) updateAspect(index, e.target.value);
}
</script>

<template>
  <div class="aspect-fields">
    <div v-if="!readonly || highConcept" class="aspect-row">
      <label class="aspect-label">Konzept</label>
      <span v-if="readonly" class="aspect-value">{{ highConcept }}</span>
      <input
        v-else
        class="aspect-input"
        :value="highConcept"
        placeholder="High Concept"
        @input="onHighConceptInput"
      />
    </div>

    <div v-if="!readonly || trouble" class="aspect-row">
      <label class="aspect-label">Dilemma</label>
      <span v-if="readonly" class="aspect-value">{{ trouble }}</span>
      <input
        v-else
        class="aspect-input"
        :value="trouble"
        placeholder="Trouble"
        @input="onTroubleInput"
      />
    </div>

    <template v-for="(aspect, i) in aspects" :key="i">
      <div v-if="!readonly || aspect" class="aspect-row">
        <label class="aspect-label"></label>
        <span v-if="readonly" class="aspect-value">{{ aspect }}</span>
        <input
          v-else
          class="aspect-input"
          :value="aspect"
          placeholder="Weiterer Aspekt"
          @input="onAspectInput(i, $event)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.aspect-fields {
  padding: 0.25rem 0;
}

.aspect-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 3px 0.75rem;
  border-bottom: 1px solid var(--fate-blue-light);
}

.aspect-row:last-child {
  border-bottom: none;
}

.aspect-label {
  font-size: 0.7rem;
  color: var(--fate-blue);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 70px;
  flex-shrink: 0;
}

.aspect-value {
  flex: 1;
  min-height: 1.4em;
  padding: 1px 2px;
  color: var(--fate-text);
}

.aspect-input {
  flex: 1;
  border: none;
  border-bottom: 1px solid var(--fate-border);
  padding: 2px 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: transparent;
  outline: none;
  width: 100%;
}

.aspect-input:focus {
  border-bottom-color: var(--fate-blue);
}
</style>
