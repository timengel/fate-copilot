<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import { useGMModeStore } from '../stores/gmMode';
import FateButton from '../components/shared/FateButton.vue';
import FateCard from '../components/shared/FateCard.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
import FateCheckbox from '../components/shared/FateCheckbox.vue';
import { useConfirmDialog } from '../composables/useConfirmDialog';

const router = useRouter();
const store = useItemsStore();
const gmModeStore = useGMModeStore();
const search = ref('');
const showArchivedItems = ref(false);
const { confirmDialog, showConfirmDialog } = useConfirmDialog();

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
</script>

<template>
  <div class="list-view">
    <FateHeader title="Gegenstände">
      <FateButton variant="primary" icon="add" @click="router.push('/items/new')">Neuer Gegenstand</FateButton>
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
        :badge-label="item.hidden ? 'GM' : undefined"
        badge-variant="gm"
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
          <FateButton icon="edit" variant="secondary" size="S" @click.stop="router.push(`/items/${item.id}/edit`)" />
          <FateButton icon="delete" variant="danger" size="S" @click.stop="deleteItem(item.id, item.name)" />
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
