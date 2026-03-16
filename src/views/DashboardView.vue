<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useSessionStorage } from '@vueuse/core';
import { useCampaignsStore } from '../stores/campaigns';
import { useCharactersStore } from '../stores/characters';
import { useGMModeStore } from '../stores/gmMode';
import { useToastStore } from '../stores/toast';
import CharacterSheet from '../components/character/CharacterSheet.vue';
import ItemSheet from '../components/character/ItemSheet.vue';
import FateButton from '../components/shared/FateButton.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import FateCheckbox from '../components/shared/FateCheckbox.vue';
import type { Character } from '../types';

const campaignsStore = useCampaignsStore();
const charactersStore = useCharactersStore();
const gmModeStore = useGMModeStore();
const toastStore = useToastStore();

const sidebarCollapsed = ref(false);
const editingId = ref<string | null>(null);
const formRef = ref<InstanceType<typeof CharacterSheet>[]>([]);
const selectedCampaignId = useSessionStorage<string | null>('dashboard-campaign', null);
const showSC = useSessionStorage('dashboard-show-sc', true);
const showNSC = useSessionStorage('dashboard-show-nsc', true);
const showItems = useSessionStorage('dashboard-show-items', true);
const showEditButton = useSessionStorage('dashboard-show-edit-btn', true);
const dashboardLayout = useSessionStorage<'list' | 'grid'>('dashboard-layout', 'list');

const visibleSections = useSessionStorage('dashboard-sections', {
  general: true,
  aspects: true,
  skills: true,
  extras: true,
  stunts: true,
  stress: true,
  consequences: true,
  gmNotes: true,
  dice: true,
});

const allCampaigns = computed(() =>
  gmModeStore.isGMMode
    ? campaignsStore.campaigns
    : campaignsStore.campaigns.filter((c) => c.status === 'active'),
);

watchEffect(() => {
  const visible = allCampaigns.value;
  if (!selectedCampaignId.value || !visible.find((c) => c.id === selectedCampaignId.value)) {
    selectedCampaignId.value = visible[0]?.id ?? null;
  }
});

const allCharactersInCampaign = computed(() =>
  selectedCampaignId.value ? campaignsStore.getCharactersForCampaign(selectedCampaignId.value) : [],
);

const allItemsInCampaign = computed(() =>
  selectedCampaignId.value ? campaignsStore.getItemsForCampaign(selectedCampaignId.value) : [],
);

const items = computed(() => {
  if (!showItems.value) return [];
  return allItemsInCampaign.value.filter((i) => gmModeStore.isGMMode || !i.hidden);
});

const characters = computed(() => {
  return allCharactersInCampaign.value.filter((c) => {
    const type = c.type ?? 'sc';
    if (!gmModeStore.isGMMode && type === 'nsc') return false;
    if (type === 'sc' && !showSC.value) return false;
    if (type === 'nsc' && !showNSC.value) return false;
    return true;
  });
});

function handleSave(updated: Character) {
  charactersStore.updateCharacter(updated);
  editingId.value = null;
  toastStore.show('Charakter gespeichert');
}

function saveEditing() {
  formRef.value?.[0]?.save();
}

watch(sidebarCollapsed, (val) => {
  document.body.classList.toggle('sidebar-collapsed', val);
});

watch(dashboardLayout, (val) => {
  document.body.classList.toggle('dashboard-grid-active', val === 'grid');
}, { immediate: true });

onMounted(() => {
  // sidebar-no-transition disables the CSS transition on mount so the initial
  // padding-left jump is not animated. Double rAF ensures at least one frame
  // has been painted before re-enabling the transition.
  document.body.classList.add('has-dashboard-sidebar', 'sidebar-no-transition');
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
});
</script>

