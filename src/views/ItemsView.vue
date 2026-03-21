<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import { useGMModeStore } from '../stores/gmMode';
import FateButton from '../components/shared/FateButton.vue';
import FateCard from '../components/shared/FateCard.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import ConfirmDialog from '../components/shared/ConfirmDialog.vue';
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
