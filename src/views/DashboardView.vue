<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch, watchEffect } from 'vue'
import { useCampaignsStore } from '../stores/campaigns'
import { useCharactersStore } from '../stores/characters'
import { useGMModeStore } from '../stores/gmMode'
import { useToastStore } from '../stores/toast'
import CharacterSheet from '../components/character/CharacterSheet.vue'
import FateButton from '../components/shared/FateButton.vue'
import type { Character } from '../types'

const campaignsStore = useCampaignsStore()
const charactersStore = useCharactersStore()
const gmModeStore = useGMModeStore()
const toastStore = useToastStore()

const sidebarCollapsed = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<InstanceType<typeof CharacterSheet>[]>([])
const selectedCampaignId = ref<string | null>(null)
const showSC = ref(true)
const showNSC = ref(true)

const visibleSections = reactive({
  allgemeines: true,
  aspekte: true,
  fertigkeiten: true,
  extras: true,
  stunts: true,
  stress: true,
  konsequenzen: true,
})

watchEffect(() => {
  if (!selectedCampaignId.value) {
    const first = campaignsStore.activeCampaigns[0]
    if (first) selectedCampaignId.value = first.id
  }
})

const allCampaigns = computed(() => campaignsStore.campaigns)

const allCharactersInCampaign = computed(() =>
  selectedCampaignId.value
    ? campaignsStore.getCharactersForCampaign(selectedCampaignId.value)
    : []
)

const characters = computed(() => {
  return allCharactersInCampaign.value.filter(c => {
    const type = c.type ?? 'sc'
    if (!gmModeStore.isGMMode && type === 'nsc') return false
    if (type === 'sc' && !showSC.value) return false
    if (type === 'nsc' && !showNSC.value) return false
    return true
  })
})

function handleSave(updated: Character) {
  charactersStore.updateCharacter(updated)
  editingId.value = null
  toastStore.show('Charakter gespeichert')
}

function saveEditing() {
  formRef.value?.[0]?.save()
}

watch(sidebarCollapsed, (val) => {
  document.body.classList.toggle('sidebar-collapsed', val)
})

onMounted(() => document.body.classList.add('has-dashboard-sidebar'))
onUnmounted(() => {
  document.body.classList.remove('has-dashboard-sidebar')
  document.body.classList.remove('sidebar-collapsed')
})
</script>

