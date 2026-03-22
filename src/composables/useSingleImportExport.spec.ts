import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useSingleImportExport } from './useSingleImportExport';
import type { Character, Item } from '../types';

const minimalCharacter: Character = {
  id: 'c1',
  name: 'Alice',
  type: 'sc',
  description: '',
  highConcept: '',
  trouble: '',
  aspects: [],
  skills: [],
  stunts: [],
  extras: '',
  refresh: 3,
  fatePoints: 3,
  stressPhysical: [],
  stressMental: [],
  consequences: [],
  notes: '',
};

const minimalItem: Item = {
  id: 'i1',
  type: 'item',
  name: 'Schwert',
  description: '',
  aspects: [],
  stunts: [],
  extras: '',
  stressPhysical: [],
  stressMental: [],
  redDice: 0,
  blueDice: 0,
};

describe('useSingleImportExport', () => {
  describe('copyToClipboard', () => {
    let writeText: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('calls navigator.clipboard.writeText once', async () => {
      const { copyToClipboard } = useSingleImportExport();
      await copyToClipboard(minimalCharacter);
      expect(writeText).toHaveBeenCalledOnce();
    });

    it('writes valid JSON to clipboard', async () => {
      const { copyToClipboard } = useSingleImportExport();
      await copyToClipboard(minimalCharacter);
      const written = writeText.mock.calls[0]![0] as string;
      expect(() => JSON.parse(written)).not.toThrow();
    });

    it('serializes the entity name correctly', async () => {
      const { copyToClipboard } = useSingleImportExport();
      await copyToClipboard(minimalCharacter);
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.name).toBe('Alice');
    });

    it('works with an Item entity', async () => {
      const { copyToClipboard } = useSingleImportExport();
      await copyToClipboard(minimalItem);
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.name).toBe('Schwert');
      expect(parsed.type).toBe('item');
    });
  });

  describe('parseCharacter', () => {
    it('returns a character with the correct name', () => {
      const { parseCharacter } = useSingleImportExport();
      const result = parseCharacter(JSON.stringify(minimalCharacter));
      expect(result.name).toBe('Alice');
    });

    it('assigns a fresh id (different from the original)', () => {
      const { parseCharacter } = useSingleImportExport();
      const result = parseCharacter(JSON.stringify(minimalCharacter));
      expect(result.id).not.toBe('c1');
      expect(result.id).toBeTruthy();
    });

    it('preserves type "nsc"', () => {
      const { parseCharacter } = useSingleImportExport();
      const nsc = { ...minimalCharacter, type: 'nsc' };
      const result = parseCharacter(JSON.stringify(nsc));
      expect(result.type).toBe('nsc');
    });

    it('defaults type to "sc" when type is absent', () => {
      const { parseCharacter } = useSingleImportExport();
      const { type: _t, ...noType } = minimalCharacter;
      const result = parseCharacter(JSON.stringify(noType));
      expect(result.type).toBe('sc');
    });

    it('defaults type to "sc" for unknown type values', () => {
      const { parseCharacter } = useSingleImportExport();
      const result = parseCharacter(JSON.stringify({ ...minimalCharacter, type: 'unknown' }));
      expect(result.type).toBe('sc');
    });

    it('throws on invalid JSON string', () => {
      const { parseCharacter } = useSingleImportExport();
      expect(() => parseCharacter('not json')).toThrow('Ungültiges JSON-Format.');
    });

    it('throws when JSON is an array', () => {
      const { parseCharacter } = useSingleImportExport();
      expect(() => parseCharacter('[]')).toThrow();
    });

    it('throws when JSON is a primitive', () => {
      const { parseCharacter } = useSingleImportExport();
      expect(() => parseCharacter('"just a string"')).toThrow();
    });

    it('throws when name is missing', () => {
      const { parseCharacter } = useSingleImportExport();
      const { name: _n, ...noName } = minimalCharacter;
      expect(() => parseCharacter(JSON.stringify(noName))).toThrow('"name"');
    });

    it('throws when name is an empty string', () => {
      const { parseCharacter } = useSingleImportExport();
      expect(() => parseCharacter(JSON.stringify({ ...minimalCharacter, name: '' }))).toThrow('"name"');
    });

    it('throws when name is not a string', () => {
      const { parseCharacter } = useSingleImportExport();
      expect(() => parseCharacter(JSON.stringify({ ...minimalCharacter, name: 42 }))).toThrow('"name"');
    });

    it('preserves other fields from the JSON', () => {
      const { parseCharacter } = useSingleImportExport();
      const result = parseCharacter(JSON.stringify({ ...minimalCharacter, highConcept: 'Held' }));
      expect(result.highConcept).toBe('Held');
    });
  });

  describe('parseItem', () => {
    it('returns an item with the correct name', () => {
      const { parseItem } = useSingleImportExport();
      const result = parseItem(JSON.stringify(minimalItem));
      expect(result.name).toBe('Schwert');
    });

    it('assigns a fresh id (different from the original)', () => {
      const { parseItem } = useSingleImportExport();
      const result = parseItem(JSON.stringify(minimalItem));
      expect(result.id).not.toBe('i1');
      expect(result.id).toBeTruthy();
    });

    it('always sets type to "item"', () => {
      const { parseItem } = useSingleImportExport();
      const result = parseItem(JSON.stringify({ ...minimalItem, type: 'something-else' }));
      expect(result.type).toBe('item');
    });

    it('throws on invalid JSON string', () => {
      const { parseItem } = useSingleImportExport();
      expect(() => parseItem('not json')).toThrow('Ungültiges JSON-Format.');
    });

    it('throws when JSON is an array', () => {
      const { parseItem } = useSingleImportExport();
      expect(() => parseItem('[]')).toThrow();
    });

    it('throws when name is missing', () => {
      const { parseItem } = useSingleImportExport();
      const { name: _n, ...noName } = minimalItem;
      expect(() => parseItem(JSON.stringify(noName))).toThrow('"name"');
    });

    it('throws when name is an empty string', () => {
      const { parseItem } = useSingleImportExport();
      expect(() => parseItem(JSON.stringify({ ...minimalItem, name: '' }))).toThrow('"name"');
    });

    it('throws when name is not a string', () => {
      const { parseItem } = useSingleImportExport();
      expect(() => parseItem(JSON.stringify({ ...minimalItem, name: null }))).toThrow('"name"');
    });

    it('preserves other fields from the JSON', () => {
      const { parseItem } = useSingleImportExport();
      const result = parseItem(JSON.stringify({ ...minimalItem, description: 'Ein Schwert' }));
      expect(result.description).toBe('Ein Schwert');
    });
  });
});
