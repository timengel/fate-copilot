import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { setActivePinia, createPinia } from 'pinia';
import { useCharactersStore } from '../stores/characters';
import { useImportExport } from '../composables/useImportExport';
import type { AppData, Character } from '../types';
import schema from './app-data.schema.json';

// ---------------------------------------------------------------------------
// Ajv setup
// ---------------------------------------------------------------------------
const ajv = new Ajv2020({ strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

function isValid(data: unknown): boolean {
  return validate(data) as boolean;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const minimalCharacter: Character = {
  id: 'char-1',
  name: 'Elara',
  description: '',
  highConcept: 'Wandernde Magierin',
  trouble: 'Verfolgung durch den Orden',
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

const fullCharacter: Character = {
  ...minimalCharacter,
  id: 'char-2',
  type: 'nsc',
  aspects: ['Verbündete im Untergrund'],
  skills: [
    { skill: 'Kämpfen', level: 3 },
    { skill: 'Athletik', level: 2 },
  ],
  stunts: [{ name: 'Schneller Schlag', description: '+2 auf Kämpfen im ersten Zug' }],
  extras: 'Magischer Stab',
  stressPhysical: [
    { value: 1, checked: false },
    { value: 2, checked: true },
  ],
  stressMental: [{ value: 1, checked: false }],
  consequences: [{ severity: 2, label: 'mild', value: 'Verstauchter Knöchel' }],
  notes: 'Interne Notiz',
  gmNotes: 'GM-Only Notiz',
  pyramidMaxLevel: 5,
  pyramidMaxCols: 5,
  color: 'pfau',
  avatar: '🧙',
};

const minimalV11: AppData = {
  formatVersion: '1.1',
  exportDate: '2024-03-15T10:30:00.000Z',
  campaigns: [],
  characters: [],
  campaignCharacterAssignments: [],
  skills: ['Athletik', 'Kämpfen'],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('app-data JSON Schema', () => {
  describe('valid AppData', () => {
    it('accepts minimal v1.1 data (empty arrays)', () => {
      expect(isValid(minimalV11)).toBe(true);
    });

    it('accepts v1.0 data without skills field', () => {
      const { skills: _s, ...v10 } = minimalV11;
      expect(isValid({ ...v10, formatVersion: '1.0' })).toBe(true);
    });

    it('accepts a minimal character', () => {
      expect(isValid({ ...minimalV11, characters: [minimalCharacter] })).toBe(true);
    });

    it('accepts a fully populated character (all optional fields)', () => {
      expect(isValid({ ...minimalV11, characters: [fullCharacter] })).toBe(true);
    });

    it('accepts a campaign with milestones', () => {
      const data: AppData = {
        ...minimalV11,
        campaigns: [
          {
            id: 'camp-1',
            name: 'Die Dunkelheit erwacht',
            description: 'Eine epische Kampagne',
            status: 'active',
            notes: 'Notizen',
            gmNotes: 'GM-Notizen',
            color: 'basilikum',
            avatar: '🗺️',
            milestones: [{ id: 'ms-1', type: 'significant', description: 'Erste Konfrontation' }],
          },
        ],
      };
      expect(isValid(data)).toBe(true);
    });

    it('accepts campaign-character assignments', () => {
      const data: AppData = {
        ...minimalV11,
        campaignCharacterAssignments: [{ campaignId: 'camp-1', characterId: 'char-1' }],
      };
      expect(isValid(data)).toBe(true);
    });

    it('accepts all valid ConsequenceSeverity values (2, 4, 6, 8)', () => {
      const consequences = ([2, 4, 6, 8] as const).map((severity, i) => ({
        severity,
        label: (['mild', 'moderate', 'severe', 'extreme'] as const)[i]!,
        value: '',
      }));
      expect(isValid({ ...minimalV11, characters: [{ ...minimalCharacter, consequences }] })).toBe(
        true,
      );
    });

    it('accepts all valid CampaignStatus values', () => {
      for (const status of ['active', 'inactive', 'completed'] as const) {
        const data = {
          ...minimalV11,
          campaigns: [{ id: 'c', name: 'x', description: '', status, notes: '', milestones: [] }],
        };
        expect(isValid(data)).toBe(true);
      }
    });
  });

  describe('invalid AppData — top level', () => {
    it('rejects missing formatVersion', () => {
      const { formatVersion: _v, ...data } = minimalV11;
      expect(isValid(data)).toBe(false);
    });

    it('rejects unknown formatVersion', () => {
      expect(isValid({ ...minimalV11, formatVersion: '2.0' })).toBe(false);
    });

    it('rejects missing campaigns array', () => {
      const { campaigns: _c, ...data } = minimalV11;
      expect(isValid(data)).toBe(false);
    });

    it('rejects missing characters array', () => {
      const { characters: _c, ...data } = minimalV11;
      expect(isValid(data)).toBe(false);
    });

    it('rejects missing campaignCharacterAssignments array', () => {
      const { campaignCharacterAssignments: _a, ...data } = minimalV11;
      expect(isValid(data)).toBe(false);
    });

    it('rejects additional unknown top-level properties', () => {
      expect(isValid({ ...minimalV11, unknownField: true })).toBe(false);
    });
  });

  describe('invalid Character', () => {
    it('rejects character with missing required field (name)', () => {
      const { name: _n, ...noName } = minimalCharacter;
      expect(isValid({ ...minimalV11, characters: [noName] })).toBe(false);
    });

    it('rejects character with invalid type value', () => {
      expect(
        isValid({ ...minimalV11, characters: [{ ...minimalCharacter, type: 'player' }] }),
      ).toBe(false);
    });

    it('rejects character with invalid color value', () => {
      expect(isValid({ ...minimalV11, characters: [{ ...minimalCharacter, color: 'rot' }] })).toBe(
        false,
      );
    });

    it('rejects SkillEntry with level out of range', () => {
      const char = { ...minimalCharacter, skills: [{ skill: 'Kämpfen', level: 0 }] };
      expect(isValid({ ...minimalV11, characters: [char] })).toBe(false);
    });

    it('rejects Consequence with invalid severity', () => {
      const char = {
        ...minimalCharacter,
        consequences: [{ severity: 3, label: 'mild', value: '' }],
      };
      expect(isValid({ ...minimalV11, characters: [char] })).toBe(false);
    });

    it('rejects Consequence with invalid label', () => {
      const char = {
        ...minimalCharacter,
        consequences: [{ severity: 2, label: 'light', value: '' }],
      };
      expect(isValid({ ...minimalV11, characters: [char] })).toBe(false);
    });
  });

  describe('exportJSON output conforms to schema', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      vi.spyOn(document, 'createElement').mockReturnValueOnce({
        href: '',
        download: '',
        click: vi.fn(),
      } as unknown as HTMLElement);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('exported JSON from empty stores conforms to schema', async () => {
      let capturedBlob: Blob | undefined;
      vi.spyOn(URL, 'createObjectURL').mockImplementation((obj) => {
        capturedBlob = obj as Blob;
        return 'blob:fake';
      });

      const { exportJSON } = useImportExport();
      exportJSON();

      const text = await capturedBlob!.text();
      const parsed = JSON.parse(text);
      expect(isValid(parsed)).toBe(true);
    });

    it('exported JSON with a full character conforms to schema', async () => {
      useCharactersStore().addCharacter(fullCharacter);

      let capturedBlob: Blob | undefined;
      vi.spyOn(URL, 'createObjectURL').mockImplementation((obj) => {
        capturedBlob = obj as Blob;
        return 'blob:fake';
      });

      const { exportJSON } = useImportExport();
      exportJSON();

      const text = await capturedBlob!.text();
      const parsed = JSON.parse(text);
      expect(isValid(parsed)).toBe(true);
    });
  });
});
