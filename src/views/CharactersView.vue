<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCharactersStore } from '../stores/characters';
import { useGMModeStore } from '../stores/gmMode';
import type { Character, CharacterType } from '../types';
import FateButton from '../components/shared/FateButton.vue';
import FateCard from '../components/shared/FateCard.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import FateCheckbox from '../components/shared/FateCheckbox.vue';
import { useToastStore } from '../stores/toast';
import { useConfirmDialog } from '../composables/useConfirmDialog';

const router = useRouter();
const route = useRoute();
const store = useCharactersStore();
const gmModeStore = useGMModeStore();
const toastStore = useToastStore();
const search = ref('');
const showArchivedCharacters = ref(false);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

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

const filtered = computed(() =>
  store.characters.filter((c) => {
    const type = c.type ?? 'sc';
    if (c.archived && !showArchivedCharacters.value) return false;
    if (!gmModeStore.isGMMode && type === 'nsc') return false;
    return (
      type === activeTab.value &&
      (c.name.toLowerCase().includes(search.value.toLowerCase()) ||
        c.highConcept.toLowerCase().includes(search.value.toLowerCase()))
    );
  }),
);

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
      <FateButton variant="primary" icon="add" @click="router.push(`/characters/new?type=${activeTab}`)">Neuer Charakter</FateButton>
    </FateHeader>

    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'sc' }"
        @click="setTab('sc')"
      >
        Spielercharaktere (SC)
      </button>
      <button
        v-if="gmModeStore.isGMMode"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'nsc' }"
        @click="setTab('nsc')"
      >
        Nicht-Spieler-Charaktere (NSC)
      </button>
    </div>

    <div class="characters-input-row">
      <input v-model="search" class="search-input" placeholder="Charakter suchen..." type="search" />
      <FateCheckbox v-model="showArchivedCharacters" label="Zeige archivierte Charaktere" />
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
        :color="char.color"
        :avatar="char.avatar"
        :title="char.name || 'Unbenannt'"
        :badge-label="char.archived ? 'ARCHIVIERT' : undefined"
        badge-variant="status"
        clickable
        @click="router.push(`/characters/${char.id}`)"
      >
        {{ char.highConcept || '—' }}
        <template #meta>
          <span v-if="char.trouble" class="card-trouble"><em>{{ char.trouble }}</em></span>
        </template>
        <template #actions>
          <FateButton icon="edit" variant="secondary" size="S" @click.stop="router.push(`/characters/${char.id}/edit`)" />
          <FateButton
            v-if="gmModeStore.isGMMode"
            :icon="char.archived ? 'unarchive' : 'archive'"
            variant="secondary"
            size="S"
            :aria-label="char.archived ? 'Charakter entarchivieren' : 'Charakter archivieren'"
            :title="char.archived ? 'Entarchivieren' : 'Archivieren'"
            @click.stop="toggleArchived(char)"
          />
          <FateButton icon="delete" variant="danger" size="S" @click.stop="deleteCharacter(char.id, char.name)" />
        </template>
      </FateCard>
    </div>
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

.search-input {
  flex: 1;
  min-width: min(260px, 100%);
  max-width: 400px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--fate-text);
  background: white;
}

.tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--fate-border);
}

.tab-btn {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  margin-bottom: -2px;
  padding: 0.5rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--fate-text-light);
  cursor: pointer;
  box-shadow: none;
  transition:
    color 0.15s,
    border-bottom-color 0.15s;
}

.tab-btn:hover {
  color: var(--fate-blue);
}

.tab-btn--active {
  color: var(--fate-blue);
  border-bottom-color: var(--fate-blue);
  font-weight: 700;
}
</style>
