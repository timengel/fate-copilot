import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useCharacterItemsStore } from './characterItems';
import { useCharactersStore } from './characters';
import { useItemsStore } from './items';
import { createDefaultCharacter, createDefaultItem } from '../composables/useCharacterDefaults';

describe('useCharacterItemsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('assigns and unassigns items for a character', () => {
    const store = useCharacterItemsStore();

    store.assignItem('char-1', 'item-1');
    expect(store.assignments).toEqual([{ characterId: 'char-1', itemId: 'item-1' }]);

    store.unassignItem('char-1', 'item-1');
    expect(store.assignments).toEqual([]);
  });

  it('ignores duplicate assignments', () => {
    const store = useCharacterItemsStore();

    store.assignItem('char-1', 'item-1');
    store.assignItem('char-1', 'item-1');

    expect(store.assignments).toHaveLength(1);
  });

  it('returns linked items for a character and linked characters for an item', () => {
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();
    const store = useCharacterItemsStore();

    const character = { ...createDefaultCharacter(), id: 'char-1', name: 'Iris' };
    const item = { ...createDefaultItem(), id: 'item-1', name: 'Runenklinge' };

    charactersStore.addCharacter(character);
    itemsStore.addItem(item);
    store.assignItem(character.id, item.id);

    expect(store.getItemsForCharacter(character.id).map((entry) => entry.id)).toEqual([item.id]);
    expect(store.getCharactersForItem(item.id).map((entry) => entry.id)).toEqual([character.id]);
  });

  it('replaceAll overwrites assignments and reset clears them', () => {
    const store = useCharacterItemsStore();

    store.replaceAll([{ characterId: 'char-2', itemId: 'item-2' }]);
    expect(store.assignments).toEqual([{ characterId: 'char-2', itemId: 'item-2' }]);

    store.reset();
    expect(store.assignments).toEqual([]);
  });

  it('removes orphaned assignments when a character is deleted', () => {
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();
    const store = useCharacterItemsStore();

    charactersStore.addCharacter({ ...createDefaultCharacter(), id: 'char-1' });
    itemsStore.addItem({ ...createDefaultItem(), id: 'item-1' });
    store.assignItem('char-1', 'item-1');

    charactersStore.deleteCharacter('char-1');

    expect(store.assignments).toEqual([]);
  });

  it('removes orphaned assignments when an item is deleted', () => {
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();
    const store = useCharacterItemsStore();

    charactersStore.addCharacter({ ...createDefaultCharacter(), id: 'char-1' });
    itemsStore.addItem({ ...createDefaultItem(), id: 'item-1' });
    store.assignItem('char-1', 'item-1');

    itemsStore.deleteItem('item-1');

    expect(store.assignments).toEqual([]);
  });
});
