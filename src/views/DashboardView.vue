<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useCampaignsStore } from '../stores/campaigns';
import { useCharactersStore } from '../stores/characters';
import { useGMModeStore } from '../stores/gmMode';
import { useToastStore } from '../stores/toast';
import { useDashboardPreferencesStore } from '../stores/dashboardPreferences';
import CharacterSheet from '../components/character/CharacterSheet.vue';
import ItemSheet from '../components/character/ItemSheet.vue';
import FateButton from '../components/shared/FateButton.vue';
import FateIcon from '../components/shared/FateIcon.vue';
import FateCheckbox from '../components/shared/FateCheckbox.vue';
import FateDropdown from '../components/shared/FateDropdown.vue';
import FateRadioButtonGroup from '../components/shared/FateRadioButtonGroup.vue';
import FateCheatSheet from '../components/shared/FateCheatSheet.vue';
import { useItemsStore } from '../stores/items';
import { useCharacterItemsStore } from '../stores/characterItems';
import { DropdownVariant, type Character, type Item } from '../types';

const campaignsStore = useCampaignsStore();
const charactersStore = useCharactersStore();
const itemsStore = useItemsStore();
const characterItemsStore = useCharacterItemsStore();
const gmModeStore = useGMModeStore();
const toastStore = useToastStore();
const {
  selectedCampaignFilter,
  showSC,
  showNSC,
  showArchivedCharacters,
  showItems,
  showArchivedItems,
  showEditButton,
  layout,
  visibleSections,
} = storeToRefs(useDashboardPreferencesStore());

const sidebarCollapsed = ref(sessionStorage.getItem('sidebarCollapsed') === 'true');
const filtersOpen = ref(false);
const filterSections = ref({
  kampagne: false,
  charaktere: false,
  items: false,
  sektionen: false,
  layout: false,
});
const charSortOrder = ref('name-asc');
const itemSortOrder = ref('name-asc');

const charSortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
];

const itemSortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'dice-desc', label: 'Meiste Würfel' },
];
const editingCharacterId = ref<string | null>(null);
const editingItemId = ref<string | null>(null);
const editingCharacterItemIds = ref<string[]>([]);
const initialEditingCharacterItemIds = ref<string[]>([]);
const characterFormRef = ref<InstanceType<typeof CharacterSheet>[]>([]);
const itemFormRef = ref<InstanceType<typeof ItemSheet>[]>([]);
const pendingCharacterEditId = ref<string | null>(null);
const switchCharacterDialog = ref<{
  currentCharacterId: string;
  nextCharacterId: string;
} | null>(null);
const isFabOpen = ref(false);
const cheatSheetPopoverRef = ref<HTMLDivElement | null>(null);

function setCheatSheetScrollLock(locked: boolean) {
  document.body.classList.toggle('dashboard-cheat-sheet-open', locked);
}

const campaignOptions = computed(() => [
  { value: 'active', label: 'Aktive Kampagnen' },
  { value: 'all', label: 'Alle Kampagnen' },
  { value: 'unassigned', label: 'Nicht zugewiesen' },
  ...[...campaignsStore.campaigns]
    .sort((a, b) => a.name.localeCompare(b.name, 'de'))
    .map((campaign) => ({
      value: campaign.id,
      label: campaign.name || 'Unbenannte Kampagne',
    })),
]);

const selectedCampaignFilterDropdown = computed({
  get: () => selectedCampaignFilter.value,
  set: (value: string) => {
    selectedCampaignFilter.value = value || 'active';
  },
});

watchEffect(() => {
  const visible = campaignOptions.value;
  if (!visible.find((option) => option.value === selectedCampaignFilter.value)) {
    selectedCampaignFilter.value = 'active';
  }
});

const allCharactersInCampaign = computed(() =>
  charactersStore.characters.filter((character) => matchesCharacterCampaignFilter(character.id)),
);

const allItemsInCampaign = computed(() =>
  itemsStore.items.filter((item) => matchesItemCampaignFilter(item.id)),
);

const items = computed(() => {
  if (!showItems.value) return [];
  const result = allItemsInCampaign.value.filter((item) => {
    if (!gmModeStore.isGMMode && item.hidden) return false;
    if (item.archived && !showArchivedItems.value) return false;
    return true;
  });
  if (itemSortOrder.value === 'name-desc')
    return [...result].sort((a, b) => b.name.localeCompare(a.name, 'de'));
  if (itemSortOrder.value === 'dice-desc')
    return [...result].sort(
      (a, b) =>
        b.redDice + b.blueDice - (a.redDice + a.blueDice) || a.name.localeCompare(b.name, 'de'),
    );
  return [...result].sort((a, b) => a.name.localeCompare(b.name, 'de'));
});

const characters = computed(() => {
  const result = allCharactersInCampaign.value.filter((c) => {
    const type = c.type ?? 'sc';
    if (!gmModeStore.isGMMode && type === 'nsc') return false;
    if (c.archived && !showArchivedCharacters.value) return false;
    if (type === 'sc' && !showSC.value) return false;
    if (type === 'nsc' && !showNSC.value) return false;
    return true;
  });
  if (charSortOrder.value === 'name-desc')
    return [...result].sort((a, b) => b.name.localeCompare(a.name, 'de'));
  return [...result].sort((a, b) => a.name.localeCompare(b.name, 'de'));
});

