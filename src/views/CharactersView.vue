<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCharactersStore } from '../stores/characters';
import { useCampaignsStore } from '../stores/campaigns';
import { useGMModeStore } from '../stores/gmMode';
import type { Character, CharacterType, Item } from '../types';
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
const route = useRoute();
const store = useCharactersStore();
const campaignsStore = useCampaignsStore();
const gmModeStore = useGMModeStore();
const toastStore = useToastStore();
const search = ref('');
const showArchivedCharacters = ref(false);
const sortOrder = ref('name-asc');
const campaignFilter = ref('all');
const DEFAULT_SORT_ORDER = 'name-asc';
const DEFAULT_CAMPAIGN_FILTER = 'all';

const sortOptions = [
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
];
const campaignFilterOptions = computed(() => [
  { value: 'all', label: 'Alle Kampagnen' },
  { value: 'unassigned', label: 'Nicht zugewiesen' },
  ...[...campaignsStore.campaigns]
    .sort((a, b) => a.name.localeCompare(b.name, 'de'))
    .map((campaign) => ({ value: campaign.id, label: campaign.name || 'Unbenannte Kampagne' })),
]);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();
const { copyToClipboard } = useSingleImportExport();

async function handleCopy(char: Character) {
  try {
    await copyToClipboard(char);
    toastStore.show('Charakter kopiert');
  } catch {
    toastStore.show('Kopieren fehlgeschlagen');
  }
}
const showImportDialog = ref(false);

function handleCharacterImport(entity: Character | Item) {
  store.addCharacter(entity as Character);
  toastStore.show('Charakter importiert');
  showImportDialog.value = false;
  router.push(`/characters/${entity.id}`);
}

const activeTab = computed<CharacterType>(() => (route.query.tab === 'nsc' ? 'nsc' : 'sc'));

function setTab(tab: CharacterType) {
  router.replace({ query: tab === 'sc' ? {} : { tab } });
  search.value = '';
}

watch(
  () => gmModeStore.isGMMode,
  (val) => {
    if (!val && activeTab.value === 'nsc') setTab('sc');
  },
);

const filtered = computed(() => {
  const result = store.characters.filter((c) => {
    const type = c.type ?? 'sc';
    if (c.archived && !showArchivedCharacters.value) return false;
    if (!gmModeStore.isGMMode && type === 'nsc') return false;
    return (
      type === activeTab.value &&
      matchesCampaignFilter(c.id) &&
      (c.name.toLowerCase().includes(search.value.toLowerCase()) ||
        c.highConcept.toLowerCase().includes(search.value.toLowerCase()))
    );
  });
  if (sortOrder.value === 'name-desc') return [...result].sort((a, b) => b.name.localeCompare(a.name, 'de'));
  return [...result].sort((a, b) => a.name.localeCompare(b.name, 'de'));
});

const tabTotal = computed(() =>
  store.characters.filter((c) => {
    const type = c.type ?? 'sc';
    if (!gmModeStore.isGMMode && type === 'nsc') return false;
    return type === activeTab.value;
  }).length,
);

function deleteCharacter(id: string, name: string) {
  showConfirmDialog(
    'Charakter löschen',
    `Charakter "${name || 'Unbenannt'}" wirklich löschen?`,
    () => store.deleteCharacter(id),
  );
}

