import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Character } from '../types';

function migrateCharacter(char: Character): Character {
  if (char.pureDamage !== undefined || char.deflection !== undefined) {
    char.modifiers = [
      { label: 'Purer Schaden', value: char.pureDamage ?? 0 },
      { label: 'Deflektion', value: char.deflection ?? 0 },
    ];
    delete char.pureDamage;
    delete char.deflection;
  }
  return char;
}

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

  function reset() {
    characters.value = [];
  }

  return { characters, addCharacter, updateCharacter, deleteCharacter, getById, replaceAll, reset };
}, {
  persist: {
    key: 'fcp-characters',
    afterHydrate: (ctx) => {
      ctx.store.characters = ctx.store.characters.map(migrateCharacter);
    },
  },
});