const editingCharacterCampaignIds = computed(() => {
  if (!editingCharacterId.value) return new Set<string>();

  return new Set(
    campaignsStore
      .getCampaignsForCharacter(editingCharacterId.value)
      .map((campaign) => campaign.id),
  );
});

const editingAssignedItems = computed(() =>
  editingCharacterItemIds.value
    .map((itemId) => itemsStore.getById(itemId))
    .filter((item): item is Item => !!item),
);

const availableDashboardCharacterItems = computed(() =>
  itemsStore.items
    .filter((item) => {
      if (!(gmModeStore.isGMMode || !item.hidden)) return false;
      if (editingCharacterItemIds.value.includes(item.id)) return false;
      if (editingCharacterCampaignIds.value.size === 0) return false;

      return campaignsStore
        .getCampaignsForItem(item.id)
        .some((campaign) => editingCharacterCampaignIds.value.has(campaign.id));
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'de'))
    .map((item) => ({ value: item.id, label: item.name || 'Unbenannt' })),
);

const hasEditingCharacterItemChanges = computed(() => {
  const initial = [...initialEditingCharacterItemIds.value].sort();
  const current = [...editingCharacterItemIds.value].sort();

  if (initial.length !== current.length) return true;

  return initial.some((itemId, index) => itemId !== current[index]);
});

function syncEditingCharacterItems(characterId: string | null) {
  if (!characterId) {
    initialEditingCharacterItemIds.value = [];
    editingCharacterItemIds.value = [];
    return;
  }

  const itemIds = characterItemsStore.getItemsForCharacter(characterId).map((item) => item.id);
  initialEditingCharacterItemIds.value = [...itemIds];
  editingCharacterItemIds.value = [...itemIds];
}

function handleSave(updated: Character) {
  charactersStore.updateCharacter(updated);
  characterItemsStore.setItemsForCharacter(updated.id, editingCharacterItemIds.value);
  editingCharacterId.value = null;
  syncEditingCharacterItems(null);
  toastStore.show('Charakter gespeichert');

  if (pendingCharacterEditId.value) {
    const nextCharacterId = pendingCharacterEditId.value;
    pendingCharacterEditId.value = null;
    startCharacterEditing(nextCharacterId);
  }
}

function handleItemSave(updated: Item) {
  itemsStore.updateItem(updated);
  editingItemId.value = null;
  toastStore.show('Gegenstand gespeichert');
}

function saveCharacterEditing() {
  characterFormRef.value?.[0]?.save();
}

function saveItemEditing() {
  itemFormRef.value?.[0]?.save();
}

function startCharacterEditing(characterId: string) {
  syncEditingCharacterItems(characterId);
  editingCharacterId.value = characterId;
}

function cancelCharacterEditing() {
  pendingCharacterEditId.value = null;
  switchCharacterDialog.value = null;
  syncEditingCharacterItems(null);
  editingCharacterId.value = null;
}

function getCharacterName(characterId: string) {
  return charactersStore.getById(characterId)?.name || 'Unbenannt';
}

function getActiveCharacterForm() {
  return characterFormRef.value?.[0] ?? null;
}

function isActiveCharacterDirty() {
  return getActiveCharacterForm()?.isDirty ?? hasEditingCharacterItemChanges.value;
}

function requestCharacterEdit(characterId: string) {
  if (editingCharacterId.value === characterId) return;

  if (!editingCharacterId.value) {
    startCharacterEditing(characterId);
    return;
  }

  if (!isActiveCharacterDirty()) {
    cancelCharacterEditing();
    startCharacterEditing(characterId);
    return;
  }

  switchCharacterDialog.value = {
    currentCharacterId: editingCharacterId.value,
    nextCharacterId: characterId,
  };
}

function cancelCharacterSwitch() {
  pendingCharacterEditId.value = null;
  switchCharacterDialog.value = null;
}

function discardCharacterSwitchChanges() {
  const nextCharacterId = switchCharacterDialog.value?.nextCharacterId;
  cancelCharacterEditing();

  if (nextCharacterId) {
    startCharacterEditing(nextCharacterId);
  }
}

function saveCharacterSwitchChanges() {
  const nextCharacterId = switchCharacterDialog.value?.nextCharacterId;
  if (!nextCharacterId) return;

  pendingCharacterEditId.value = nextCharacterId;
  switchCharacterDialog.value = null;
  saveCharacterEditing();
}

function toggleFabMenu() {
  isFabOpen.value = !isFabOpen.value;
}

function handleCheatSheetFabActionClick() {
  isFabOpen.value = false;
}

function closeCheatSheetPopover() {
  const popoverEl = cheatSheetPopoverRef.value;
  if (!popoverEl) return;
  popoverEl.hidePopover();
  setCheatSheetScrollLock(false);
}

