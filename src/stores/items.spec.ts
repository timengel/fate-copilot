import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useItemsStore } from './items';
import type { Item } from '../types';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'i1',
    type: 'item',
    name: 'Sword',
    description: '',
    aspects: [],
    stunts: [],
    extras: '',
    stressPhysical: [],
    stressMental: [],
    redDice: 0,
    blueDice: 0,
    ...overrides,
  };
}

describe('useItemsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts empty', () => {
    expect(useItemsStore().items).toHaveLength(0);
  });

  it('adds an item', () => {
    const store = useItemsStore();
    store.addItem(makeItem());
    expect(store.items).toHaveLength(1);
  });

  it('getById returns the correct item', () => {
    const store = useItemsStore();
    store.addItem(makeItem({ id: 'x', name: 'Shield' }));
    expect(store.getById('x')?.name).toBe('Shield');
  });

  it('getById returns undefined for unknown id', () => {
    expect(useItemsStore().getById('nope')).toBeUndefined();
  });

  it('updates an item by id', () => {
    const store = useItemsStore();
    store.addItem(makeItem({ id: 'i1', name: 'Old' }));
    store.updateItem(makeItem({ id: 'i1', name: 'New' }));
    expect(store.items[0]!.name).toBe('New');
  });

  it('updateItem with unknown id does nothing', () => {
    const store = useItemsStore();
    store.addItem(makeItem({ id: 'i1', name: 'Old' }));
    store.updateItem(makeItem({ id: 'missing', name: 'New' }));
    expect(store.items).toHaveLength(1);
    expect(store.items[0]!.name).toBe('Old');
  });

  it('deletes an item', () => {
    const store = useItemsStore();
    store.addItem(makeItem({ id: 'i1' }));
    store.deleteItem('i1');
    expect(store.items).toHaveLength(0);
  });

  it('replaceAll replaces all items', () => {
    const store = useItemsStore();
    store.addItem(makeItem({ id: 'old' }));
    store.replaceAll([makeItem({ id: 'new1' }), makeItem({ id: 'new2' })]);
    expect(store.items).toHaveLength(2);
    expect(store.items[0]!.id).toBe('new1');
  });

  it('normalizes legacy stress arrays into stressTracks', () => {
    const store = useItemsStore();
    store.addItem(makeItem({ stressPhysical: [{ value: 1, checked: false }], stressMental: [] }));
    expect(store.items[0]!.stressTracks?.[0]?.boxes[0]!.value).toBe(1);
  });

  it('reset clears all items', () => {
    const store = useItemsStore();
    store.addItem(makeItem({ id: 'i1' }));
    store.addItem(makeItem({ id: 'i2' }));
    store.reset();
    expect(store.items).toHaveLength(0);
  });
});
