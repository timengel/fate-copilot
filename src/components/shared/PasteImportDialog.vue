<script setup lang="ts">
import { ref } from 'vue';
import type { Character, Item } from '../../types';
import { useSingleImportExport } from '../../composables/useSingleImportExport';
import FateButton from './FateButton.vue';

const props = defineProps<{
  entityType: 'character' | 'item';
}>();

const emit = defineEmits<{
  import: [entity: Character | Item];
  cancel: [];
}>();

const { parseCharacter, parseItem } = useSingleImportExport();

const jsonInput = ref('');
const errorMessage = ref('');

function handleImport() {
  errorMessage.value = '';
  try {
    const entity =
      props.entityType === 'character'
        ? parseCharacter(jsonInput.value)
        : parseItem(jsonInput.value);
    emit('import', entity);
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Unbekannter Fehler.';
  }
}
</script>

<template>
  <div class="dialog-overlay" @click.self="emit('cancel')">
    <div class="dialog-box">
      <div class="dialog-title">
        {{ entityType === 'character' ? 'Charakter importieren' : 'Gegenstand importieren' }}
      </div>
      <div class="dialog-message">
        JSON einfügen (z. B. von einer KI generiert):
      </div>
      <textarea
        v-model="jsonInput"
        class="json-input"
        placeholder='{ "name": "...", "type": "sc", ... }'
        spellcheck="false"
        @keydown.stop
      />
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div class="dialog-actions">
        <FateButton icon="close" variant="secondary" @click="emit('cancel')">Abbrechen</FateButton>
        <FateButton icon="paste" :disabled="!jsonInput.trim()" @click="handleImport">Importieren</FateButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-box {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 560px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--fate-text);
}

.dialog-message {
  font-size: 0.9rem;
  color: var(--fate-text-light);
}

.json-input {
  width: 100%;
  min-height: 180px;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
  color: var(--fate-text);
  background: #fafafa;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.json-input:focus {
  border-color: var(--fate-blue);
}

.error-message {
  font-size: 0.85rem;
  color: var(--fate-red, #e53935);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
