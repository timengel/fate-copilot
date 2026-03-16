import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Item } from '../types';

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

  return { items, addItem, updateItem, deleteItem, getById, replaceAll };
});
