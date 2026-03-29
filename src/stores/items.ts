import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Item } from '../types';

function migrateItem(item: Item): Item {
  if (item.pureDamage !== undefined || item.deflection !== undefined) {
    item.modifiers = [
      { label: 'Purer Schaden', value: item.pureDamage ?? 0 },
      { label: 'Deflektion', value: item.deflection ?? 0 },
    ];
    delete item.pureDamage;
    delete item.deflection;
  }
  return item;
}

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([]);

  function addItem(item: Item) {
    items.value.push(item);
  }

  function updateItem(updated: Item) {
    const index = items.value.findIndex((i) => i.id === updated.id);
    if (index !== -1) {
      items.value[index] = updated;
    }
  }

  function deleteItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id);
  }

  function getById(id: string): Item | undefined {
    return items.value.find((i) => i.id === id);
  }

  function replaceAll(incoming: Item[]) {
    items.value = incoming;
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
