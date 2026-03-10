<script setup lang="ts">
import { ref } from 'vue'
import { useImportExport } from '../../composables/useImportExport'
import ConfirmDialog from './ConfirmDialog.vue'
import type { AppData } from '../../types'

const { exportJSON, importJSON, applyImport } = useImportExport()

const showConfirm = ref(false)
const pendingData = ref<AppData | null>(null)
const importError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInput.value?.click()
}

async function onFileSelected(event: Event) {
  importError.value = ''
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    pendingData.value = await importJSON(file)
    showConfirm.value = true
  } catch (e) {
    importError.value = e instanceof Error ? e.message : 'Unbekannter Fehler'
  } finally {
    ;(event.target as HTMLInputElement).value = ''
  }
}

function confirmImport() {
  if (pendingData.value) {
    applyImport(pendingData.value)
  }
  showConfirm.value = false
  pendingData.value = null
}

function cancelImport() {
  showConfirm.value = false
  pendingData.value = null
}
</script>

<template>
  <div class="import-export-bar">
    <button class="btn-outline" @click="exportJSON" title="Alle Daten als JSON exportieren">
      ↓ Exportieren
    </button>
    <button class="btn-outline" @click="triggerImport" title="JSON-Datei importieren">
      ↑ Importieren
    </button>
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