function handleCheatSheetPopoverToggle(event: Event) {
  const toggleEvent = event as Event & { newState?: 'open' | 'closed' };
  if (toggleEvent.newState === 'open') {
    setCheatSheetScrollLock(true);
    return;
  }
  if (toggleEvent.newState === 'closed') {
    setCheatSheetScrollLock(false);
    return;
  }

  const popoverEl = cheatSheetPopoverRef.value;
  if (!popoverEl) return;
  const isOpen = popoverEl.matches(':popover-open');
  setCheatSheetScrollLock(isOpen);
}

function handleDashboardAssignItem(itemId: string) {
  if (!itemId || editingCharacterItemIds.value.includes(itemId)) return;
  editingCharacterItemIds.value = [...editingCharacterItemIds.value, itemId];
}

function handleDashboardUnassignItem(itemId: string) {
  editingCharacterItemIds.value = editingCharacterItemIds.value.filter(
    (assignedItemId) => assignedItemId !== itemId,
  );
}

watch(sidebarCollapsed, (val) => {
  document.body.classList.toggle('sidebar-collapsed', val);
  sessionStorage.setItem('sidebarCollapsed', String(val));
});

watch(
  () => gmModeStore.isGMMode,
  (isEnabled) => {
    if (!isEnabled) {
      isFabOpen.value = false;
      closeCheatSheetPopover();
    }
  },
);

watch(
  layout,
  (val) => {
    document.body.classList.toggle('dashboard-grid-active', val === 'grid');
  },
  { immediate: true },
);

function withViewTransition(fn: () => void) {
  if (!document.startViewTransition) {
    fn();
    return;
  }
  document.startViewTransition(async () => {
    fn();
    await nextTick();
  });
}

function setLayout(val: string) {
  if (val !== 'list' && val !== 'grid') return;
  withViewTransition(() => {
    layout.value = val;
  });
}

const anyExpanded = computed(() => Object.values(filterSections.value).some(Boolean));

function setCharSortOrder(val: string) {
  withViewTransition(() => {
    charSortOrder.value = val;
  });
}
function setItemSortOrder(val: string) {
  withViewTransition(() => {
    itemSortOrder.value = val;
  });
}
function setShowSC(val: boolean) {
  withViewTransition(() => {
    showSC.value = val;
  });
}
function setShowNSC(val: boolean) {
  withViewTransition(() => {
    showNSC.value = val;
  });
}
function setShowArchivedCharacters(val: boolean) {
  withViewTransition(() => {
    showArchivedCharacters.value = val;
  });
}
function setShowArchivedItems(val: boolean) {
  withViewTransition(() => {
    showArchivedItems.value = val;
  });
}

function matchesCharacterCampaignFilter(characterId: string) {
  if (selectedCampaignFilter.value === 'all') return true;

  const assignedCampaignIds = campaignsStore.assignments
    .filter((assignment) => assignment.characterId === characterId)
    .map((assignment) => assignment.campaignId);

  if (selectedCampaignFilter.value === 'active') {
    const activeCampaignIds = campaignsStore.campaigns
      .filter((campaign) => campaign.status === 'active')
      .map((campaign) => campaign.id);

    if (activeCampaignIds.length === 0) {
      return true;
    }

    return assignedCampaignIds.some((campaignId) => activeCampaignIds.includes(campaignId));
  }

  if (selectedCampaignFilter.value === 'unassigned') {
    return assignedCampaignIds.length === 0;
  }

  return assignedCampaignIds.includes(selectedCampaignFilter.value);
}

function matchesItemCampaignFilter(itemId: string) {
  if (selectedCampaignFilter.value === 'all') return true;

  const assignedCampaignIds = campaignsStore.itemAssignments
    .filter((assignment) => assignment.itemId === itemId)
    .map((assignment) => assignment.campaignId);

  if (selectedCampaignFilter.value === 'active') {
    const activeCampaignIds = campaignsStore.campaigns
      .filter((campaign) => campaign.status === 'active')
      .map((campaign) => campaign.id);

    if (activeCampaignIds.length === 0) {
      return true;
    }

    return assignedCampaignIds.some((campaignId) => activeCampaignIds.includes(campaignId));
  }

  if (selectedCampaignFilter.value === 'unassigned') {
    return assignedCampaignIds.length === 0;
  }

  return assignedCampaignIds.includes(selectedCampaignFilter.value);
}

function expandAllSections() {
  filtersOpen.value = true;
  filterSections.value.kampagne = true;
  filterSections.value.charaktere = true;
  filterSections.value.items = true;
  filterSections.value.sektionen = true;
  filterSections.value.layout = true;
}

function collapseAllSections() {
  filterSections.value.kampagne = false;
  filterSections.value.charaktere = false;
  filterSections.value.items = false;
  filterSections.value.sektionen = false;
  filterSections.value.layout = false;
}