<template>
  <div class="dashboard-view">
    <!-- Sidebar (desktop) -->
    <aside class="dashboard-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h3 class="sidebar-title" v-show="!sidebarCollapsed">Filter</h3>
        <button
          class="sidebar-toggle"
          @click="sidebarCollapsed = !sidebarCollapsed"
          :title="sidebarCollapsed ? 'Sidebar öffnen' : 'Sidebar schließen'"
        >
          {{ sidebarCollapsed ? '›' : '‹' }}
        </button>
      </div>

      <div v-show="!sidebarCollapsed">
        <div class="sidebar-group">
          <div class="sidebar-group-label">Kampagne</div>
          <div v-if="allCampaigns.length === 0" class="campaign-select-empty">
            Keine Kampagnen vorhanden.
          </div>
          <select v-else v-model="selectedCampaignId" class="campaign-select">
            <option :value="null" disabled>Wählen…</option>
            <option v-for="campaign in allCampaigns" :key="campaign.id" :value="campaign.id">
              {{ campaign.name }}
            </option>
          </select>
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-label">Charaktere</div>
          <FateCheckbox v-model="showSC" label="Zeige SC" />
          <FateCheckbox v-if="gmModeStore.isGMMode" v-model="showNSC" label="Zeige NSC" />
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-label">Items</div>
          <FateCheckbox v-model="showItems" label="Zeige Items" />
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
          <FateCheckbox v-if="gmModeStore.isGMMode" v-model="visibleSections.gmNotes" label="GM-Notizen" />
          <FateCheckbox v-if="showItems" v-model="visibleSections.dice" label="Würfel (Items)" />
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-label">Aktionen</div>
          <FateCheckbox v-model="showEditButton" label="Bearbeiten" />
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-label">Layout</div>
          <label class="filter-label">
            <input type="radio" v-model="dashboardLayout" value="list" />
            Liste
          </label>
          <label class="filter-label">
            <input type="radio" v-model="dashboardLayout" value="grid" />
            Zwei Spalten
          </label>
        </div>
      </div>
    </aside>

    <!-- Inline filters for small screens -->
    <div class="dashboard-filters-inline">
      <div class="filters-inline-row">
        <span class="filters-inline-label">Kampagne:</span>
        <div v-if="allCampaigns.length === 0" class="campaign-select-empty">
          Keine Kampagnen vorhanden.
        </div>
        <select v-else v-model="selectedCampaignId" class="campaign-select-inline">
          <option :value="null" disabled>Wählen…</option>
          <option v-for="campaign in allCampaigns" :key="campaign.id" :value="campaign.id">
            {{ campaign.name }}
          </option>
        </select>
      </div>
      <div class="filters-inline-row">
        <span class="filters-inline-label">Charaktere:</span>
        <FateCheckbox v-model="showSC" label="SC" />
        <FateCheckbox v-if="gmModeStore.isGMMode" v-model="showNSC" label="NSC" />
      </div>
      <div class="filters-inline-row">
        <span class="filters-inline-label">Items:</span>
        <FateCheckbox v-model="showItems" label="Zeige Items" />
      </div>
      <div class="filters-inline-row">
        <span class="filters-inline-label">Sektionen:</span>
        <FateCheckbox v-model="visibleSections.general" label="Allgemeines" />
        <FateCheckbox v-model="visibleSections.aspects" label="Aspekte" />
        <FateCheckbox v-model="visibleSections.skills" label="Fertigkeiten" />
        <FateCheckbox v-model="visibleSections.extras" label="Extras" />
        <FateCheckbox v-model="visibleSections.stunts" label="Stunts" />
        <FateCheckbox v-model="visibleSections.stress" label="Stress" />
        <FateCheckbox v-model="visibleSections.consequences" label="Konsequenzen" />
        <FateCheckbox v-if="gmModeStore.isGMMode" v-model="visibleSections.gmNotes" label="GM-Notizen" />
        <FateCheckbox v-if="showItems" v-model="visibleSections.dice" label="Würfel (Items)" />
        <FateCheckbox v-model="showEditButton" label="Bearbeiten" />
      </div>
      <div class="filters-inline-row">
        <span class="filters-inline-label">Layout:</span>
        <label class="filter-label">
          <input type="radio" v-model="dashboardLayout" value="list" />
          Liste
        </label>
        <label class="filter-label">
          <input type="radio" v-model="dashboardLayout" value="grid" />
          Zwei Spalten
        </label>
      </div>
    </div>

    <div v-if="!selectedCampaignId" class="dashboard-empty">Keine Kampagne ausgewählt.</div>
    <div v-else-if="allCharactersInCampaign.length === 0 && allItemsInCampaign.length === 0" class="dashboard-empty">
      Keine Charaktere oder Items in dieser Kampagne.
    </div>
    <div v-else-if="characters.length === 0 && items.length === 0" class="dashboard-empty">
      Alle Charaktere und Items sind ausgeblendet.
    </div>

    <div
      v-if="characters.length > 0"
      class="dashboard-stack"
      :class="{ 'dashboard-stack--grid': dashboardLayout === 'grid' }"
    >
      <div v-for="character in characters" :key="character.id" class="dashboard-entry">
        <CharacterSheet
          v-if="editingId === character.id"
          ref="formRef"
          mode="edit"
          :character="character"
          :hideActions="true"
          @save="handleSave"
          @cancel="editingId = null"
        >
          <template #edit-bar-actions>
            <FateButton icon="close" variant="outline" size="M" @click="editingId = null"
              ><span class="btn-label">Abbrechen</span></FateButton
            >
            <FateButton icon="check" variant="outline" size="M" @click="saveEditing"
              ><span class="btn-label">Speichern</span></FateButton
            >
          </template>
        </CharacterSheet>
        <CharacterSheet v-else :character="character" :sections="visibleSections">
          <template v-if="showEditButton" #name-bar-actions>
            <FateButton icon="edit" variant="outline" size="M" @click="editingId = character.id"
              ><span class="btn-label">Bearbeiten</span></FateButton
            >
          </template>
        </CharacterSheet>
      </div>
    </div>

    <div
      v-if="items.length > 0"
      class="dashboard-stack"
      :class="{ 'dashboard-stack--grid': dashboardLayout === 'grid' }"
    >
      <div v-for="item in items" :key="item.id" class="dashboard-entry">
        <ItemSheet :item="item" :sections="visibleSections" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  width: 100%;
}

