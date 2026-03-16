<script setup lang="ts">
import ImportExportBar from '../components/shared/ImportExportBar.vue';
import FateHeader from '../components/shared/FateHeader.vue';
</script>

<template>
  <div class="settings-view list-view">
    <FateHeader title="Einstellungen" />

    <section class="settings-section">
      <h2>Daten</h2>
      <p class="settings-description">
        Exportiere alle Daten als JSON-Datei oder importiere eine bestehende Sicherung.
      </p>
      <ImportExportBar />
    </section>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 600px;
}

.settings-section {
  background: var(--fate-white);
  border: 1px solid var(--fate-border);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
}

.settings-section h2 {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fate-blue);
  margin: 0 0 0.5rem;
}

.settings-description {
  font-size: 0.875rem;
  color: var(--fate-text-light);
  margin: 0 0 1rem;
}
</style>