onMounted(() => {
  // sidebar-no-transition disables the CSS transition on mount so the initial
  // padding-left jump is not animated. Double rAF ensures at least one frame
  // has been painted before re-enabling the transition.
  document.body.classList.add('has-dashboard-sidebar', 'sidebar-no-transition');
  if (sidebarCollapsed.value) document.body.classList.add('sidebar-collapsed');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('sidebar-no-transition');
    });
  });
});
onUnmounted(() => {
  document.body.classList.remove('has-dashboard-sidebar');
  document.body.classList.remove('sidebar-collapsed');
  document.body.classList.remove('dashboard-grid-active');
  document.body.classList.remove('dashboard-cheat-sheet-open');
});
</script>

<template>
  <div class="dashboard-view">
    <!-- Sidebar (desktop) -->
    <FateButton
      v-if="sidebarCollapsed"
      class="sidebar-lash"
      variant="subtle"
      size="M"
      icon="chevron-right"
      title="Sidebar öffnen"
      @click="sidebarCollapsed = false"
    />
    <aside class="dashboard-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h3 class="sidebar-title" v-show="!sidebarCollapsed">Filter</h3>
        <FateButton
          class="sidebar-toggle"
          variant="subtle"
          size="M"
          :icon="sidebarCollapsed ? 'chevron-right' : 'chevron-left'"
          :title="sidebarCollapsed ? 'Sidebar öffnen' : 'Sidebar schließen'"
          @click.stop="sidebarCollapsed = !sidebarCollapsed"
        />
      </div>

      <div v-show="!sidebarCollapsed" class="sidebar-content">
        <div class="sidebar-group">
          <div class="sidebar-group-label">Kampagne</div>
          <div v-if="campaignsStore.campaigns.length === 0" class="campaign-select-empty">
            Keine Kampagnen.
          </div>
          <FateDropdown
            v-else
            v-model="selectedCampaignFilterDropdown"
            class="campaign-dropdown"
            placeholder="Filter wählen…"
            :options="campaignOptions"
            :variant="DropdownVariant.Subtle"
            size="S"
          />
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-label">Charaktere</div>
          <FateDropdown
            :model-value="charSortOrder"
            :options="charSortOptions"
            :variant="DropdownVariant.Subtle"
            class="campaign-dropdown"
            size="S"
            @update:model-value="setCharSortOrder"
          />
          <FateCheckbox :model-value="showSC" label="Zeige SC" @update:model-value="setShowSC" />
          <FateCheckbox
            v-if="gmModeStore.isGMMode"
            :model-value="showNSC"
            label="Zeige NSC"
            @update:model-value="setShowNSC"
          />
          <FateCheckbox
            :model-value="showArchivedCharacters"
            label="Archiviert"
            @update:model-value="setShowArchivedCharacters"
          />
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-label">Items</div>
          <FateDropdown
            :model-value="itemSortOrder"
            :options="itemSortOptions"
            :variant="DropdownVariant.Subtle"
            class="campaign-dropdown"
            size="S"
            @update:model-value="setItemSortOrder"
          />
          <FateCheckbox v-model="showItems" label="Zeige Items" />
          <FateCheckbox
            :model-value="showArchivedItems"
            label="Archiviert"
            @update:model-value="setShowArchivedItems"
          />
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-label">Sektionen</div>
          <FateCheckbox v-model="visibleSections.general" label="Allgemeines" />
          <FateCheckbox v-model="visibleSections.aspects" label="Aspekte" />
          <FateCheckbox v-model="visibleSections.skills" label="Fertigkeiten" />
          <FateCheckbox v-model="visibleSections.extras" label="Extras" />
          <FateCheckbox v-model="visibleSections.stunts" label="Stunts" />
          <FateCheckbox v-model="visibleSections.stress" label="Stress" />
          <FateCheckbox v-model="visibleSections.consequences" label="Konsequenzen" />
          <FateCheckbox
            v-if="gmModeStore.isGMMode"
            v-model="visibleSections.gmNotes"
            label="GM-Notizen"
          />
          <FateCheckbox v-model="visibleSections.dice" label="Würfel" />
          <FateCheckbox v-model="visibleSections.modifiers" label="Modifiers" />
          <FateCheckbox v-model="visibleSections.items" label="Gegenstände" />
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-label">Layout</div>
          <FateRadioButtonGroup
            :model-value="layout"
            @update:model-value="setLayout"
            :options="[
              { value: 'list', label: 'Liste' },
              { value: 'grid', label: 'Zwei Spalten' },
            ]"
          />
        </div>
      </div>
    </aside>

    <!-- Inline filters for small screens -->
    <div class="dashboard-filters-inline">
      <div class="filters-toggle-row">
        <button class="filters-toggle" @click="filtersOpen = !filtersOpen">
          <span>Filter</span>
          <FateIcon
            name="chevron-right"
            :size="16"
            class="filters-toggle-icon"
            :class="{ open: filtersOpen }"
          />
        </button>
        <button
          class="filters-expand-all"
          :title="anyExpanded ? 'Alle zuklappen' : 'Alle aufklappen'"
          @click="anyExpanded ? collapseAllSections() : expandAllSections()"
        >
          <FateIcon
            name="chevrons-down"
            :size="16"
            class="filters-toggle-icon"
            :class="{ open: anyExpanded }"
          />
        </button>
      </div>

      <div v-if="filtersOpen" class="filters-body">
        <div class="filters-section">
          <button
            class="filters-section-toggle"
            @click="filterSections.kampagne = !filterSections.kampagne"
          >
            <span>Kampagne</span>
            <FateIcon
              name="chevron-right"
              :size="14"
              class="filters-toggle-icon"
              :class="{ open: filterSections.kampagne }"
            />
          </button>
          <div v-if="filterSections.kampagne" class="filters-section-body">
            <div v-if="campaignsStore.campaigns.length === 0" class="campaign-select-empty">
              Keine Kampagnen.
            </div>
            <FateDropdown
              v-else
              v-model="selectedCampaignFilterDropdown"
              class="campaign-dropdown"
              placeholder="Filter wählen…"
              :options="campaignOptions"
              :variant="DropdownVariant.Subtle"
              size="S"
            />
          </div>
        </div>

        <div class="filters-section">
          <button
            class="filters-section-toggle"
            @click="filterSections.charaktere = !filterSections.charaktere"
          >
            <span>Charaktere</span>
            <FateIcon
              name="chevron-right"
              :size="14"
              class="filters-toggle-icon"
              :class="{ open: filterSections.charaktere }"
            />
          </button>
          <div v-if="filterSections.charaktere" class="filters-section-body">
            <FateDropdown
              :model-value="charSortOrder"
              :options="charSortOptions"
              :variant="DropdownVariant.Subtle"
              class="campaign-dropdown"
              size="S"
              @update:model-value="setCharSortOrder"
            />
            <FateCheckbox :model-value="showSC" label="SC" @update:model-value="setShowSC" />
            <FateCheckbox
              v-if="gmModeStore.isGMMode"
              :model-value="showNSC"
              label="NSC"
              @update:model-value="setShowNSC"
            />
            <FateCheckbox
              :model-value="showArchivedCharacters"
              label="Archiviert"
              @update:model-value="setShowArchivedCharacters"
            />
          </div>
        </div>

        <div class="filters-section">
          <button
            class="filters-section-toggle"
            @click="filterSections.items = !filterSections.items"
          >
            <span>Items</span>
            <FateIcon
              name="chevron-right"
              :size="14"
              class="filters-toggle-icon"
              :class="{ open: filterSections.items }"
            />
          </button>
          <div v-if="filterSections.items" class="filters-section-body">
            <FateDropdown
              :model-value="itemSortOrder"
              :options="itemSortOptions"
              :variant="DropdownVariant.Subtle"
              class="campaign-dropdown"
              size="S"
              @update:model-value="setItemSortOrder"
            />
            <FateCheckbox v-model="showItems" label="Zeige Items" />
            <FateCheckbox
              :model-value="showArchivedItems"
              label="Archiviert"
              @update:model-value="setShowArchivedItems"
            />
          </div>
        </div>

        <div class="filters-section">
          <button
            class="filters-section-toggle"
            @click="filterSections.sektionen = !filterSections.sektionen"
          >
            <span>Sektionen</span>
            <FateIcon
              name="chevron-right"
              :size="14"
              class="filters-toggle-icon"
              :class="{ open: filterSections.sektionen }"
            />
          </button>
          <div v-if="filterSections.sektionen" class="filters-section-body">
            <FateCheckbox v-model="visibleSections.general" label="Allgemeines" />
            <FateCheckbox v-model="visibleSections.aspects" label="Aspekte" />
            <FateCheckbox v-model="visibleSections.skills" label="Fertigkeiten" />
            <FateCheckbox v-model="visibleSections.extras" label="Extras" />
            <FateCheckbox v-model="visibleSections.stunts" label="Stunts" />
            <FateCheckbox v-model="visibleSections.stress" label="Stress" />
            <FateCheckbox v-model="visibleSections.consequences" label="Konsequenzen" />
            <FateCheckbox
              v-if="gmModeStore.isGMMode"
              v-model="visibleSections.gmNotes"
              label="GM-Notizen"
            />
            <FateCheckbox v-model="visibleSections.dice" label="Würfel" />
            <FateCheckbox v-model="visibleSections.modifiers" label="Modifiers" />
            <FateCheckbox v-model="visibleSections.items" label="Gegenstände" />
          </div>
        </div>

        <div class="filters-section">
          <button
            class="filters-section-toggle"
            @click="filterSections.layout = !filterSections.layout"
          >
            <span>Layout</span>
            <FateIcon
              name="chevron-right"
              :size="14"
              class="filters-toggle-icon"
              :class="{ open: filterSections.layout }"
            />
          </button>
          <div v-if="filterSections.layout" class="filters-section-body">
            <FateRadioButtonGroup
              :model-value="layout"
              @update:model-value="setLayout"
              :options="[
                { value: 'list', label: 'Liste' },
                { value: 'grid', label: 'Zwei Spalten' },
              ]"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="campaignsStore.campaigns.length === 0" class="dashboard-empty">
      Keine Kampagnen vorhanden.
    </div>
    <div
      v-else-if="allCharactersInCampaign.length === 0 && allItemsInCampaign.length === 0"
      class="dashboard-empty"
    >
      Keine Charaktere oder Items für diesen Filter.
    </div>
    <div v-else-if="characters.length === 0 && items.length === 0" class="dashboard-empty">
      Alle Charaktere und Items sind ausgeblendet.
    </div>

    <div
      v-if="characters.length > 0"
      class="dashboard-stack"
      :class="{ 'dashboard-stack--grid': layout === 'grid' }"
    >
      <div
        v-for="character in characters"
        :key="character.id"
        :style="`view-transition-name: char-${character.id}`"
        class="dashboard-entry"
      >
        <CharacterSheet
          v-if="editingCharacterId === character.id"
          ref="characterFormRef"
          mode="edit"
          :character="character"
          :hideActions="true"
          :sections="visibleSections"
          :disableAssignedItemNavigation="true"
          :assigned-items="editingAssignedItems"
          :available-item-options="availableDashboardCharacterItems"
          :external-dirty="hasEditingCharacterItemChanges"
          @save="handleSave"
          @cancel="cancelCharacterEditing"
          @assign-item="handleDashboardAssignItem"
          @unassign-item="handleDashboardUnassignItem"
        >
          <template #edit-bar-actions="{ isDirty }">
            <FateButton
              icon="close"
              variant="outline"
              size="M"
              class="dashboard-inline-edit-action"
              @click="cancelCharacterEditing"
              ><span class="btn-label">Abbrechen</span></FateButton
            >
            <FateButton
              icon="check"
              variant="outline"
              size="M"
              class="dashboard-inline-edit-action"
              :disabled="!isDirty"
              @click="saveCharacterEditing"
            >
              <span class="btn-label">Speichern</span></FateButton
            >
          </template>
        </CharacterSheet>
        <CharacterSheet
          v-else
          :character="character"
          :sections="visibleSections"
          :disableAssignedItemNavigation="true"
        >
          <template v-if="showEditButton" #name-bar-actions>
            <FateButton
              icon="edit"
              variant="outline"
              size="M"
              @click="requestCharacterEdit(character.id)"
              ><span class="btn-label">Bearbeiten</span></FateButton
            >
          </template>
        </CharacterSheet>
      </div>
    </div>

    <div v-if="characters.length > 0 && items.length > 0" class="dashboard-section-divider">
      <span class="dashboard-section-divider__label">Items</span>
    </div>

    <div
      v-if="items.length > 0"
      class="dashboard-stack"
      :class="{ 'dashboard-stack--grid': layout === 'grid' }"
    >
      <div
        v-for="item in items"
        :key="item.id"
        :style="`view-transition-name: item-${item.id}`"
        class="dashboard-entry"
      >
        <ItemSheet
          v-if="editingItemId === item.id"
          ref="itemFormRef"
          mode="edit"
          :item="item"
          :hideActions="true"
          :sections="visibleSections"
          @save="handleItemSave"
          @cancel="editingItemId = null"
        >
          <template #edit-bar-actions>
            <FateButton
              icon="close"
              variant="outline"
              size="M"
              class="dashboard-inline-edit-action"
              @click="editingItemId = null"
              ><span class="btn-label">Abbrechen</span></FateButton
            >
            <FateButton
              icon="check"
              variant="outline"
              size="M"
              class="dashboard-inline-edit-action"
              @click="saveItemEditing"
              ><span class="btn-label">Speichern</span></FateButton
            >
          </template>
        </ItemSheet>
        <ItemSheet v-else :item="item" :sections="visibleSections">
          <template v-if="showEditButton" #name-bar-actions>
            <FateButton icon="edit" variant="outline" size="M" @click="editingItemId = item.id"
              ><span class="btn-label">Bearbeiten</span></FateButton
            >
          </template>
        </ItemSheet>
      </div>
    </div>

    <div v-if="switchCharacterDialog" class="dialog-overlay" @click.self="cancelCharacterSwitch">
      <div class="dialog-box dialog-box--switch-character">
        <div class="dialog-title">Ungespeicherte Aenderungen</div>
        <div class="dialog-message">
          Du bearbeitest gerade „{{ getCharacterName(switchCharacterDialog.currentCharacterId) }}“.
          Was soll mit den Aenderungen passieren, bevor „{{
            getCharacterName(switchCharacterDialog.nextCharacterId)
          }}“ geoeffnet wird?
        </div>
        <div class="dialog-actions dialog-actions--stack-mobile">
          <FateButton icon="close" variant="secondary" @click="cancelCharacterSwitch">
            Abbrechen
          </FateButton>
          <FateButton icon="delete" variant="danger-outline" @click="discardCharacterSwitchChanges">
            Verwerfen
          </FateButton>
          <FateButton icon="check" variant="primary" @click="saveCharacterSwitchChanges">
            Speichern
          </FateButton>
        </div>
      </div>
    </div>

    <div
      ref="cheatSheetPopoverRef"
      id="dashboard-cheat-sheet-popover"
      class="cheat-sheet-popover"
      popover="auto"
      role="dialog"
      aria-label="Cheat Sheet Popover"
      @toggle="handleCheatSheetPopoverToggle"
    >
      <div class="cheat-sheet-popover-panel">
        <FateCheatSheet :variant="gmModeStore.isGMMode ? 'gm' : 'basic'" />
      </div>
    </div>

    <div class="dashboard-fab">
      <Transition name="fab-actions">
        <div v-if="isFabOpen" id="dashboard-fab-menu" class="dashboard-fab-menu">
          <button
            type="button"
            class="dashboard-fab-action"
            aria-label="Cheat Sheet öffnen"
            popovertarget="dashboard-cheat-sheet-popover"
            popovertargetaction="toggle"
            @click="handleCheatSheetFabActionClick"
          >
            Cheat Sheet
          </button>
        </div>
      </Transition>

      <button
        type="button"
        class="dashboard-fab-trigger"
        :class="{ open: isFabOpen }"
        :aria-expanded="isFabOpen ? 'true' : 'false'"
        aria-controls="dashboard-fab-menu"
        aria-label="Schnellaktionen öffnen"
        @click="toggleFabMenu"
      >
        <FateIcon name="add" :size="20" class="dashboard-fab-trigger-icon" :class="{ open: isFabOpen }" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  width: 100%;
}

