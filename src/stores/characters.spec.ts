import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCharactersStore } from './characters';
import type { Character } from '../types';

function makeChar(overrides: Partial<Character> = {}): Character {
  return {
    id: 'c1',
    name: 'Test',
    description: '',
    highConcept: '',
    trouble: '',
    aspects: ['', '', ''],
    skills: [],
    stunts: [],
    extras: '',
    refresh: 3,
    fatePoints: 3,
    stressPhysical: [],
    stressMental: [],
    consequences: [],
    notes: '',
    ...overrides,
  };
}

describe('useCharactersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts empty', () => {
    expect(useCharactersStore().characters).toHaveLength(0);
  });

  it('adds a character', () => {
    const store = useCharactersStore();
    store.addCharacter(makeChar());
    expect(store.characters).toHaveLength(1);
  });

  it('getById returns the correct character', () => {
    const store = useCharactersStore();
    store.addCharacter(makeChar({ id: 'abc', name: 'Alice' }));
    expect(store.getById('abc')?.name).toBe('Alice');
  });

  it('getById returns undefined for unknown id', () => {
    expect(useCharactersStore().getById('nope')).toBeUndefined();
  });

  it('updates a character by id', () => {
    const store = useCharactersStore();
    store.addCharacter(makeChar({ id: 'c1', name: 'Old' }));
    store.updateCharacter(makeChar({ id: 'c1', name: 'New' }));
    expect(store.characters[0].name).toBe('New');
  });

  it('update leaves other characters untouched', () => {
    const store = useCharactersStore();
    store.addCharacter(makeChar({ id: 'c1', name: 'Alice' }));
    store.addCharacter(makeChar({ id: 'c2', name: 'Bob' }));
    store.updateCharacter(makeChar({ id: 'c1', name: 'Alice Updated' }));
    expect(store.getById('c2')?.name).toBe('Bob');
  });

  it('update on unknown id does nothing', () => {
    const store = useCharactersStore();
    store.addCharacter(makeChar({ id: 'c1' }));
    store.updateCharacter(makeChar({ id: 'unknown' }));
    expect(store.characters).toHaveLength(1);
  });

  it('deletes a character', () => {
    const store = useCharactersStore();
    store.addCharacter(makeChar({ id: 'c1' }));
    store.deleteCharacter('c1');
    expect(store.characters).toHaveLength(0);
  });

  it('replaceAll replaces all characters', () => {
    const store = useCharactersStore();
    store.addCharacter(makeChar({ id: 'old' }));
    store.replaceAll([makeChar({ id: 'new1' }), makeChar({ id: 'new2' })]);
    expect(store.characters).toHaveLength(2);
    expect(store.characters[0].id).toBe('new1');
  });

  it('replaceAll with empty array clears all', () => {
    const store = useCharactersStore();
    store.addCharacter(makeChar());
    store.replaceAll([]);
    expect(store.characters).toHaveLength(0);
  });
});