.campaign-select {
  width: 100%;
  padding: 0.3rem 0.4rem;
  font-size: 0.85rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  background: var(--fate-white);
  color: var(--fate-text);
  cursor: pointer;
  margin-top: 0.25rem;
}

.campaign-select:focus {
  outline: 2px solid var(--fate-blue);
  outline-offset: 2px;
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
}

.dashboard-sidebar {
  position: fixed;
  left: 0;
  top: 56px;
  bottom: 0;
  width: 160px;
  background: var(--fate-white);
  border-right: 1px solid var(--fate-border);
  padding: 1.25rem 1rem;
  overflow-y: auto;
  z-index: 10;
  transition:
    width 0.2s ease,
    padding 0.2s ease;
}

.dashboard-sidebar.collapsed {
  width: 36px;
  padding: 1.25rem 0.5rem;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
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
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--fate-text-light);
  padding: 0.1rem 0.25rem;
  line-height: 1;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  color: var(--fate-blue);
}

.dashboard-sidebar.collapsed .sidebar-toggle {
  width: 100%;
  text-align: center;
}

.sidebar-group {
  margin-top: 1rem;
}

.sidebar-group-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fate-blue);
  margin-bottom: 0.4rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0;
}

.dashboard-filters-inline {
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  background: var(--fate-white);
  border: 1px solid var(--fate-border);
  border-radius: 6px;
}

.filters-inline-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}

.filters-inline-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fate-blue);
  white-space: nowrap;
}

.dashboard-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
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
  background: var(--fate-white);
  box-shadow: 0 1px 4px rgba(28, 158, 214, 0.08);
  overflow: hidden;
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

@media (max-width: 900px) {
  .dashboard-sidebar {
    display: none;
  }

  .dashboard-filters-inline {
    display: flex;
  }
}
</style>