.campaign-dropdown {
  margin-top: 0.25rem;
}

:deep(.campaign-dropdown.fate-dropdown) {
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  --dropdown-min-width: 0;
  --dropdown-max-width: 100%;
}

.dashboard-sidebar :deep(.campaign-dropdown.fate-dropdown) {
  width: 165px;
}

:deep(.campaign-dropdown .fate-dropdown__select) {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.campaign-select-inline {
  flex: 1;
  min-width: 0;
  padding: 0.25rem 0.4rem;
  font-size: 0.85rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  background: var(--fate-white);
  color: var(--fate-text);
  cursor: pointer;
}

.campaign-select-inline:focus {
  outline: 2px solid var(--fate-blue);
  outline-offset: 2px;
}

.campaign-select-empty {
  color: var(--fate-text-light);
  font-size: 0.82rem;
  margin-top: 0.25rem;
  white-space: nowrap;
}

.dashboard-sidebar {
  position: fixed;
  left: 0;
  top: 56px;
  bottom: 0;
  width: 188px;
  background: var(--fate-white);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  z-index: 10;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.2s ease,
    height 0.2s ease,
    border-radius 0.2s ease;
}

.sidebar-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 1.25rem;
  padding-left: 0.5rem;
}

.dashboard-sidebar.collapsed {
  transform: translateX(-188px);
}

