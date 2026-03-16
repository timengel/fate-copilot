<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCharactersStore } from '../stores/characters';
import { useCampaignsStore } from '../stores/campaigns';
import CharacterSheet from '../components/character/CharacterSheet.vue';
import FateButton from '../components/shared/FateButton.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import type { Character, CharacterType } from '../types';
import { createDefaultCharacter } from '../composables/useCharacterDefaults';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { useToastStore } from '../stores/toast';

const props = defineProps<{
  isNew?: boolean;
  editMode?: boolean;
}>();

const route = useRoute();
const router = useRouter();
const charactersStore = useCharactersStore();
const campaignsStore = useCampaignsStore();

const id = computed(() => {
  const param = route.params.id;
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '');
});
const isEditing = ref(props.isNew || props.editMode || false);
const charSheetRef = ref<InstanceType<typeof CharacterSheet> | null>(null);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();
const toastStore = useToastStore();

const character = computed(() => {
  if (props.isNew) {
    return createDefaultCharacter(queryCharacterType());
  }
  return charactersStore.getById(id.value);
});

const backPath = computed(() => {
  if (props.isNew) {
    return route.query.type === 'nsc' ? '/characters?tab=nsc' : '/characters';
  }
  return (character.value?.type ?? 'sc') === 'nsc' ? '/characters?tab=nsc' : '/characters';
});

const characterCampaigns = computed(() =>
  character.value ? campaignsStore.getCampaignsForCharacter(character.value.id) : [],
);

const availableCampaigns = computed(() =>
  campaignsStore.campaigns.filter((c) => !characterCampaigns.value.some((cc) => cc.id === c.id)),
);

function handleSave(updated: Character) {
  if (props.isNew) {
    charactersStore.addCharacter(updated);
    router.replace(`/characters/${updated.id}`);
  } else {
    charactersStore.updateCharacter(updated);
    isEditing.value = false;
    if (props.editMode) router.replace(`/characters/${updated.id}`);
  }
  toastStore.show('Charakter gespeichert');
}

function handleCancel() {
  if (props.isNew) {
    router.push(backPath.value);
  } else {
    isEditing.value = false;
    if (props.editMode) router.replace(`/characters/${id.value}`);
  }
}

function toggleEdit() {
  isEditing.value = !isEditing.value;
}

function deleteCharacter() {
  if (!character.value) return;
  showConfirmDialog(
    'Charakter löschen',
    `Charakter "${character.value.name || 'Unbenannt'}" wirklich löschen?`,
    () => {
      charactersStore.deleteCharacter(character.value!.id);
      router.push(backPath.value);
    },
  );
}

const VALID_CHARACTER_TYPES: CharacterType[] = ['sc', 'nsc'];
function isCharacterType(value: unknown): value is CharacterType {
  return VALID_CHARACTER_TYPES.some((t) => t === value);
}
function queryCharacterType(): CharacterType {
  return isCharacterType(route.query.type) ? route.query.type : 'sc';
}

function onAssignToCampaign(e: Event) {
  if (e.target instanceof HTMLSelectElement) {
    assignToCampaign(e.target.value);
    e.target.value = '';
  }
}

function assignToCampaign(campaignId: string) {
  if (!character.value) return;
  campaignsStore.assignCharacter(campaignId, character.value.id);
}

function unassignFromCampaign(campaignId: string) {
  if (!character.value) return;
  campaignsStore.unassignCharacter(campaignId, character.value.id);
}
</script>

<template>
  <div class="detail-view">
    <div v-if="!character && !isNew" class="not-found">
      Charakter nicht gefunden.
      <FateButton variant="link" @click="router.push(backPath)">← Zurück</FateButton>
    </div>

    <template v-else-if="character">
      <div class="detail-toolbar">
        <FateButton variant="link" @click="router.push(backPath)">← Charaktere</FateButton>
      </div>

      <CharacterSheet
        v-if="isEditing"
        ref="charSheetRef"
        mode="edit"
        :key="character.id"
        :character="character"
        :hideActions="true"
        @save="handleSave"
        @cancel="handleCancel"
      >
        <template #edit-bar-actions>
          <FateButton icon="close" variant="outline" size="S" @click="handleCancel">Abbrechen</FateButton>
          <FateButton icon="check" variant="outline" size="S" @click="charSheetRef?.save()">Speichern</FateButton>
        </template>
      </CharacterSheet>

      <template v-else>
        <CharacterSheet :character="character">
          <template v-if="!isNew" #name-bar-actions>
            <FateButton icon="edit" variant="outline" size="S" @click="toggleEdit">Bearbeiten</FateButton>
            <FateButton icon="delete" variant="danger" size="S" @click="deleteCharacter" />
          </template>
        </CharacterSheet>

        <!-- KAMPAGNEN-ZUORDNUNG -->
        <section class="sheet-section campaigns-section">
          <div class="sheet-section-header">KAMPAGNEN</div>
          <div class="campaign-assignments">
            <div v-if="characterCampaigns.length === 0" class="empty-text">
              Keiner Kampagne zugeordnet.
            </div>
            <div v-for="campaign in characterCampaigns" :key="campaign.id" class="assignment-row">
              <span class="assignment-name" @click="router.push(`/campaigns/${campaign.id}`)">
                {{ campaign.name }}
              </span>
              <FateButton variant="danger" size="S" @click="unassignFromCampaign(campaign.id)"
                >Entfernen</FateButton
              >
            </div>

            <div v-if="availableCampaigns.length > 0" class="assign-row">
              <select
                class="assign-select"
                @change="onAssignToCampaign"
              >
                <option value="">Kampagne zuordnen...</option>
                <option v-for="c in availableCampaigns" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>
          </div>
        </section>
      </template>
    </template>
  </div>

  <ConfirmDialog
    v-if="confirmDialog"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    @confirm="
      confirmDialog.onConfirm();
      confirmDialog = null;
    "
    @cancel="confirmDialog = null"
  />
</template>

<style scoped>
.not-found {
  padding: 2rem;
  text-align: center;
  color: var(--fate-text-light);
}

.campaigns-section {
  margin-top: 1rem;
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: hidden;
}

.campaign-assignments {
  padding: 0.5rem 0.75rem;
}

.assignment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--fate-blue-light);
}

.assignment-row:last-of-type {
  border-bottom: none;
}

.assignment-name {
  cursor: pointer;
  color: var(--fate-blue);
  font-weight: 500;
}

.assignment-name:hover {
  text-decoration: underline;
}

.assign-row {
  padding-top: 0.5rem;
}

.assign-select {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--fate-text);
  background: white;
  cursor: pointer;
}

.assign-select:focus {
  outline: none;
  border-color: var(--fate-blue);
}
</style>
