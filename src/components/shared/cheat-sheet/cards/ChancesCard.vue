<script setup lang="ts">
const CHANCES_TABLE = [
  { result: '0', chance: '23,46 %' },
  { result: '+/-1', chance: '19,75 %' },
  { result: '+/-2', chance: '12,35 %' },
  { result: '+/-3', chance: '4,94 %' },
  { result: '+/-4', chance: '1,23 %' },
] as const;
</script>

<template>
  <article>
    <table class="chances-table" aria-label="Wahrscheinlichkeiten für 4dF">
      <thead>
        <tr>
          <th scope="col">Wurf</th>
          <th scope="col">Chance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in CHANCES_TABLE" :key="entry.result">
          <td class="chances-value">{{ entry.result }}</td>
          <td>{{ entry.chance }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>

<style scoped>
.chances-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--fate-light-border);
  border-radius: 8px;
  overflow: hidden;
}

.chances-table th,
.chances-table td {
  padding: 0.35rem 0.45rem;
  border-bottom: 1px solid var(--fate-light-border);
  text-align: left;
  font-size: 0.74rem;
  line-height: 1.2;
}

.chances-table th {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fate-heading);
  background: color-mix(in srgb, var(--fate-blue) 8%, var(--fate-white));
}

.chances-table tbody tr:last-child td {
  border-bottom: 0;
}

.chances-value {
  font-weight: 700;
  color: var(--fate-heading);
}
</style>
