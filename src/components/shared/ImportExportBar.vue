<script setup lang="ts">
import { ref } from 'vue';
import { useImportExport } from '../../composables/useImportExport';
import { useToastStore } from '../../stores/toast';
import ConfirmDialog from './ConfirmDialog.vue';
import FateButton from './FateButton.vue';
import type { AppData } from '../../types';

const { exportJSON, exportToClipboard, importJSON, importFromString, applyImport } = useImportExport();
const toastStore = useToastStore();

const showConfirm = ref(false);
const pendingData = ref<AppData | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const pasteText = ref('');

function triggerImport() {
  fileInput.value?.click();
}

async function copyToClipboard() {
  try {
    await exportToClipboard();
    toastStore.show('In die Zwischenablage kopiert!');
  } catch (e) {
    toastStore.show(e instanceof Error ? e.message : 'Kopieren fehlgeschlagen', 4000, 'error');
  }
}

function onPasteImport() {
  try {
    pendingData.value = importFromString(pasteText.value);
    pasteText.value = '';
    showConfirm.value = true;
  } catch (e) {
    toastStore.show(e instanceof Error ? e.message : 'Ungültiger JSON-String', 4000, 'error');
  }
}

async function onFileSelected(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) return;
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    pendingData.value = await importJSON(file);
    showConfirm.value = true;
  } catch (e) {
    toastStore.show(e instanceof Error ? e.message : 'Unbekannter Fehler', 4000, 'error');
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
    <!-- JSON-Text -->
    <div class="io-card">
      <div class="io-card-header">
        <div class="io-card-title">JSON-Text</div>
        <FateButton
          variant="secondary"
          size="S"
          icon="copy"
          @click="copyToClipboard"
          title="Alle Daten als JSON-String kopieren"
        >
          Kopieren
        </FateButton>
      </div>
      <textarea
        v-model="pasteText"
        placeholder="JSON hier einfügen …"
        rows="5"
        class="text-import-textarea"
      />
      <FateButton variant="primary" size="S" icon="upload" @click="onPasteImport">
        Importieren
      </FateButton>
    </div>

    <!-- JSON-Datei -->
    <div class="io-card">
      <div class="io-card-title">JSON-Datei</div>
      <p class="io-card-desc">Exportiere oder importiere alle Daten als <code>.json</code>-Datei.</p>
      <div class="io-card-actions">
        <FateButton variant="secondary" size="S" icon="download" @click="exportJSON" title="Alle Daten als JSON-Datei herunterladen">
          Exportieren
        </FateButton>
        <FateButton variant="secondary" size="S" icon="upload" @click="triggerImport" title="JSON-Datei importieren">
          Importieren
        </FateButton>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".json,application/json"
      style="display: none"
      @change="onFileSelected"
    />

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
  flex-direction: column;
  gap: 0.75rem;
}

.io-card {
  background: var(--fate-bg);
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  padding: 0.75rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.io-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.io-card-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fate-blue);
}

.io-card-desc {
  font-size: 0.8rem;
  color: var(--fate-text-light);
  line-height: 1.4;
  margin: 0;
}

.io-card-desc code {
  font-family: monospace;
  font-size: 0.75rem;
  background: var(--fate-blue-light);
  color: var(--fate-blue);
  padding: 0 3px;
  border-radius: 3px;
}

.io-card-actions {
  display: flex;
  gap: 0.5rem;
}

.text-import-textarea {
  width: 100%;
  box-sizing: border-box;
  font-family: monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  padding: 0.5rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  resize: vertical;
  color: var(--fate-text);
  background: var(--fate-white);
  outline: none;
  transition: border-color 0.15s;
}

.text-import-textarea:focus {
  border-color: var(--fate-blue);
}
</style>
