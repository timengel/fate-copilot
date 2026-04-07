<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCharactersStore } from '../stores/characters';
import { useCampaignsStore } from '../stores/campaigns';
import { useItemsStore } from '../stores/items';
import { useCharacterItemsStore } from '../stores/characterItems';
import CharacterSheet from '../components/character/CharacterSheet.vue';
import FateButton from '../components/shared/FateButton.vue';
import FateCampaignSection from '../components/shared/FateCampaignSection.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import type { Character, CharacterType, Item } from '../types';
import { createDefaultCharacter } from '../composables/useCharacterDefaults';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { useToastStore } from '../stores/toast';
import { useGMModeStore } from '../stores/gmMode';
import { useSingleImportExport } from '../composables/useSingleImportExport';

const props = defineProps<{
  isNew?: boolean;
  editMode?: boolean;
}>();

const route = useRoute();
const router = useRouter();
const charactersStore = useCharactersStore();
const campaignsStore = useCampaignsStore();
const itemsStore = useItemsStore();
const characterItemsStore = useCharacterItemsStore();
const gmModeStore = useGMModeStore();

const id = computed(() => {
  const param = route.params.id;
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '');
});
const isEditing = ref(props.isNew || props.editMode || false);
const charSheetRef = ref<InstanceType<typeof CharacterSheet> | null>(null);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();
const toastStore = useToastStore();
const { copyToClipboard } = useSingleImportExport();

async function copyCharacter() {
  if (character.value) {
    await copyToClipboard(character.value);
    toastStore.show('Charakter kopiert');
  }
}

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
const characterCampaignIds = computed(() => new Set(characterCampaigns.value.map((campaign) => campaign.id)));
const persistedAssignedItemIds = computed(() =>
  character.value ? characterItemsStore.getItemsForCharacter(character.value.id).map((item) => item.id) : [],
);
const editingAssignedItemIds = ref<string[]>([]);
const initialAssignedItemIds = ref<string[]>([]);
const activeAssignedItemIds = computed(() => (isEditing.value ? editingAssignedItemIds.value : persistedAssignedItemIds.value));
const assignedItems = computed<Item[]>(() =>
  activeAssignedItemIds.value
    .map((itemId) => itemsStore.getById(itemId))
    .filter((item): item is Item => !!item),
);
const hasItemAssignmentChanges = computed(() => {
  const initial = [...initialAssignedItemIds.value].sort();
  const current = [...editingAssignedItemIds.value].sort();

  if (initial.length !== current.length) return true;

  return initial.some((itemId, index) => itemId !== current[index]);
});

function syncEditingAssignedItems() {
  const ids = [...persistedAssignedItemIds.value];
  initialAssignedItemIds.value = ids;
  editingAssignedItemIds.value = ids;
}

watch(
  [() => isEditing.value, () => character.value?.id, persistedAssignedItemIds],
  ([editing, characterId]) => {
    if (!editing) return;
    if (!characterId) {
      initialAssignedItemIds.value = [];
      editingAssignedItemIds.value = [];
      return;
    }

    syncEditingAssignedItems();
  },
  { immediate: true },
);

const availableItems = computed(() =>
  itemsStore.items
    .filter((item) => {
      if (!(gmModeStore.isGMMode || !item.hidden)) return false;
      if (activeAssignedItemIds.value.includes(item.id)) return false;
      if (characterCampaignIds.value.size === 0) return false;

      return campaignsStore
        .getCampaignsForItem(item.id)
        .some((campaign) => characterCampaignIds.value.has(campaign.id));
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'de'))
    .map((item) => ({ value: item.id, label: item.name || 'Unbenannt' })),
);

function handleSave(updated: Character) {
  if (props.isNew) {
    charactersStore.addCharacter(updated);
    router.replace(`/characters/${updated.id}`);
  } else {
    charactersStore.updateCharacter(updated);
    characterItemsStore.setItemsForCharacter(updated.id, editingAssignedItemIds.value);
    isEditing.value = false;
    if (props.editMode) router.replace(`/characters/${updated.id}`);
  }
  toastStore.show('Charakter gespeichert');
}

