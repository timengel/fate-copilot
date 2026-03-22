<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import { useGMModeStore } from '../stores/gmMode';
import type { Item, Character } from '../types';
import FateButton from '../components/shared/FateButton.vue';
import FateCard from '../components/shared/FateCard.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import FateCheckbox from '../components/shared/FateCheckbox.vue';
import { useToastStore } from '../stores/toast';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import PasteImportDialog from '../components/shared/PasteImportDialog.vue';
import { useSingleImportExport } from '../composables/useSingleImportExport';

const router = useRouter();
const store = useItemsStore();
const gmModeStore = useGMModeStore();
const toastStore = useToastStore();
const search = ref('');
const showArchivedItems = ref(false);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();
const { copyToClipboard } = useSingleImportExport();

async function handleCopy(item: Item) {
  try {
    await copyToClipboard(item);
    toastStore.show('Gegenstand kopiert');
  } catch {
    toastStore.show('Kopieren fehlgeschlagen');
  }
}
const showImportDialog = ref(false);

function handleItemImport(entity: Character | Item) {
  store.addItem(entity as Item);
  toastStore.show('Gegenstand importiert');
  showImportDialog.value = false;
  router.push(`/items/${entity.id}`);
}

const filtered = computed(() =>
  store.items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.value.toLowerCase()) &&
      (showArchivedItems.value || !item.archived) &&
      (gmModeStore.isGMMode || !item.hidden),
  ),
);

const totalItems = computed(() => store.items.length);

function deleteItem(id: string, name: string) {
  showConfirmDialog(
    'Gegenstand löschen',
    `Gegenstand "${name || 'Unbenannt'}" wirklich löschen?`,
    () => store.deleteItem(id),
  );
}

function toggleArchived(item: Item) {
  store.updateItem({ ...item, archived: !item.archived });
  toastStore.show(
    item.archived
      ? `Gegenstand "${item.name || 'Unbenannt'}" entarchiviert`
      : `Gegenstand "${item.name || 'Unbenannt'}" archiviert`,
  );
}
</script>

<template>
  <div class="list-view">
    <FateHeader title="Gegenstände">
      <div class="header-actions">
        <FateButton variant="secondary" icon="paste" @click="showImportDialog = true"><span class="btn-label">Importieren</span></FateButton>
        <FateButton variant="primary" icon="add" @click="router.push('/items/new')"><span class="btn-label">Neuer Gegenstand</span></FateButton>
      </div>
    </FateHeader>

    <div class="items-input-row">
      <input v-model="search" class="search-input" placeholder="Gegenstand suchen..." type="search" />
      <FateCheckbox v-model="showArchivedItems" label="Zeige archivierte Gegenstände" />
    </div>

    <div v-if="filtered.length === 0" class="empty-state">
      {{ totalItems === 0 ? 'Noch keine Gegenstände vorhanden.' : 'Keine Treffer gefunden.' }}
    </div>

    <div v-else class="card-grid">
      <FateCard
        v-for="item in filtered"
        :key="item.id"
        :color="item.color"
        :avatar="item.avatar"
        :title="item.name || 'Unbenannt'"
        :badge-label="item.archived ? 'ARCHIV' : item.hidden ? 'GM' : undefined"
        :badge-variant="item.archived ? 'status' : 'gm'"
        clickable
        @click="router.push(`/items/${item.id}`)"
      >
        <template v-if="item.description">
          {{ item.description }}
        </template>
        <template v-if="item.redDice || item.blueDice" #meta>
          <span v-if="item.redDice">{{ item.redDice }} 🟥</span>
          <span v-if="item.redDice && item.blueDice"> · </span>
          <span v-if="item.blueDice">{{ item.blueDice }} 🟦</span>
        </template>
        <template #actions>
          <FateButton icon="copy" variant="secondary" size="S" @click.stop="handleCopy(item)" />
          <FateButton icon="edit" variant="secondary" size="S" @click.stop="router.push(`/items/${item.id}/edit`)" />
          <FateButton
            v-if="gmModeStore.isGMMode"
            :icon="item.archived ? 'unarchive' : 'archive'"
            variant="secondary"
            size="S"
            :aria-label="item.archived ? 'Gegenstand entarchivieren' : 'Gegenstand archivieren'"
            :title="item.archived ? 'Entarchivieren' : 'Archivieren'"
            @click.stop="toggleArchived(item)"
          />
          <FateButton icon="delete" variant="danger" size="S" @click.stop="deleteItem(item.id, item.name)" />
        </template>
      </FateCard>
    </div>
  </div>

  <PasteImportDialog
    v-if="showImportDialog"
    entity-type="item"
    @import="handleItemImport"
    @cancel="showImportDialog = false"
  />

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
.header-actions {
  display: flex;
  gap: 0.5rem;
}

@container main (width < 480px) {
  .header-actions .btn-label {
    display: none;
  }

  .header-actions :deep(.fate-btn) {
    padding: 0;
    width: var(--btn-size, 32px);
    justify-content: center;
  }
}

.items-input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  width: 100%;
  min-width: min(260px, 100%);
  max-width: 400px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--fate-text);
  background: white;
}
</style>
