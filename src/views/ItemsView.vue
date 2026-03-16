<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import FateButton from '../components/shared/FateButton.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import { getColorVars } from '../composables/useColorVars';
import { useConfirmDialog } from '../composables/useConfirmDialog';

const router = useRouter();
const store = useItemsStore();
const search = ref('');
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

const filtered = computed(() =>
  store.items.filter((c) => c.name.toLowerCase().includes(search.value.toLowerCase())),
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
      <FateButton @click="router.push('/items/new')">+ Neuer Gegenstand</FateButton>
    </FateHeader>

    <input v-model="search" class="search-input" placeholder="Gegenstand suchen..." type="search" />

    <div v-if="filtered.length === 0" class="empty-state">
      {{ totalItems === 0 ? 'Noch keine Gegenstände vorhanden.' : 'Keine Treffer gefunden.' }}
    </div>

    <div v-else class="card-grid">
      <router-link
        v-for="item in filtered"
        :key="item.id"
        class="character-card"
        :to="`/items/${item.id}`"
      >
        <div class="card-header" :style="cardHeaderStyle(item.color)">
          {{ item.name || '(Unbenannt)' }}
        </div>
        <div class="card-actions" @click.stop>
          <FateButton icon="edit" variant="secondary" size="S" @click="router.push(`/items/${item.id}/edit`)" />
          <FateButton icon="delete" variant="danger" size="S" @click="deleteItem(item.id, item.name)" />
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
  text-decoration: none;
  color: inherit;
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
</style>