.sidebar-lash {
  position: fixed;
  left: 0;
  top: 62px;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fate-white);
  border: none;
  border-radius: 0 6px 6px 0;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.12);
  color: var(--fate-text-light);
  cursor: pointer;
}

.sidebar-lash:hover {
  background: var(--fate-blue-light);
  color: var(--fate-blue);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.5rem 0.3rem 0.7rem;
  border-bottom: 1px solid var(--fate-border);
}

.sidebar-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fate-text-light);
  margin: 0;
}

.sidebar-toggle {
  flex-shrink: 0;
  color: var(--fate-text-light);
}

.dashboard-sidebar.collapsed .sidebar-toggle {
  width: 100%;
  justify-content: center;
}

.sidebar-group {
  margin-top: 1rem;
  min-width: 0;
}

.sidebar-group:first-child {
  margin-top: 0.75rem;
}

.sidebar-group :deep(.campaign-dropdown) {
  margin-bottom: 0.25rem;
}

.sidebar-group-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fate-blue);
  background: var(--fate-blue-light);
  padding: 2px 6px;
  margin-bottom: 0.4rem;
  white-space: nowrap;
}

.dashboard-filters-inline {
  display: none;
  flex-direction: column;
  margin-bottom: 1rem;
  background: var(--fate-white);
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  overflow: hidden;
}

