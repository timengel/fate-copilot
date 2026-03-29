import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Character } from '../types';
import { normalizeCharacterStress } from '../utils/stressTracks';
import { useCharacterItemsStore } from './characterItems';

function migrateCharacter(char: Character): Character {
  const migrated = normalizeCharacterStress(char);

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

export const useCharactersStore = defineStore('characters', () => {
  const characters = ref<Character[]>([]);

  function addCharacter(character: Character) {
    characters.value.push(migrateCharacter(character));
  }

  function updateCharacter(updated: Character) {
    const index = characters.value.findIndex((c) => c.id === updated.id);
    if (index !== -1) {
      characters.value[index] = migrateCharacter(updated);
    }
  }

  function deleteCharacter(id: string) {
    characters.value = characters.value.filter((c) => c.id !== id);
    useCharacterItemsStore().unassignAllForCharacter(id);
  }

  function getById(id: string): Character | undefined {
    return characters.value.find((c) => c.id === id);
  }

  function replaceAll(incoming: Character[]) {
    characters.value = incoming.map(migrateCharacter);
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
