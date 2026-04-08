<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { Campaign } from '../../types';
import { deepClone } from '../../utils/deepClone';
import { getColorVars } from '../../composables/useColorVars';
import { useGMModeStore } from '../../stores/gmMode';
import AvatarPicker from '../shared/AvatarPicker.vue';
import ColorPicker from '../shared/ColorPicker.vue';
import FateAvatar from '../shared/FateAvatar.vue';
import FateButton from '../shared/FateButton.vue';

const gmModeStore = useGMModeStore();

const props = defineProps<{ campaign: Campaign; isNew?: boolean }>();
const emit = defineEmits<{ save: [campaign: Campaign]; cancel: [] }>();

const form = reactive<Campaign>(deepClone(props.campaign));
const savedSnapshot = ref(deepClone(props.campaign));

watch(
  () => props.campaign,
  (campaign) => {
    Object.assign(form, deepClone(campaign));
    savedSnapshot.value = deepClone(campaign);
  },
  { deep: true },
);

const isDirty = computed(
  () => props.isNew || JSON.stringify(form) !== JSON.stringify(savedSnapshot.value),
);

function save() {
  if (!form.name.trim()) {
    alert('Bitte einen Kampagnennamen eingeben.');
    return;
  }
  const saved = deepClone(form);
  emit('save', saved);
  savedSnapshot.value = saved;
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
      <label class="form-label">Avatar</label>
      <div class="avatar-field">
        <FateAvatar :value="form.avatar" :background="getColorVars(form.color)['--fate-blue']" />
        <AvatarPicker v-model="form.avatar" />
      </div>
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
      <label class="form-label" for="campaign-notes">Notizen</label>
      <textarea
        id="campaign-notes"
        name="notes"
        class="form-control form-control--notes"
        v-model="form.notes"
        placeholder="Kampagnennotizen"
        rows="8"
      />
    </div>

    <div class="form-actions">
      <FateButton variant="secondary" icon="close" @click="emit('cancel')"
        ><span class="btn-label">Abbrechen</span></FateButton
      >
      <FateButton icon="check" :disabled="!isDirty" @click="save"
        ><span class="btn-label">Speichern</span></FateButton
      >
    </div>
  </div>
</template>

<style scoped>
.campaign-form {
  background: var(--fate-white);
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
  background: var(--fate-white);
  outline: none;
}

.form-control:focus {
  border-color: var(--fate-blue);
}

.form-control--notes {
  min-height: 20rem;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.75rem;
}

.avatar-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-field :deep(.avatar-picker) {
  flex: 1;
}

@container campaign-form (width < 480px) {
  .form-actions .btn-label {
    display: none;
  }

  .form-actions :deep(.fate-btn) {
    padding: 0;
    width: var(--btn-size, 32px);
    justify-content: center;
  }
}
</style>
