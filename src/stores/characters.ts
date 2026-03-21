import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Character } from '../types';

export const useCharactersStore = defineStore('characters', () => {
  const characters = ref<Character[]>([]);

  function addCharacter(character: Character) {
    characters.value.push(character);
  }

  function updateCharacter(updated: Character) {
    const index = characters.value.findIndex((c) => c.id === updated.id);
    if (index !== -1) {
      characters.value[index] = updated;
    }
  }

  function deleteCharacter(id: string) {
    characters.value = characters.value.filter((c) => c.id !== id);
  }

  function getById(id: string): Character | undefined {
    return characters.value.find((c) => c.id === id);
  }

  function replaceAll(incoming: Character[]) {
    characters.value = incoming;
  }

  return { characters, addCharacter, updateCharacter, deleteCharacter, getById, replaceAll };
}, {
  persist: { key: 'fcp-characters' },
});