function handleCancel() {
  syncEditingAssignedItems();
  if (props.isNew) {
    router.push(backPath.value);
  } else {
    isEditing.value = false;
    if (props.editMode) router.replace(`/characters/${id.value}`);
  }
}

function toggleEdit() {
  if (!isEditing.value) {
    syncEditingAssignedItems();
  }
  isEditing.value = !isEditing.value;
}

function handleAssignItem(itemId: string) {
  if (!itemId || editingAssignedItemIds.value.includes(itemId)) return;
  editingAssignedItemIds.value = [...editingAssignedItemIds.value, itemId];
}

function handleUnassignItem(itemId: string) {
  editingAssignedItemIds.value = editingAssignedItemIds.value.filter((assignedItemId) => assignedItemId !== itemId);
}

function toggleArchived() {
  if (!character.value) return;
  charactersStore.updateCharacter({ ...character.value, archived: !character.value.archived });
  toastStore.show(
    character.value.archived
      ? `Charakter "${character.value.name || 'Unbenannt'}" entarchiviert`
      : `Charakter "${character.value.name || 'Unbenannt'}" archiviert`,
  );
}

function deleteCharacter() {
  if (!gmModeStore.isGMMode) return;
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

</script>

<template>
  <div class="detail-view">
    <div v-if="!character && !isNew" class="not-found">
      <p class="not-found-title">Charakter nicht gefunden</p>
      <FateButton variant="secondary" @click="router.push(backPath)">← Zurück zur Übersicht</FateButton>
    </div>

    <template v-else-if="character">
      <div class="detail-toolbar">
        <div class="back-btn">
          <FateButton variant="secondary" icon="arrow-left" @click="router.push(backPath)">Charaktere</FateButton>
        </div>
      </div>

      <CharacterSheet
        v-if="isEditing"
        ref="charSheetRef"
        mode="edit"
        :isNew="isNew"
        :key="character.id"
        :character="character"
        :hideActions="true"
        :assigned-items="assignedItems"
        :available-item-options="availableItems"
        :external-dirty="hasItemAssignmentChanges"
        @save="handleSave"
        @cancel="handleCancel"
        @assign-item="handleAssignItem"
        @unassign-item="handleUnassignItem"
      >
        <template #edit-bar-actions="{ isDirty }">
          <FateButton icon="close" variant="outline" size="M" @click="handleCancel"><span class="btn-label">Abbrechen</span></FateButton>
          <FateButton icon="check" variant="outline" size="M" :disabled="!isDirty" @click="charSheetRef?.save()"><span class="btn-label">Speichern</span></FateButton>
        </template>
      </CharacterSheet>

      <template v-else>
        <CharacterSheet :character="character">
          <template v-if="!isNew" #name-bar-actions>
            <FateButton icon="copy" variant="outline" size="M" @click="copyCharacter" />
            <FateButton
              :icon="character.archived ? 'unarchive' : 'archive'"
              variant="outline"
              size="M"
              :aria-label="character.archived ? 'Charakter entarchivieren' : 'Charakter archivieren'"
              :title="character.archived ? 'Entarchivieren' : 'Archivieren'"
              @click="toggleArchived"
            />
            <FateButton class="edit-btn" icon="edit" variant="outline" size="M" @click="toggleEdit"><span class="btn-label">Bearbeiten</span></FateButton>
            <FateButton v-if="gmModeStore.isGMMode" icon="delete" variant="danger" size="M" @click="deleteCharacter" />
          </template>
        </CharacterSheet>

        <!-- KAMPAGNEN-ZUORDNUNG -->
        <FateCampaignSection
          :assigned-campaigns="characterCampaigns"
          :available-campaigns="availableCampaigns"
          @assign="(id) => campaignsStore.assignCharacter(id, character!.id)"
          @unassign="(id) => campaignsStore.unassignCharacter(id, character!.id)"
          @navigate="(id) => router.push(`/campaigns/${id}`)"
        />
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.not-found-title {
  font-size: 1.1rem;
  color: var(--fate-text-light);
  margin: 0;
}

@container main (width < 480px) {
  .btn-label {
    display: none;
  }

  :deep(.edit-btn) {
    padding: 0;
    width: var(--btn-size, 32px);
    justify-content: center;
  }
}
</style>
