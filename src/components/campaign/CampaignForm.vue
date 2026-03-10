<script setup lang="ts">
import { reactive } from 'vue'
import type { Campaign } from '../../types'
import FateButton from '../shared/FateButton.vue'

const props = defineProps<{ campaign: Campaign }>()
const emit = defineEmits<{ save: [campaign: Campaign]; cancel: [] }>()

const form = reactive<Campaign>(JSON.parse(JSON.stringify(props.campaign)))

function save() {
  if (!form.name.trim()) {
    alert('Bitte einen Kampagnennamen eingeben.')
    return
  }
  emit('save', JSON.parse(JSON.stringify(form)))
}
</script>

<template>
  <div class="campaign-form">
    <div class="form-group">
      <label class="form-label">Name *</label>
      <input class="form-control" v-model="form.name" placeholder="Kampagnenname" />
    </div>

    <div class="form-group">
      <label class="form-label">Beschreibung</label>
      <textarea class="form-control" v-model="form.description" placeholder="Kurzbeschreibung der Kampagne" rows="3" />
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

    <div class="form-actions">
      <FateButton variant="secondary" @click="emit('cancel')">Abbrechen</FateButton>
      <FateButton @click="save">Speichern</FateButton>
    </div>
  </div>
</template>
