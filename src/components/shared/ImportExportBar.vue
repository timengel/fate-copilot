<script setup lang="ts">
import { ref } from 'vue';
import { useImportExport } from '../../composables/useImportExport';
import ConfirmDialog from './ConfirmDialog.vue';
import FateButton from './FateButton.vue';
import type { AppData } from '../../types';

const { exportJSON, importJSON, applyImport } = useImportExport();

const showConfirm = ref(false);
const pendingData = ref<AppData | null>(null);
const importError = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

function triggerImport() {
  fileInput.value?.click();
}

async function onFileSelected(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) return;
  importError.value = '';
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    pendingData.value = await importJSON(file);
    showConfirm.value = true;
  } catch (e) {
    importError.value = e instanceof Error ? e.message : 'Unbekannter Fehler';
  } finally {
    event.target.value = '';
  }
}

function confirmImport() {
  if (pendingData.value) {
    applyImport(pendingData.value);
  }
  showConfirm.value = false;
  pendingData.value = null;
}

function cancelImport() {
  showConfirm.value = false;
  pendingData.value = null;
}
</script>

<template>
  <div class="import-export-bar">
    <FateButton variant="secondary" @click="exportJSON" title="Alle Daten als JSON exportieren"
      >↓ Exportieren</FateButton
    >
    <FateButton variant="secondary" @click="triggerImport" title="JSON-Datei importieren"
      >↑ Importieren</FateButton
    >
    <input
      ref="fileInput"
      type="file"
      accept=".json,application/json"
      style="display: none"
      @change="onFileSelected"
    />
    <span v-if="importError" class="import-error">{{ importError }}</span>

    <ConfirmDialog
      v-if="showConfirm"
      title="Daten importieren"
      message="Achtung: Der Import überschreibt alle bestehenden Daten. Möchtest du fortfahren?"
      @confirm="confirmImport"
      @cancel="cancelImport"
    />
  </div>
</template>

<style scoped>
.import-export-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.import-error {
  color: #ffe0e0;
  font-size: 0.8rem;
  max-width: 200px;
}
</style>