.filters-toggle-row {
  display: flex;
  align-items: stretch;
}

.filters-toggle {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: var(--fate-btn-primary-bg, var(--fate-blue));
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: white;
  cursor: pointer;
  font-family: inherit;
}

.filters-toggle:hover {
  background: color-mix(in srgb, var(--fate-btn-primary-bg, var(--fate-blue)) 88%, white);
}

.filters-expand-all {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.6rem;
  background: color-mix(in srgb, var(--fate-btn-primary-bg, var(--fate-blue)) 80%, white);
  border: none;
  border-left: 1px solid color-mix(in srgb, var(--fate-btn-primary-bg, var(--fate-blue)) 70%, white);
  color: white;
  cursor: pointer;
  flex-shrink: 0;
}

.filters-expand-all:hover {
  background: color-mix(in srgb, var(--fate-btn-primary-bg, var(--fate-blue)) 70%, white);
}

.filters-toggle-icon {
  transition: transform 0.2s ease;
  transform: rotate(90deg);
}

.filters-toggle-icon.open {
  transform: rotate(270deg);
}

.filters-expand-all .filters-toggle-icon {
  transform: rotate(0deg);
}

.filters-expand-all .filters-toggle-icon.open {
  transform: rotate(180deg);
}

.filters-body {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--fate-border);
  max-height: 60vh;
  overflow-y: auto;
}

