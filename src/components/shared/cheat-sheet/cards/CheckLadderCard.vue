<script setup lang="ts">
import { CHECK_LADDER } from '../../../../types';
</script>

<template>
  <article aria-labelledby="check-ladder-heading">
    <div class="ladder-grid" role="table" aria-label="Stufenleiter für Proben">
      <div class="ladder-head" role="row">
        <span role="columnheader">Wert</span>
        <span role="columnheader">Bezeichnung</span>
      </div>

      <div v-for="entry in CHECK_LADDER" :key="entry.value" class="ladder-row" role="row">
        <span class="ladder-value" role="cell">{{ entry.value }}</span>
        <span role="cell">{{ entry.label }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.ladder-grid {
  display: grid;
  grid-template-columns: minmax(3.75rem, auto) minmax(0, 1fr);
  border: 1px solid var(--fate-light-border);
  border-radius: 8px;
  overflow: hidden;
}

.ladder-head,
.ladder-row {
  display: contents;
}

.ladder-grid span {
  padding: 0.35rem 0.45rem;
  border-bottom: 1px solid var(--fate-light-border);
  font-size: 0.74rem;
}

.ladder-grid [role='columnheader'] {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fate-heading);
  background: color-mix(in srgb, var(--fate-blue) 8%, var(--fate-white));
}

.ladder-grid .ladder-value {
  font-weight: 700;
  color: var(--fate-heading);
}

.ladder-grid .ladder-row:nth-last-child(-n + 1) span {
  border-bottom: none;
}
</style>
