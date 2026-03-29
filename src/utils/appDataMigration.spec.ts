import { describe, it, expect, beforeEach } from 'vitest';
import type { AppData, Character, Item } from '../types';
import {
  CURRENT_APP_DATA_VERSION,
  PERSISTED_DATA_VERSION_KEY,
  migrateAppDataToCurrent,
  migratePersistedLocalData,
} from './appDataMigration';

const legacyCharacterFromDemo: Character = {
  id: '9c801b83-8da0-4ffe-8332-a07306538162',
  type: 'sc',
  name: 'Rovan Schattengold aka. Uwe',
  description: 'Unterwelt-Freihändler und Informationsmakler',
  highConcept: 'Eiskalter Unterwelt-Freihändler mit weit verbreitetem Netzwerk',
  trouble: 'Mein eigener Stab hat mich verraten',
  aspects: ['Xenos-Artefaktjäger', 'Kybernetisch augmentiertes Spezialauge', ''],
  skills: [
    { skill: 'Nachforschung', level: 4 },
    { skill: 'Diebeskünste', level: 3 },
  ],
  stunts: [
    {
      name: 'Deckungsfeuer',
      description: '1x pro Szene: +2 auf Schießen wenn Angriff aus der Deckung',
    },
  ],
  extras: '- Tigerzahnkette',
  refresh: 3,
  fatePoints: 3,
  stressPhysical: [
    { value: 1, checked: false },
    { value: 2, checked: false },
    { value: 3, checked: false },
  ],
  stressMental: [
    { value: 1, checked: false },
    { value: 2, checked: false },
    { value: 3, checked: false },
  ],
  consequences: [
    { severity: 2, label: 'mild', value: '' },
    { severity: 4, label: 'moderate', value: '' },
    { severity: 6, label: 'severe', value: '' },
    { severity: 8, label: 'extreme', value: '' },
  ],
  notes: '',
  color: 'basilikum',
  avatar: '🏴‍☠️',
};

const legacyItem: Item = {
  id: 'item-1',
  type: 'item',
  name: 'Runenklinge',
  description: '',
  aspects: [],
  stunts: [],
  extras: '',
  stressPhysical: [{ value: 1, checked: false }],
  stressMental: [],
  redDice: 0,
  blueDice: 0,
};

function makeLegacyAppData(overrides: Partial<AppData> = {}): AppData {
  return {
    formatVersion: '1.0',
    exportDate: '2026-03-22T11:45:02.455Z',
    campaigns: [],
    characters: [legacyCharacterFromDemo],
    items: [legacyItem],
    campaignCharacterAssignments: [],
    campaignItemAssignments: [],
    characterItemAssignments: [],
    skills: ['Athletik'],
    ...overrides,
  };
}

describe('appDataMigration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('migrateAppDataToCurrent', () => {
    it('migrates legacy app data from 1.0 to 1.1', () => {
      const migrated = migrateAppDataToCurrent(makeLegacyAppData());

      expect(migrated.formatVersion).toBe('1.1');
      expect(migrated.characters[0]!.stressTracks?.[0]?.label).toBe('KÖRPERLICHER STRESS (KRAFT)');
      expect(migrated.characters[0]!.stressPhysical).toBeUndefined();
      expect(migrated.characters[0]!.stressMental).toBeUndefined();
      expect(migrated.items?.[0]!.stressTracks?.[0]?.boxes[0]!.value).toBe(1);
      expect(migrated.items?.[0]!.stressPhysical).toBeUndefined();
    });

    it('keeps already-current 1.1 data unchanged', () => {
      const current = migrateAppDataToCurrent(makeLegacyAppData());
      const migratedAgain = migrateAppDataToCurrent(current);

      expect(migratedAgain).toBe(current);
    });

    it('is idempotent when run repeatedly on legacy data', () => {
      const first = migrateAppDataToCurrent(makeLegacyAppData());
      const second = migrateAppDataToCurrent(first);

      expect(second).toEqual(first);
    });
  });

  describe('migratePersistedLocalData', () => {
    it('rewrites stale persisted character and item stores and records version metadata', () => {
      localStorage.setItem(
        'fcp-characters',
        JSON.stringify({ characters: [legacyCharacterFromDemo] }),
      );
      localStorage.setItem('fcp-items', JSON.stringify({ items: [legacyItem] }));

      const changed = migratePersistedLocalData();

      expect(changed).toBe(true);

      const charactersState = JSON.parse(localStorage.getItem('fcp-characters') ?? '{}');
      const itemsState = JSON.parse(localStorage.getItem('fcp-items') ?? '{}');

      expect(charactersState.characters[0].stressTracks[0].label).toBe(
        'KÖRPERLICHER STRESS (KRAFT)',
      );
      expect(charactersState.characters[0].stressPhysical).toBeUndefined();
      expect(itemsState.items[0].stressTracks[0].boxes[0].value).toBe(1);
      expect(localStorage.getItem(PERSISTED_DATA_VERSION_KEY)).toBe(CURRENT_APP_DATA_VERSION);
    });

    it('does not rewrite already-current persisted data', () => {
      const currentCharacter = migrateAppDataToCurrent(makeLegacyAppData()).characters[0]!;
      const rawState = JSON.stringify({ characters: [currentCharacter] });
      localStorage.setItem('fcp-characters', rawState);

      const changed = migratePersistedLocalData();

      expect(changed).toBe(false);
      expect(localStorage.getItem('fcp-characters')).toBe(rawState);
      expect(localStorage.getItem(PERSISTED_DATA_VERSION_KEY)).toBe(CURRENT_APP_DATA_VERSION);
    });

    it('is a no-op when the version metadata already marks data as current', () => {
      localStorage.setItem(PERSISTED_DATA_VERSION_KEY, CURRENT_APP_DATA_VERSION);
      localStorage.setItem(
        'fcp-characters',
        JSON.stringify({ characters: [legacyCharacterFromDemo] }),
      );

      const changed = migratePersistedLocalData();

      expect(changed).toBe(false);
      const charactersState = JSON.parse(localStorage.getItem('fcp-characters') ?? '{}');
      expect(charactersState.characters[0].stressPhysical).toBeTruthy();
    });

    it('does not fail when unrelated localStorage keys contain malformed JSON', () => {
      localStorage.setItem('some-unrelated-key', '{broken');

      expect(() => migratePersistedLocalData()).not.toThrow();
      expect(localStorage.getItem(PERSISTED_DATA_VERSION_KEY)).toBe(CURRENT_APP_DATA_VERSION);
    });
  });
});