function setShowArchived(val: boolean) {
  if (!document.startViewTransition) {
    showArchivedCharacters.value = val;
    return;
  }
  document.startViewTransition(async () => {
    showArchivedCharacters.value = val;
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
    showArchivedCharacters.value ||
    sortOrder.value !== DEFAULT_SORT_ORDER ||
    campaignFilter.value !== DEFAULT_CAMPAIGN_FILTER,
);

function resetFilters() {
  search.value = '';
  showArchivedCharacters.value = false;
  sortOrder.value = DEFAULT_SORT_ORDER;
  campaignFilter.value = DEFAULT_CAMPAIGN_FILTER;
}

function matchesCampaignFilter(characterId: string) {
  if (campaignFilter.value === 'all') return true;

  const assignedCampaignIds = campaignsStore.assignments
    .filter((assignment) => assignment.characterId === characterId)
    .map((assignment) => assignment.campaignId);

  if (campaignFilter.value === 'unassigned') {
    return assignedCampaignIds.length === 0;
  }

  return assignedCampaignIds.includes(campaignFilter.value);
}

function toggleArchived(character: Character) {
  store.updateCharacter({ ...character, archived: !character.archived });
  toastStore.show(
    character.archived
      ? `Charakter "${character.name || 'Unbenannt'}" entarchiviert`
      : `Charakter "${character.name || 'Unbenannt'}" archiviert`,
  );
}
</script>

<template>
  <div class="list-view">
    <FateHeader title="Charaktere">
      <div class="header-actions">
        <FateButton variant="secondary" icon="paste" @click="showImportDialog = true"><span class="btn-label">Importieren</span></FateButton>
        <FateButton variant="primary" icon="add" @click="router.push(`/characters/new?type=${activeTab}`)"><span class="btn-label">Neuer Charakter</span></FateButton>
      </div>
    </FateHeader>

    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'sc' }"
        @click="setTab('sc')"
      >
        <span class="tab-btn-full">Spielercharaktere (SC)</span><span class="tab-btn-short">Spieler (SC)</span>
      </button>
      <button
        v-if="gmModeStore.isGMMode"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'nsc' }"
        @click="setTab('nsc')"
      >
        <span class="tab-btn-full">Nicht-Spieler-Charaktere (NSC)</span><span class="tab-btn-short">Nicht-Spieler (NSC)</span>
      </button>
    </div>

    <div class="characters-input-row">
      <input v-model="search" class="search-input" placeholder="Charakter suchen..." type="search" />
      <div class="sort-archive-row">
        <FateDropdown :model-value="campaignFilter" :options="campaignFilterOptions" :variant="DropdownVariant.Subtle" size="M" @update:model-value="campaignFilter = $event" />
        <FateDropdown :model-value="sortOrder" :options="sortOptions" :variant="DropdownVariant.Subtle" size="M" @update:model-value="setSortOrder" />
        <FateCheckbox class="label-full" :model-value="showArchivedCharacters" @update:model-value="setShowArchived" label="Zeige archivierte Charaktere" />
        <FateCheckbox class="label-short" :model-value="showArchivedCharacters" @update:model-value="setShowArchived" label="Zeige Archiv" />
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
      {{
        tabTotal === 0
          ? `Noch keine ${activeTab === 'sc' ? 'Spielercharaktere' : 'NSCs'} vorhanden.`
          : 'Keine Treffer gefunden.'
      }}
      <span v-if="!gmModeStore.isGMMode && tabTotal === 0 && activeTab === 'sc'" class="empty-hint"
        >NSCs sind im Spieler-Modus ausgeblendet.</span
      >
    </div>

    <div v-else class="card-grid">
      <FateCard
        v-for="char in filtered"
        :key="char.id"
        :style="`view-transition-name: char-${char.id}`"
        :color="char.color"
        :avatar="char.avatar"
        :title="char.name || 'Unbenannt'"
        :badge-label="char.archived ? 'ARCHIV' : undefined"
        badge-variant="status"
        clickable
        @click="router.push(`/characters/${char.id}`)"
      >
        {{ char.highConcept || '—' }}
        <template #meta>
          <span v-if="char.trouble" class="card-trouble"><em>{{ char.trouble }}</em></span>
        </template>
        <template #actions>
          <FateButton icon="copy" variant="secondary" size="S" @click.stop="handleCopy(char)" />
          <FateButton icon="edit" variant="secondary" size="S" @click.stop="router.push(`/characters/${char.id}/edit`)" />
          <FateButton
            :icon="char.archived ? 'unarchive' : 'archive'"
            variant="secondary"
            size="S"
            :aria-label="char.archived ? 'Charakter entarchivieren' : 'Charakter archivieren'"
            :title="char.archived ? 'Entarchivieren' : 'Archivieren'"
            @click.stop="toggleArchived(char)"
          />
          <FateButton v-if="gmModeStore.isGMMode" icon="delete" variant="danger" size="S" @click.stop="deleteCharacter(char.id, char.name)" />
        </template>
      </FateCard>
    </div>
  </div>

  <PasteImportDialog
    v-if="showImportDialog"
    entity-type="character"
    @import="handleCharacterImport"
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

.tab-btn-short {
  display: none;
}

@container main (width < 768px) {
  .tab-btn-full {
    display: none;
  }

  .tab-btn-short {
    display: inline;
  }


  .header-actions .btn-label {
    display: none;
  }

  .header-actions :deep(.fate-btn) {
    padding: 0;
    width: var(--btn-size, 32px);
    justify-content: center;
  }
}

.card-trouble {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.fate-card__meta) .card-trouble {
  font-size: 0.8rem;
  color: var(--fate-text-light);
  flex: 1 1 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.characters-input-row {
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
  .characters-input-row {
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
  min-width: min(180px, 100%);
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--fate-text);
  background: var(--fate-white);
}

.tab-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--fate-border);
}

.tab-btn {
  background: transparent;
  border: none;
  border-bottom: none;
  padding: 0.35rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--fate-text-light);
  white-space: nowrap;
  cursor: pointer;
  box-shadow: none;
  transition:
    color 0.15s,
    border-bottom-color 0.15s;
}

.tab-btn:hover {
  color: var(--fate-heading);
}

.tab-btn--active {
  color: var(--fate-heading);
  box-shadow: 0 2px 0 var(--fate-heading);
}

.tab-btn:not(.tab-btn--active) {
  color: var(--fate-text-light);
}
</style>
