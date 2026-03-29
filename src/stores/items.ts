import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Item } from '../types';
import { normalizeItemStress } from '../utils/stressTracks';
import { useCharacterItemsStore } from './characterItems';

function migrateItem(item: Item): Item {
  const migrated = normalizeItemStress(item);

  if (migrated.pureDamage !== undefined || migrated.deflection !== undefined) {
    migrated.modifiers = [
      { label: 'Purer Schaden', value: migrated.pureDamage ?? 0 },
      { label: 'Deflektion', value: migrated.deflection ?? 0 },
    ];
    delete migrated.pureDamage;
    delete migrated.deflection;
  }

  return migrated;
}

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([]);

  function addItem(item: Item) {
    items.value.push(migrateItem(item));
  }

  function updateItem(updated: Item) {
    const index = items.value.findIndex((i) => i.id === updated.id);
    if (index !== -1) {
      items.value[index] = migrateItem(updated);
    }
  }

  function deleteItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id);
    useCharacterItemsStore().unassignAllForItem(id);
  }

  function getById(id: string): Item | undefined {
    return items.value.find((i) => i.id === id);
  }

  function replaceAll(incoming: Item[]) {
    items.value = incoming.map(migrateItem);
  }

  function reset() {
    items.value = [];
  }

  return { items, addItem, updateItem, deleteItem, getById, replaceAll, reset };
}, {
  persist: {
    key: 'fcp-items',
    afterHydrate: (ctx) => {
      ctx.store.items = ctx.store.items.map(migrateItem);
    },
  },
});
