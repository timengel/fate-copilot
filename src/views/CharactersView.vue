<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCharactersStore } from '../stores/characters';
import { useGMModeStore } from '../stores/gmMode';
import type { CharacterType } from '../types';
import FateButton from '../components/shared/FateButton.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import { getColorVars } from '../composables/useColorVars';
import { useConfirmDialog } from '../composables/useConfirmDialog';

const router = useRouter();
const route = useRoute();
const store = useCharactersStore();
const gmModeStore = useGMModeStore();
const search = ref('');
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
    return (
      type === activeTab.value &&
      (c.name.toLowerCase().includes(search.value.toLowerCase()) ||
        c.highConcept.toLowerCase().includes(search.value.toLowerCase()))
    );
  }),
);

const tabTotal = computed(
  () => store.characters.filter((c) => (c.type ?? 'sc') === activeTab.value).length,
);

function cardHeaderStyle(colorId?: string) {
  return { background: getColorVars(colorId)['--fate-blue'] };
}

function deleteCharacter(id: string, name: string) {
  showConfirmDialog(
    'Charakter löschen',
    `Charakter "${name || 'Unbenannt'}" wirklich löschen?`,
    () => store.deleteCharacter(id),
  );
}
</script>

<template>
  <div class="list-view">
    <FateHeader title="Charaktere">
      <FateButton @click="router.push(`/characters/new?type=${activeTab}`)">+ Neuer Charakter</FateButton>
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

    <input v-model="search" class="search-input" placeholder="Charakter suchen..." type="search" />

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
      <router-link
        v-for="char in filtered"
        :key="char.id"
        class="character-card"
        :to="`/characters/${char.id}`"
      >
        <div class="card-header" :style="cardHeaderStyle(char.color)">
          {{ char.name || '(Unbenannt)' }}
        </div>
        <div class="card-concept">{{ char.highConcept || '—' }}</div>
        <div class="card-trouble" v-if="char.trouble">
          <em>{{ char.trouble }}</em>
        </div>
        <div class="card-actions" @click.stop>
          <FateButton icon="edit" variant="secondary" size="S" @click="router.push(`/characters/${char.id}/edit`)" />
          <FateButton icon="delete" variant="danger" size="S" @click="deleteCharacter(char.id, char.name)" />
        </div>
      </router-link>
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
.character-card,
.campaign-card {
  background: white;
  border: 1px solid var(--fate-border);
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
  transition:
    box-shadow 0.15s,
    border-color 0.15s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
}

.character-card:hover,
.campaign-card:hover {
  box-shadow: 0 2px 12px rgba(28, 158, 214, 0.15);
  border-color: var(--fate-blue);
}

.card-header {
  background: var(--fate-blue);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.6rem 0.9rem;
}

.card-concept {
  padding: 0.5rem 0.9rem 0.25rem;
  font-size: 0.875rem;
  color: var(--fate-text);
}

.card-trouble {
  padding: 0 0.9rem 0.25rem;
  font-size: 0.8rem;
  color: var(--fate-text-light);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem 0.75rem;
  margin-top: auto;
  justify-content: flex-end;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--fate-border);
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
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