.filters-section + .filters-section {
  border-top: 1px solid var(--fate-border);
}

.filters-section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.4rem 0.75rem;
  background: var(--fate-blue-light);
  border: none;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fate-blue);
  cursor: pointer;
  font-family: inherit;
}

.filters-section-toggle:hover {
  background: color-mix(in srgb, var(--fate-blue-light) 70%, var(--fate-blue));
}

.filters-section-body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.25rem 0.75rem 0.5rem;
  border-top: 1px solid var(--fate-border);
}

.dashboard-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.dashboard-section-divider {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  margin: 0 0 1.5rem;
  color: var(--fate-text-light);
  justify-self: stretch;
}

.dashboard-section-divider::before,
.dashboard-section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, var(--fate-border) 75%, transparent);
}

.dashboard-section-divider__label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.dashboard-stack--grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
}

@container main (width < 800px) {
  .dashboard-stack--grid {
    grid-template-columns: 1fr;
  }
}

.dashboard-entry {
  container-type: inline-size;
  container-name: character-card;
  background: transparent;
  overflow: visible;
}

.dashboard-entry-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  min-height: 2.75rem;
  border-top: 1px solid var(--fate-border);
  background: var(--fate-blue-light);
}

.dashboard-empty {
  text-align: center;
  color: var(--fate-text-light);
  padding: 3rem;
  font-size: 0.9rem;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--fate-overlay);
  z-index: 1000;
}

.dialog-box {
  width: min(100%, 30rem);
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--fate-white);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.dialog-title {
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--fate-text);
}

.dialog-message {
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--fate-text);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.dashboard-fab {
  position: fixed;
  right: 1.1rem;
  bottom: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  z-index: 900;
}

.dashboard-fab-menu {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.dashboard-fab-action {
  border: 1px solid var(--fate-border);
  border-radius: 999px;
  background: var(--fate-white);
  color: var(--fate-text);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
  cursor: pointer;
}

.dashboard-fab-action:hover {
  background: var(--fate-blue-light);
  color: var(--fate-heading);
}

.dashboard-fab-trigger {
  width: 3rem;
  height: 3rem;
  border: 1px solid color-mix(in srgb, var(--fate-blue) 65%, var(--fate-border));
  border-radius: 999px;
  background: var(--fate-blue);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.3);
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    background 0.12s ease;
}

.dashboard-fab-trigger-icon {
  transition: transform 0.16s ease;
  transform: rotate(0deg);
}

.dashboard-fab-trigger-icon.open {
  transform: rotate(45deg);
}

.dashboard-fab-trigger:hover {
  background: color-mix(in srgb, var(--fate-blue) 85%, white);
}

.dashboard-fab-trigger.open {
  background: var(--fate-blue-dark);
  border-color: var(--fate-blue-dark);
}

.dashboard-fab-trigger:active {
  transform: translateY(1px);
}

.dashboard-fab-trigger:focus-visible,
.dashboard-fab-action:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--fate-blue) 75%, white);
  outline-offset: 2px;
}

.fab-actions-enter-active,
.fab-actions-leave-active {
  transition: all 0.16s ease;
}

.fab-actions-enter-from,
.fab-actions-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.cheat-sheet-popover {
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  overflow: visible;
}

.cheat-sheet-popover:popover-open {
  position: fixed;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: min(96vw, 1140px);
}

.cheat-sheet-popover::backdrop {
  background: var(--fate-overlay);
}

.cheat-sheet-popover-panel {
  max-height: 92vh;
  overflow: auto;
  border-radius: 14px;
}

:global(html[data-theme='dark']) .dashboard-fab-trigger.open {
  background: var(--fate-nav-active-bg);
  border-color: var(--fate-nav-active-bg);
}

@media (prefers-color-scheme: dark) {
  :global(html:not([data-theme='light'])) .dashboard-fab-trigger.open {
    background: var(--fate-nav-active-bg);
    border-color: var(--fate-nav-active-bg);
  }
}

@container character-card (width < 480px) {
  :deep(.dashboard-inline-edit-action .btn-label) {
    display: none;
  }

  :deep(.dashboard-inline-edit-action.fate-btn) {
    padding: 0;
    width: var(--btn-size, 32px);
    justify-content: center;
  }
}

@container main (width < 480px) {
  .dialog-actions--stack-mobile {
    flex-wrap: wrap;
    justify-content: stretch;
  }

  .dialog-actions--stack-mobile :deep(.fate-btn) {
    flex: 1 1 100%;
    justify-content: center;
  }
}

@media (max-width: 900px) {
  .dashboard-sidebar {
    display: none;
  }

  .dashboard-filters-inline {
    display: flex;
  }

  .dashboard-fab {
    right: 0.85rem;
    bottom: 0.85rem;
  }
}
</style>
