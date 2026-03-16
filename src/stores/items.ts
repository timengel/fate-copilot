import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Character } from '../types';

export const useItemsStore = defineStore('items', () => {
  const items = ref<Character[]>([]);

  function addItem(item: Character) {
    items.value.push(item);
  }

  function updateItem(updated: Character) {
    const index = items.value.findIndex((i) => i.id === updated.id);
    if (index !== -1) {
      items.value[index] = updated;
    }
  }

  function deleteItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id);
  }

  function getById(id: string): Character | undefined {
    return items.value.find((i) => i.id === id);
  }

  function replaceAll(incoming: Character[]) {
    items.value = incoming;
  }

  return { items, addItem, updateItem, deleteItem, getById, replaceAll };
});
