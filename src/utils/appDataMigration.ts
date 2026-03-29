import type { AppData, AppDataVersion, Character, Item } from '../types';
import { normalizeCharacterStress, normalizeItemStress } from './stressTracks';

export const LEGACY_APP_DATA_VERSION: AppDataVersion = '1.0';
export const CURRENT_APP_DATA_VERSION: AppDataVersion = '1.1';
export const SUPPORTED_APP_DATA_VERSIONS: AppDataVersion[] = [
  LEGACY_APP_DATA_VERSION,
  CURRENT_APP_DATA_VERSION,
];
export const PERSISTED_DATA_VERSION_KEY = 'fcp-data-version';

const CHARACTERS_STORE_KEY = 'fcp-characters';
const ITEMS_STORE_KEY = 'fcp-items';
const CAMPAIGNS_STORE_KEY = 'fcp-campaigns';
const CHARACTER_ITEMS_STORE_KEY = 'fcp-character-items';
const SKILLS_STORE_KEY = 'fcp-skills';

const PERSISTED_STORE_KEYS = [
  CHARACTERS_STORE_KEY,
  ITEMS_STORE_KEY,
  CAMPAIGNS_STORE_KEY,
  CHARACTER_ITEMS_STORE_KEY,
  SKILLS_STORE_KEY,
] as const;

type PersistedStoreKey = (typeof PERSISTED_STORE_KEYS)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasLegacyStressShape(value: unknown): boolean {
  if (!isRecord(value)) return false;

  const hasLegacyStress = Array.isArray(value.stressPhysical) || Array.isArray(value.stressMental);

  return hasLegacyStress && !Array.isArray(value.stressTracks);
}

function migrateCharacterToCurrent(character: Character): Character {
  return normalizeCharacterStress(character);
}

function migrateItemToCurrent(item: Item): Item {
  return normalizeItemStress(item);
}

export function migrateAppDataToCurrent(data: AppData): AppData {
  const migratedCharacters = data.characters.map((character) =>
    hasLegacyStressShape(character) ? migrateCharacterToCurrent(character) : character,
  );
  const sourceItems = data.items ?? [];
  const migratedItems = sourceItems.map((item) =>
    hasLegacyStressShape(item) ? migrateItemToCurrent(item) : item,
  );

  const charactersChanged = migratedCharacters.some(
    (character, index) => character !== data.characters[index],
  );
  const itemsChanged = migratedItems.some((item, index) => item !== sourceItems[index]);

  if (
    data.formatVersion === CURRENT_APP_DATA_VERSION &&
    !charactersChanged &&
    !itemsChanged &&
    data.items !== undefined &&
    data.campaignItemAssignments !== undefined &&
    data.characterItemAssignments !== undefined
  ) {
    return data;
  }

  return {
    ...data,
    formatVersion: CURRENT_APP_DATA_VERSION,
    characters: migratedCharacters,
    items: migratedItems,
    campaignItemAssignments: data.campaignItemAssignments ?? [],
    characterItemAssignments: data.characterItemAssignments ?? [],
  };
}

function migrateCharactersStoreState(state: Record<string, unknown>): {
  changed: boolean;
  state: Record<string, unknown>;
} {
  const characters = state.characters;
  if (!Array.isArray(characters)) return { changed: false, state };

  let changed = false;
  const migratedCharacters = characters.map((character) => {
    if (!hasLegacyStressShape(character)) return character;

    changed = true;
    return migrateCharacterToCurrent(character as Character);
  });

  return {
    changed,
    state: changed ? { ...state, characters: migratedCharacters } : state,
  };
}

function migrateItemsStoreState(state: Record<string, unknown>): {
  changed: boolean;
  state: Record<string, unknown>;
} {
  const items = state.items;
  if (!Array.isArray(items)) return { changed: false, state };

  let changed = false;
  const migratedItems = items.map((item) => {
    if (!hasLegacyStressShape(item)) return item;

    changed = true;
    return migrateItemToCurrent(item as Item);
  });

  return {
    changed,
    state: changed ? { ...state, items: migratedItems } : state,
  };
}

function migratePersistedStoreState(
  key: PersistedStoreKey,
  state: Record<string, unknown>,
): { changed: boolean; state: Record<string, unknown> } {
  if (key === CHARACTERS_STORE_KEY) return migrateCharactersStoreState(state);
  if (key === ITEMS_STORE_KEY) return migrateItemsStoreState(state);
  return { changed: false, state };
}

export function migratePersistedLocalData(storage: Storage = localStorage): boolean {
  if (storage.getItem(PERSISTED_DATA_VERSION_KEY) === CURRENT_APP_DATA_VERSION) {
    return false;
  }

  let changed = false;
  let hadParseFailure = false;

  for (const key of PERSISTED_STORE_KEYS) {
    const raw = storage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!isRecord(parsed)) continue;

      const migrated = migratePersistedStoreState(key, parsed);
      if (migrated.changed) {
        storage.setItem(key, JSON.stringify(migrated.state));
        changed = true;
      }
    } catch {
      hadParseFailure = true;
    }
  }

  if (!hadParseFailure) {
    storage.setItem(PERSISTED_DATA_VERSION_KEY, CURRENT_APP_DATA_VERSION);
  }

  return changed;
}
