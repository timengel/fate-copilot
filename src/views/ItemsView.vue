<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import { useCampaignsStore } from '../stores/campaigns';
import { useGMModeStore } from '../stores/gmMode';
import type { Item, Character } from '../types';
import { DropdownVariant } from '../types';
import FateButton from '../components/shared/FateButton.vue';
import FateCard from '../components/shared/FateCard.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import FateCheckbox from '../components/shared/FateCheckbox.vue';
import FateDropdown from '../components/shared/FateDropdown.vue';
import { useToastStore } from '../stores/toast';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import PasteImportDialog from '../components/shared/PasteImportDialog.vue';
import { useSingleImportExport } from '../composables/useSingleImportExport';

const router = useRouter();
const store = useItemsStore();
const campaignsStore = useCampaignsStore();
const gmModeStore = useGMModeStore();
const toastStore = useToastStore();
const search = ref('');
const showArchivedItems = ref(false);
const sortOrder = ref('name-asc');
const campaignFilter = ref('active');
const DEFAULT_SORT_ORDER = 'name-asc';
const DEFAULT_CAMPAIGN_FILTER = 'active';

const sortOptions = [
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
  { value: 'dice-desc', label: 'Meiste Würfel' },
];
const campaignFilterOptions = computed(() => [
  { value: 'active', label: 'Aktive Kampagnen' },
  { value: 'all', label: 'Alle Kampagnen' },
  { value: 'unassigned', label: 'Nicht zugewiesen' },
  ...[...campaignsStore.campaigns]
    .sort((a, b) => a.name.localeCompare(b.name, 'de'))
    .map((campaign) => ({ value: campaign.id, label: campaign.name || 'Unbenannte Kampagne' })),
]);
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

const filtered = computed(() => {
  const result = store.items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.value.toLowerCase()) &&
      (showArchivedItems.value || !item.archived) &&
      (gmModeStore.isGMMode || !item.hidden) &&
      matchesCampaignFilter(item.id),
  );
  if (sortOrder.value === 'name-desc') return [...result].sort((a, b) => b.name.localeCompare(a.name, 'de'));
  if (sortOrder.value === 'dice-desc') return [...result].sort((a, b) => (b.redDice + b.blueDice) - (a.redDice + a.blueDice) || a.name.localeCompare(b.name, 'de'));
  return [...result].sort((a, b) => a.name.localeCompare(b.name, 'de'));
});

const totalItems = computed(() => store.items.length);

function deleteItem(id: string, name: string) {
  showConfirmDialog(
    'Gegenstand löschen',
    `Gegenstand "${name || 'Unbenannt'}" wirklich löschen?`,
    () => store.deleteItem(id),
  );
}

function setShowArchived(val: boolean) {
  if (!document.startViewTransition) {
    showArchivedItems.value = val;
    return;
  }
  document.startViewTransition(async () => {
    showArchivedItems.value = val;
    await nextTick();
  });
}

function setSortOrder(val: string) {
  if (!document.startViewTransition) {
    sortOrder.value = val;
    return;
  }
  document.startViewTransition(async () => {
    sortOrder.value = val;
    await nextTick();
  });
}

const hasActiveFilters = computed(
  () =>
    search.value !== '' ||
    showArchivedItems.value ||
    sortOrder.value !== DEFAULT_SORT_ORDER ||
    campaignFilter.value !== DEFAULT_CAMPAIGN_FILTER,
);

function resetFilters() {
  search.value = '';
  showArchivedItems.value = false;
  sortOrder.value = DEFAULT_SORT_ORDER;
  campaignFilter.value = DEFAULT_CAMPAIGN_FILTER;
}

