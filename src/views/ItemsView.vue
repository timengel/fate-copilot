<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import { useGMModeStore } from '../stores/gmMode';
import FateButton from '../components/shared/FateButton.vue';
import FateAvatar from '../components/shared/FateAvatar.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import { getColorVars } from '../composables/useColorVars';
import { useConfirmDialog } from '../composables/useConfirmDialog';

const router = useRouter();
const store = useItemsStore();
const gmModeStore = useGMModeStore();
const search = ref('');
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

const filtered = computed(() =>
  store.items.filter(
    (c) =>
      c.name.toLowerCase().includes(search.value.toLowerCase()) &&
      (gmModeStore.isGMMode || !c.hidden),
  ),
);

const totalItems = computed(() => store.items.length);

function cardHeaderStyle(colorId?: string) {
  return { background: getColorVars(colorId)['--fate-blue'] };
}

function deleteItem(id: string, name: string) {
  showConfirmDialog(
    'Gegenstand löschen',
    `Gegenstand "${name || 'Unbenannt'}" wirklich löschen?`,
    () => store.deleteItem(id),
  );
}
</script>

<template>
  <div class="list-view">
    <FateHeader title="Gegenstände">
      <FateButton variant="primary" icon="add" @click="router.push('/items/new')">Neuer Gegenstand</FateButton>
    </FateHeader>

    <input v-model="search" class="search-input" placeholder="Gegenstand suchen..." type="search" />

    <div v-if="filtered.length === 0" class="empty-state">
      {{ totalItems === 0 ? 'Noch keine Gegenstände vorhanden.' : 'Keine Treffer gefunden.' }}
    </div>

    <div v-else class="card-grid">
      <div
        v-for="item in filtered"
        :key="item.id"
        class="character-card"
        @click="router.push(`/items/${item.id}`)"
      >
        <div class="card-header" :style="cardHeaderStyle(item.color)">
          <FateAvatar :value="item.avatar" size="S" />
          <span class="card-header-title">{{ item.name || 'Unbenannt' }}</span>
          <span v-if="item.hidden" class="card-hidden-badge">GM</span>
        </div>
        <div v-if="item.description" class="card-description">{{ item.description }}</div>
        <div v-if="item.redDice || item.blueDice" class="card-meta">
          <span v-if="item.redDice">{{ item.redDice }} 🟥</span>
          <span v-if="item.redDice && item.blueDice"> · </span>
          <span v-if="item.blueDice">{{ item.blueDice }} 🟦</span>
        </div>
        <div class="card-actions">
          <FateButton icon="edit" variant="secondary" size="S" @click.stop="router.push(`/items/${item.id}/edit`)" />
          <FateButton icon="delete" variant="danger" size="S" @click.stop="deleteItem(item.id, item.name)" />
        </div>
      </div>
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
.character-card {
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
  max-height: 210px;
}

.character-card:hover {
  box-shadow: 0 2px 12px rgba(28, 158, 214, 0.15);
  border-color: var(--fate-blue);
}

.card-header {
  background: var(--fate-blue);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.6rem 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.card-header-title {
  min-width: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  padding: 0.25rem 0.9rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--fate-text);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  padding: 0.1rem 0.9rem 0.25rem;
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

.card-hidden-badge {
  margin-left: auto;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  letter-spacing: 0.05em;
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
</style>
