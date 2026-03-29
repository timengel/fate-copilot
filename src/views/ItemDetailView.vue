<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import { useCampaignsStore } from '../stores/campaigns';
import { useCharactersStore } from '../stores/characters';
import { useCharacterItemsStore } from '../stores/characterItems';
import ItemSheet from '../components/character/ItemSheet.vue';
import FateButton from '../components/shared/FateButton.vue';
import FateCampaignSection from '../components/shared/FateCampaignSection.vue';
import FateEntityAssignmentSection from '../components/shared/FateEntityAssignmentSection.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import type { Item } from '../types';
import { createDefaultItem } from '../composables/useCharacterDefaults';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { useToastStore } from '../stores/toast';
import { useGMModeStore } from '../stores/gmMode';
import { useSingleImportExport } from '../composables/useSingleImportExport';
import { getColorVars } from '../composables/useColorVars';

const props = defineProps<{
  isNew?: boolean;
  editMode?: boolean;
}>();

const route = useRoute();
const router = useRouter();
const itemsStore = useItemsStore();
const campaignsStore = useCampaignsStore();
const charactersStore = useCharactersStore();
const characterItemsStore = useCharacterItemsStore();
const gmModeStore = useGMModeStore();

const id = computed(() => route.params.id as string);
const isEditing = ref(props.isNew || props.editMode || false);
const itemSheetRef = ref<InstanceType<typeof ItemSheet> | null>(null);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();
const toastStore = useToastStore();
const { copyToClipboard } = useSingleImportExport();

async function copyItem() {
  if (item.value) {
    await copyToClipboard(item.value);
    toastStore.show('Gegenstand kopiert');
  }
}

const item = computed(() => {
  if (props.isNew) return createDefaultItem();
  return itemsStore.getById(id.value);
});

const itemCampaigns = computed(() =>
  item.value && !props.isNew ? campaignsStore.getCampaignsForItem(item.value.id) : [],
);

const availableCampaigns = computed(() =>
  campaignsStore.campaigns.filter((c) => !itemCampaigns.value.some((ic) => ic.id === c.id)),
);
const itemCharacters = computed(() =>
  item.value && !props.isNew
    ? characterItemsStore
        .getCharactersForItem(item.value.id)
        .filter((character) => gmModeStore.isGMMode || character.type !== 'nsc')
        .map((character) => ({
          id: character.id,
          name: character.name || 'Unbenannt',
          subtitle: character.highConcept,
          avatar: character.avatar,
          color: getColorVars(character.color)['--fate-blue'],
        }))
    : [],
);
const availableCharacters = computed(() =>
  charactersStore.characters
    .filter((character) => (gmModeStore.isGMMode || character.type !== 'nsc') && !itemCharacters.value.some((assigned) => assigned.id === character.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'de'))
    .map((character) => ({ value: character.id, label: character.name || 'Unbenannt' })),
);

function handleSave(updated: Item) {
  if (props.isNew) {
    itemsStore.addItem(updated);
    router.replace(`/items/${updated.id}`);
  } else {
    itemsStore.updateItem(updated);
    isEditing.value = false;
    if (props.editMode) router.replace(`/items/${updated.id}`);
  }
  toastStore.show('Gegenstand gespeichert');
}

function handleCancel() {
  if (props.isNew) {
    router.push('/items');
  } else {
    isEditing.value = false;
    if (props.editMode) router.replace(`/items/${id.value}`);
  }
}

function toggleArchived() {
  if (!item.value) return;
  itemsStore.updateItem({ ...item.value, archived: !item.value.archived });
  toastStore.show(
    item.value.archived
      ? `Gegenstand "${item.value.name || 'Unbenannt'}" entarchiviert`
      : `Gegenstand "${item.value.name || 'Unbenannt'}" archiviert`,
  );
}

function deleteItem() {
  if (!item.value) return;
  showConfirmDialog(
    'Gegenstand löschen',
    `Gegenstand "${item.value.name || 'Unbenannt'}" wirklich löschen?`,
    () => {
      itemsStore.deleteItem(item.value!.id);
      router.push('/items');
    },
  );
}
</script>

<template>
  <div class="detail-view">
    <div v-if="!item && !isNew" class="not-found">
      <p class="not-found-title">Gegenstand nicht gefunden</p>
      <FateButton variant="secondary" @click="router.push('/items')">← Zurück zur Übersicht</FateButton>
    </div>

    <template v-else-if="item">
      <div class="detail-toolbar">
        <div class="back-btn">
          <FateButton variant="secondary" icon="arrow-left" @click="router.push('/items')">Gegenstände</FateButton>
        </div>
      </div>

      <ItemSheet
        v-if="isEditing"
        ref="itemSheetRef"
        mode="edit"
        :isNew="isNew"
        :key="item.id"
        :item="item"
        :hideActions="true"
        @save="handleSave"
        @cancel="handleCancel"
      >
        <template #edit-bar-actions="{ isDirty }">
          <FateButton icon="close" variant="outline" size="M" @click="handleCancel"><span class="btn-label">Abbrechen</span></FateButton>
          <FateButton icon="check" variant="outline" size="M" :disabled="!isDirty" @click="itemSheetRef?.save()"><span class="btn-label">Speichern</span></FateButton>
        </template>
      </ItemSheet>

      <template v-else>
        <ItemSheet :item="item">
          <template v-if="!isNew && (gmModeStore.isGMMode || !item.hidden)" #name-bar-actions>
            <FateButton icon="copy" variant="outline" size="M" @click="copyItem" />
            <FateButton
              :icon="item.archived ? 'unarchive' : 'archive'"
              variant="outline"
              size="M"
              :aria-label="item.archived ? 'Gegenstand entarchivieren' : 'Gegenstand archivieren'"
              :title="item.archived ? 'Entarchivieren' : 'Archivieren'"
              @click="toggleArchived"
            />
            <FateButton icon="edit" variant="outline" size="M" @click="isEditing = true"><span class="btn-label">Bearbeiten</span></FateButton>
            <FateButton v-if="gmModeStore.isGMMode" icon="delete" variant="danger" size="M" @click="deleteItem" />
          </template>
        </ItemSheet>

        <!-- KAMPAGNEN-ZUORDNUNG -->
        <FateCampaignSection
          v-if="!isNew"
          :assigned-campaigns="itemCampaigns"
          :available-campaigns="availableCampaigns"
          @assign="(id) => campaignsStore.assignItem(id, item!.id)"
          @unassign="(id) => campaignsStore.unassignItem(id, item!.id)"
          @navigate="(id) => router.push(`/campaigns/${id}`)"
        />

        <FateEntityAssignmentSection
          v-if="!isNew && (gmModeStore.isGMMode || !item.hidden)"
          :title="'CHARAKTERE'"
          :empty-text="'Noch keinen Charakteren zugeordnet.'"
          :add-placeholder="'Charakter hinzufügen...'"
          :assigned-entities="itemCharacters"
          :available-options="availableCharacters"
          :editable="true"
          @assign="(id) => characterItemsStore.assignItem(id, item!.id)"
          @unassign="(id) => characterItemsStore.unassignItem(id, item!.id)"
          @navigate="(id) => router.push(`/characters/${id}`)"
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
</style>
