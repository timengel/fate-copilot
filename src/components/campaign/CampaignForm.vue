<script setup lang="ts">
import { reactive } from 'vue';
import type { Campaign } from '../../types';
import { deepClone } from '../../utils/deepClone';
import { getColorVars } from '../../composables/useColorVars';
import ColorPicker from '../shared/ColorPicker.vue';
import FateButton from '../shared/FateButton.vue';

const props = defineProps<{ campaign: Campaign }>();
const emit = defineEmits<{ save: [campaign: Campaign]; cancel: [] }>();

const form = reactive<Campaign>(deepClone(props.campaign));

function save() {
  if (!form.name.trim()) {
    alert('Bitte einen Kampagnennamen eingeben.');
    return;
  }
  emit('save', deepClone(form));
}
</script>

<template>
  <div class="campaign-form" :style="getColorVars(form.color)">
    <div class="form-group">
      <label class="form-label">Name *</label>
      <input class="form-control" v-model="form.name" placeholder="Kampagnenname" />
    </div>

    <div class="form-group">
      <label class="form-label">Beschreibung</label>
      <textarea
        class="form-control"
        v-model="form.description"
        placeholder="Kurzbeschreibung der Kampagne"
        rows="3"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Farbe</label>
      <ColorPicker v-model="form.color" />
    </div>

    <div class="form-group">
      <label class="form-label">Status</label>
      <select class="form-control" v-model="form.status">
        <option value="active">Aktiv</option>
        <option value="inactive">Inaktiv</option>
        <option value="completed">Abgeschlossen</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Notizen</label>
      <textarea class="form-control" v-model="form.notes" placeholder="Kampagnennotizen" rows="4" />
    </div>

    <div class="form-group">
      <label class="form-label">GM-Notizen</label>
      <textarea
        class="form-control"
        v-model="form.gmNotes"
        placeholder="Interne Notizen (nur im GM-Modus sichtbar)"
        rows="4"
      />
    </div>

    <div class="form-actions">
      <FateButton variant="secondary" icon="close" @click="emit('cancel')"><span class="btn-label">Abbrechen</span></FateButton>
      <FateButton icon="check" @click="save"><span class="btn-label">Speichern</span></FateButton>
    </div>
  </div>
</template>

<style scoped>
.campaign-form {
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  padding: 1.25rem;
  max-width: 600px;
  container-type: inline-size;
  container-name: campaign-form;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--fate-blue);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: white;
  outline: none;
}

.form-control:focus {
  border-color: var(--fate-blue);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.75rem;
}

@container campaign-form (width < 480px) {
  .form-actions .btn-label {
    display: none;
  }

  .form-actions :deep(.fate-btn) {
    padding: 0;
  }
}
</style>
