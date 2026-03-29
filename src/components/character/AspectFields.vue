<script setup lang="ts">
import FateButton from '../shared/FateButton.vue';

const props = withDefaults(
  defineProps<{
    highConcept: string;
    trouble: string;
    aspects: string[];
    readonly?: boolean;
    withHighConcept?: boolean;
  }>(),
  { withHighConcept: true },
);

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

function addAspect() {
  emit('update:aspects', [...props.aspects, '']);
}

function removeAspect(index: number) {
  emit('update:aspects', props.aspects.filter((_, i) => i !== index));
}
</script>

<template>
  <div class="aspect-fields">
    <template v-if="withHighConcept">
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
    </template>

    <template v-for="(aspect, i) in aspects" :key="i">
      <div v-if="!readonly || aspect" class="aspect-row">
        <label v-if="withHighConcept" class="aspect-label"></label>
        <span v-if="readonly" class="aspect-value">{{ aspect }}</span>
        <template v-else>
          <input
            class="aspect-input"
            :value="aspect"
            placeholder="Weiterer Aspekt"
            @input="onAspectInput(i, $event)"
          />
          <FateButton variant="danger" size="S" icon="close" @click="removeAspect(i)" />
        </template>
      </div>
    </template>

    <div v-if="!readonly" class="aspect-add-row">
      <FateButton variant="secondary" size="S" class="btn-flavor" @click="addAspect">+ Aspekt</FateButton>
    </div>
  </div>
</template>

<style scoped>
.aspect-fields {
  padding: 0.25rem 0;
}

.aspect-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 3px 0.75rem;
  border-bottom: 1px solid var(--fate-light-border);
}

.aspect-row:last-child,
.aspect-row:has(+ .aspect-add-row) {
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

.aspect-add-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  align-items: center;
}

.btn-flavor {
  background: var(--fate-blue) !important;
  color: white !important;
}

.btn-flavor:hover {
  background: var(--fate-blue-dark) !important;
}

:global([data-theme="dark"] .aspect-row) {
  background: var(--fate-white);
}

@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme="light"]) .aspect-row) {
    background: var(--fate-white);
  }
}
</style>