function matchesCampaignFilter(itemId: string) {
  if (campaignFilter.value === 'all') return true;

  const assignedCampaignIds = campaignsStore.itemAssignments
    .filter((assignment) => assignment.itemId === itemId)
    .map((assignment) => assignment.campaignId);

  if (campaignFilter.value === 'active') {
    const activeCampaignIds = campaignsStore.campaigns
      .filter((campaign) => campaign.status === 'active')
      .map((campaign) => campaign.id);

    if (activeCampaignIds.length === 0) {
      return true;
    }

    return assignedCampaignIds.some((campaignId) => activeCampaignIds.includes(campaignId));
  }

  if (campaignFilter.value === 'unassigned') {
    return assignedCampaignIds.length === 0;
  }

  return assignedCampaignIds.includes(campaignFilter.value);
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
      <div class="sort-archive-row">
        <FateDropdown :model-value="campaignFilter" :options="campaignFilterOptions" :variant="DropdownVariant.Subtle" size="M" @update:model-value="campaignFilter = $event" />
        <FateDropdown :model-value="sortOrder" :options="sortOptions" :variant="DropdownVariant.Subtle" size="M" @update:model-value="setSortOrder" />
        <FateCheckbox class="label-full" :model-value="showArchivedItems" @update:model-value="setShowArchived" label="Zeige archivierte Gegenstände" />
        <FateCheckbox class="label-short" :model-value="showArchivedItems" @update:model-value="setShowArchived" label="Zeige Archiv" />
        <FateButton
          icon="reset"
          variant="secondary"
          class="reset-filter-btn"
          :disabled="!hasActiveFilters"
          aria-label="Filter zurücksetzen"
          title="Filter zurücksetzen"
          @click="resetFilters"
        />
      </div>
    </div>

    <div v-if="filtered.length === 0" class="empty-state">
      {{ totalItems === 0 ? 'Noch keine Gegenstände vorhanden.' : 'Keine Treffer gefunden.' }}
    </div>

    <div v-else class="card-grid">
      <FateCard
        v-for="item in filtered"
        :key="item.id"
        :style="`view-transition-name: item-${item.id}`"
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
        <template v-if="item.redDice || item.blueDice || item.modifiers?.some((m) => m.value !== 0)" #meta>
          <span v-if="item.redDice">{{ item.redDice }} 🟥</span>
          <span v-if="item.redDice && item.blueDice"> · </span>
          <span v-if="item.blueDice">{{ item.blueDice }} 🟦</span>
          <template v-for="(mod, i) in item.modifiers?.filter((m) => m.value !== 0)" :key="i">
            <span v-if="i === 0 && (item.redDice || item.blueDice)"> · </span>
            <span v-if="i > 0"> · </span>
            <span>{{ mod.value > 0 ? '+' + mod.value : mod.value }} {{ mod.label }}</span>
          </template>
        </template>
        <template #actions>
          <FateButton icon="copy" variant="secondary" size="S" @click.stop="handleCopy(item)" />
          <FateButton icon="edit" variant="secondary" size="S" @click.stop="router.push(`/items/${item.id}/edit`)" />
          <FateButton
            :icon="item.archived ? 'unarchive' : 'archive'"
            variant="secondary"
            size="S"
            :aria-label="item.archived ? 'Gegenstand entarchivieren' : 'Gegenstand archivieren'"
            :title="item.archived ? 'Entarchivieren' : 'Archivieren'"
            @click.stop="toggleArchived(item)"
          />
          <FateButton v-if="gmModeStore.isGMMode" icon="delete" variant="danger" size="S" @click.stop="deleteItem(item.id, item.name)" />
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

.reset-filter-btn {
  flex-shrink: 0;
  margin-left: auto;
}

.sort-archive-row {
  display: contents;
}

.sort-archive-row :deep(.label-short) {
  display: none;
}

@container main (width < 768px) {
  .items-input-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
  }

  .search-input {
    grid-column: 1;
    width: 100%;
    min-width: 100%;
    max-width: none;
  }

  .sort-archive-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    grid-column: 1;
    width: 100%;
  }

  .sort-archive-row :deep(.fate-dropdown) {
    width: 100%;
    --dropdown-min-width: 0;
    --dropdown-max-width: 100%;
  }

  .sort-archive-row :deep(.label-full) {
    display: none;
  }

  .sort-archive-row :deep(.label-short) {
    display: inline-flex;
    grid-column: 1;
  }

  .reset-filter-btn {
    grid-column: 2;
    justify-self: end;
    margin-left: 0;
  }
}

.search-input {
  flex: 1;
  width: 100%;
  min-width: min(180px, 100%);
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--fate-text);
  background: var(--fate-white);
}
</style>
