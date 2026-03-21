<script setup lang="ts">
import ImportExportBar from '../components/shared/ImportExportBar.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import FateToggle from '../components/shared/FateToggle.vue';
import FateButton from '../components/shared/FateButton.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import { useGMModeStore } from '../stores/gmMode';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { ToggleVariant } from '@fate/types';

const gmModeStore = useGMModeStore();
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

function clearAllData() {
  showConfirmDialog(
    'Alle Daten löschen',
    'Alle Kampagnen, Charaktere, Gegenstände und Einstellungen werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
    () => {
      localStorage.clear();
      sessionStorage.clear();
      location.reload();
    },
  );
}
</script>

<template>
  <div class="settings-view list-view">
    <FateHeader title="Einstellungen" />

    <section class="settings-section">
      <h2>Oberfläche</h2>
      <div class="settings-row">
        <div class="settings-row-label">
          <span>GM-Modus-Schalter in der Navigation anzeigen</span>
          <span class="settings-row-description">Zeigt den GM-Modus-Toggle in der Navigationsleiste an.</span>
        </div>
        <FateToggle v-model="gmModeStore.showGMToggle" :variant="ToggleVariant.Danger" />
      </div>
    </section>

    <section class="settings-section">
      <h2>Daten</h2>
      <p class="settings-description">
        Exportiere alle Daten als JSON-Datei oder kopiere sie als JSON-String in die
        Zwischenablage. Importiere eine Sicherung über eine Datei oder per Einfügen.
      </p>
      <ImportExportBar />
    </section>

    <section class="settings-section settings-section--danger">
      <h2>Gefahrenzone</h2>
      <div class="settings-row">
        <div class="settings-row-label">
          <span>Alle Daten löschen</span>
          <span class="settings-row-description">Löscht alle Kampagnen, Charaktere, Gegenstände und Einstellungen unwiderruflich.</span>
        </div>
        <FateButton variant="danger" @click="clearAllData">Zurücksetzen</FateButton>
      </div>
    </section>

    <ConfirmDialog
      v-if="confirmDialog"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      @confirm="confirmDialog.onConfirm(); confirmDialog = null"
      @cancel="confirmDialog = null"
    />
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.settings-row-label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.9rem;
}

.settings-row-description {
  font-size: 0.8rem;
  color: var(--fate-text-light);
}

.settings-section--danger {
  border-color: var(--fate-red);
}

.settings-section--danger h2 {
  color: var(--fate-red);
}

@container main (max-width: 480px) {
  .settings-section {
    padding: 1rem;
  }

  .settings-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
