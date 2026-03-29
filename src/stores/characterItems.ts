import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CharacterItemAssignment } from '../types';
import { useCharactersStore } from './characters';
import { useItemsStore } from './items';

export const useCharacterItemsStore = defineStore('characterItems', () => {
  const assignments = ref<CharacterItemAssignment[]>([]);

  function assignItem(characterId: string, itemId: string) {
    const exists = assignments.value.some(
      (assignment) => assignment.characterId === characterId && assignment.itemId === itemId,
    );

    if (!exists) {
      assignments.value.push({ characterId, itemId });
    }
  }

  function unassignItem(characterId: string, itemId: string) {
    assignments.value = assignments.value.filter(
      (assignment) => !(assignment.characterId === characterId && assignment.itemId === itemId),
    );
  }

  function unassignAllForCharacter(characterId: string) {
    assignments.value = assignments.value.filter((assignment) => assignment.characterId !== characterId);
  }

  function unassignAllForItem(itemId: string) {
    assignments.value = assignments.value.filter((assignment) => assignment.itemId !== itemId);
  }

  function setItemsForCharacter(characterId: string, itemIds: string[]) {
    const uniqueItemIds = [...new Set(itemIds)];
    const otherAssignments = assignments.value.filter((assignment) => assignment.characterId !== characterId);
    assignments.value = [
      ...otherAssignments,
      ...uniqueItemIds.map((itemId) => ({ characterId, itemId })),
    ];
  }

  function getItemsForCharacter(characterId: string) {
    const itemsStore = useItemsStore();
    const itemIds = assignments.value
      .filter((assignment) => assignment.characterId === characterId)
      .map((assignment) => assignment.itemId);

    return itemsStore.items.filter((item) => itemIds.includes(item.id));
  }

  function getCharactersForItem(itemId: string) {
    const charactersStore = useCharactersStore();
    const characterIds = assignments.value
      .filter((assignment) => assignment.itemId === itemId)
      .map((assignment) => assignment.characterId);

    return charactersStore.characters.filter((character) => characterIds.includes(character.id));
  }

  function replaceAll(incoming: CharacterItemAssignment[]) {
    assignments.value = incoming;
  }

  function reset() {
    assignments.value = [];
  }

  return {
    assignments,
    assignItem,
    unassignItem,
    unassignAllForCharacter,
    unassignAllForItem,
    setItemsForCharacter,
    getItemsForCharacter,
    getCharactersForItem,
    replaceAll,
    reset,
  };
}, {
  persist: { key: 'fcp-character-items' },
});