<template>
  <div class="dashboard-view">
    <!-- Sidebar (desktop) -->
    <aside class="dashboard-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h3 class="sidebar-title" v-show="!sidebarCollapsed">Filter</h3>
        <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? 'Sidebar öffnen' : 'Sidebar schließen'">
          {{ sidebarCollapsed ? '›' : '‹' }}
        </button>
      </div>

      <div v-show="!sidebarCollapsed">
        <div class="sidebar-group">
          <div class="sidebar-group-label">Charaktere</div>
          <label class="filter-label">
            <input type="checkbox" v-model="showSC" />
            Zeige SC
          </label>
          <label class="filter-label" v-if="gmModeStore.isGMMode">
            <input type="checkbox" v-model="showNSC" />
            Zeige NSC
          </label>
        </div>

        <div class="sidebar-group">
          <div class="sidebar-group-label">Sektionen</div>
          <label class="filter-label">
            <input type="checkbox" v-model="visibleSections.allgemeines" />
            Allgemeines
          </label>
          <label class="filter-label">
            <input type="checkbox" v-model="visibleSections.aspekte" />
            Aspekte
          </label>
          <label class="filter-label">
            <input type="checkbox" v-model="visibleSections.fertigkeiten" />
            Fertigkeiten
          </label>
          <label class="filter-label">
            <input type="checkbox" v-model="visibleSections.extras" />
            Extras
          </label>
          <label class="filter-label">
            <input type="checkbox" v-model="visibleSections.stunts" />
            Stunts
          </label>
          <label class="filter-label">
            <input type="checkbox" v-model="visibleSections.stress" />
            Stress
          </label>
          <label class="filter-label">
            <input type="checkbox" v-model="visibleSections.konsequenzen" />
            Konsequenzen
          </label>
        </div>
      </div>
    </aside>

    <div class="dashboard-header">
      <div v-if="allCampaigns.length === 0" class="campaign-select-empty">
        Noch keine Kampagnen angelegt.
      </div>
      <select v-else v-model="selectedCampaignId" class="campaign-select">
        <option :value="null" disabled>Kampagne wählen…</option>
        <option v-for="campaign in allCampaigns" :key="campaign.id" :value="campaign.id">
          {{ campaign.name }}
        </option>
      </select>
    </div>

    <!-- Inline filters for small screens -->
    <div class="dashboard-filters-inline">
      <div class="filters-inline-row">
        <span class="filters-inline-label">Charaktere:</span>
        <label class="filter-label">
          <input type="checkbox" v-model="showSC" />
          SC
        </label>
        <label class="filter-label" v-if="gmModeStore.isGMMode">
          <input type="checkbox" v-model="showNSC" />
          NSC
        </label>
      </div>
      <div class="filters-inline-row">
        <span class="filters-inline-label">Sektionen:</span>
        <label class="filter-label">
          <input type="checkbox" v-model="visibleSections.allgemeines" />
          Allgemeines
        </label>
        <label class="filter-label">
          <input type="checkbox" v-model="visibleSections.aspekte" />
          Aspekte
        </label>
        <label class="filter-label">
          <input type="checkbox" v-model="visibleSections.fertigkeiten" />
          Fertigkeiten
        </label>
        <label class="filter-label">
          <input type="checkbox" v-model="visibleSections.extras" />
          Extras
        </label>
        <label class="filter-label">
          <input type="checkbox" v-model="visibleSections.stunts" />
          Stunts
        </label>
        <label class="filter-label">
          <input type="checkbox" v-model="visibleSections.stress" />
          Stress
        </label>
        <label class="filter-label">
          <input type="checkbox" v-model="visibleSections.konsequenzen" />
          Konsequenzen
        </label>
      </div>
    </div>

    <div v-if="!selectedCampaignId" class="dashboard-empty">
      Keine Kampagne ausgewählt.
    </div>
    <div v-else-if="allCharactersInCampaign.length === 0" class="dashboard-empty">
      Keine Charaktere in dieser Kampagne.
    </div>
    <div v-else-if="characters.length === 0" class="dashboard-empty">
      Alle Charaktere sind ausgeblendet.
    </div>
    <div v-else class="dashboard-stack">
      <div v-for="character in characters" :key="character.id" class="dashboard-entry">
        <CharacterSheet
          v-if="editingId === character.id"
          ref="formRef"
          mode="edit"
          :character="character"
          :hideActions="true"
          @save="handleSave"
          @cancel="editingId = null"
        />
        <CharacterSheet v-else :character="character" :sections="visibleSections" />
        <div class="dashboard-entry-toolbar">
          <template v-if="editingId === character.id">
            <FateButton variant="secondary" size="S" @click="editingId = null">Abbrechen</FateButton>
            <FateButton variant="primary" size="S" @click="saveEditing">Speichern</FateButton>
          </template>
          <template v-else>
            <FateButton icon="edit" variant="secondary" size="S" @click="editingId = character.id">Bearbeiten</FateButton>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  width: 100%;
}

.dashboard-header {
  margin-bottom: 1.25rem;
}

.campaign-select {
  width: 100%;
  max-width: 400px;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  background: var(--fate-white);
  color: var(--fate-text);
  cursor: pointer;
}

.campaign-select:focus {
  outline: 2px solid var(--fate-blue);
  outline-offset: 2px;
}

.campaign-select-empty {
  color: var(--fate-text-light);
  font-size: 0.9rem;
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
  transition: width 0.2s ease, padding 0.2s ease;
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

.filter-label input[type='checkbox'] {
  accent-color: var(--fate-blue);
  width: 15px;
  height: 15px;
  cursor: pointer;
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
}

.dashboard-entry {
  background: var(--fate-white);
  border: 1px solid var(--fate-border);
  border-radius: 8px;
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
