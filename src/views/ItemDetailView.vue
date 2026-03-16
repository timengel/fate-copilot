<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import CharacterSheet from '../components/character/CharacterSheet.vue';
import FateButton from '../components/shared/FateButton.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import type { Character } from '../types';
import { createDefaultItem } from '../composables/useCharacterDefaults';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { useToastStore } from '../stores/toast';

const props = defineProps<{
  isNew?: boolean;
  editMode?: boolean;
}>();

const route = useRoute();
const router = useRouter();
const itemsStore = useItemsStore();

const id = computed(() => route.params.id as string);
const isEditing = ref(props.isNew || props.editMode || false);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();
const toastStore = useToastStore();

const itemSections = {
  fertigkeiten: false,
  konsequenzen: false,
  allgemeinesRefresh: false,
  allgemeinesFatePoints: false,
  redAndBlueDice: true,
};

const item = computed(() => {
  if (props.isNew) return createDefaultItem();
  return itemsStore.getById(id.value);
});

function handleSave(updated: Character) {
  if (props.isNew) {
    itemsStore.addItem(updated);
    router.replace(`/items/${updated.id}`);
  } else {
    itemsStore.updateItem(updated);
    isEditing.value = false;
  }
  toastStore.show('Gegenstand gespeichert');
}

function handleCancel() {
  if (props.isNew) {
    router.push('/items');
  } else {
    isEditing.value = false;
  }
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
      Gegenstand nicht gefunden.
      <FateButton variant="link" @click="router.push('/items')">← Zurück</FateButton>
    </div>

    <template v-else-if="item">
      <div class="detail-toolbar">
        <FateButton variant="link" @click="router.push('/items')">← Gegenstände</FateButton>
        <div class="toolbar-actions">
          <template v-if="!isNew">
            <FateButton v-if="!isEditing" icon="edit" @click="isEditing = true">Bearbeiten</FateButton>
            <FateButton variant="danger-outline" @click="deleteItem">Löschen</FateButton>
          </template>
        </div>
      </div>

      <CharacterSheet
        v-if="isEditing"
        mode="edit"
        :key="item.id"
        :character="item"
        :sections="itemSections"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <CharacterSheet v-else :character="item" :sections="itemSections" />
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
</style>
