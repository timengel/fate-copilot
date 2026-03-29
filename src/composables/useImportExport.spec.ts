import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useImportExport } from './useImportExport';
import { useCharactersStore } from '../stores/characters';
import { useCampaignsStore } from '../stores/campaigns';
import { useSkillsStore } from '../stores/skills';
import { SkillAction } from '../types';
import type { AppData, Character, Campaign, CampaignCharacterAssignment } from '../types';

const validV10: AppData = {
  formatVersion: '1.0',
  exportDate: '2024-01-01T00:00:00.000Z',
  campaigns: [],
  characters: [],
  campaignCharacterAssignments: [],
  skills: [
    {
      name: 'Athletik',
      description: 'Beweglichkeit und Ausdauer',
      actions: [{ name: SkillAction.Overcome, examples: 'Klettern, springen, sprinten' }],
    },
  ],
};

const minimalCharacter: Character = {
  id: 'c1',
  name: 'Alice',
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

function makeFile(data: unknown): File {
  return new File([JSON.stringify(data)], 'test.json', { type: 'application/json' });
}

describe('useImportExport', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('importJSON', () => {
    it('resolves with valid v1.0 data', async () => {
      const { importJSON } = useImportExport();
      const result = await importJSON(makeFile(validV10));
      expect(result.formatVersion).toBe('1.0');
    });

    it('rejects previous schema version 1.1', async () => {
      const { importJSON } = useImportExport();
      await expect(importJSON(makeFile({ ...validV10, formatVersion: '1.1' }))).rejects.toThrow();
    });

    it('rejects on invalid JSON string', async () => {
      const { importJSON } = useImportExport();
      const file = new File(['not{json}at all'], 'bad.json');
      await expect(importJSON(file)).rejects.toThrow();
    });

    it('rejects on unknown formatVersion', async () => {
      const { importJSON } = useImportExport();
      await expect(importJSON(makeFile({ ...validV10, formatVersion: '9.9' }))).rejects.toThrow();
    });

    it('rejects when campaigns array is missing', async () => {
      const { importJSON } = useImportExport();
      const { campaigns: _c, ...noCampaigns } = validV10;
      await expect(importJSON(makeFile(noCampaigns))).rejects.toThrow();
    });

    it('rejects when characters array is missing', async () => {
      const { importJSON } = useImportExport();
      const { characters: _c, ...noChars } = validV10;
      await expect(importJSON(makeFile(noChars))).rejects.toThrow();
    });

    it('rejects when campaignCharacterAssignments is missing', async () => {
      const { importJSON } = useImportExport();
      const { campaignCharacterAssignments: _a, ...noAssignments } = validV10;
      await expect(importJSON(makeFile(noAssignments))).rejects.toThrow();
    });
  });

  describe('importFromString', () => {
    it('returns parsed AppData for valid v1.0 JSON string', () => {
      const { importFromString } = useImportExport();
      const result = importFromString(JSON.stringify(validV10));
      expect(result.formatVersion).toBe('1.0');
    });

    it('throws on previous schema version 1.1', () => {
      const { importFromString } = useImportExport();
      expect(() =>
        importFromString(JSON.stringify({ ...validV10, formatVersion: '1.1' })),
      ).toThrow();
    });

    it('returns correct characters array', () => {
      const { importFromString } = useImportExport();
      const data = { ...validV10, characters: [minimalCharacter] };
      const result = importFromString(JSON.stringify(data));
      expect(result.characters[0]!.name).toBe('Alice');
    });

    it('throws on invalid JSON string', () => {
      const { importFromString } = useImportExport();
      expect(() => importFromString('not{json}')).toThrow();
    });

    it('throws on unknown formatVersion', () => {
      const { importFromString } = useImportExport();
      expect(() =>
        importFromString(JSON.stringify({ ...validV10, formatVersion: '9.9' })),
      ).toThrow();
    });

    it('throws when campaigns array is missing', () => {
      const { importFromString } = useImportExport();
      const { campaigns: _c, ...noCampaigns } = validV10;
      expect(() => importFromString(JSON.stringify(noCampaigns))).toThrow();
    });

    it('throws when characters array is missing', () => {
      const { importFromString } = useImportExport();
      const { characters: _c, ...noChars } = validV10;
      expect(() => importFromString(JSON.stringify(noChars))).toThrow();
    });

    it('throws when campaignCharacterAssignments is missing', () => {
      const { importFromString } = useImportExport();
      const { campaignCharacterAssignments: _a, ...noAssignments } = validV10;
      expect(() => importFromString(JSON.stringify(noAssignments))).toThrow();
    });
  });

  describe('importFromString — character dice fields', () => {
    it('preserves redDice and blueDice on import', () => {
      const { importFromString } = useImportExport();
      const charWithDice = { ...minimalCharacter, redDice: 3, blueDice: 1 };
      const result = importFromString(JSON.stringify({ ...validV10, characters: [charWithDice] }));
      expect(result.characters[0]!.redDice).toBe(3);
      expect(result.characters[0]!.blueDice).toBe(1);
    });

    it('accepts old character data without redDice/blueDice (backwards compat)', () => {
      const { importFromString } = useImportExport();
      const result = importFromString(
        JSON.stringify({ ...validV10, characters: [minimalCharacter] }),
      );
      expect(result.characters[0]!.name).toBe('Alice');
    });
  });

  describe('applyImport', () => {
    it('replaces characters in the store', () => {
      const { applyImport } = useImportExport();
      const character: Character = {
        id: 'c1',
        name: 'Alice',
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
      applyImport({ ...validV10, characters: [character] });
      expect(useCharactersStore().characters[0]!.name).toBe('Alice');
    });

    it('replaces campaigns in the store', () => {
      const { applyImport } = useImportExport();
      const campaign: Campaign = {
        id: 'camp1',
        name: 'My Campaign',
        description: '',
        status: 'active',
        notes: '',
        avatar: '🗺️',
        milestones: [],
      };
      applyImport({ ...validV10, campaigns: [campaign] });
      expect(useCampaignsStore().campaigns[0]!.name).toBe('My Campaign');
    });

    it('replaces skills in the store', () => {
      const { applyImport } = useImportExport();
      applyImport({
        ...validV10,
        skills: [
          {
            name: 'CustomSkill',
            description: 'Individuelle Fertigkeit',
            actions: [{ name: SkillAction.Attack, examples: 'Spezialangriff' }],
          },
        ],
      });
      expect(useSkillsStore().skills).toEqual(['CustomSkill']);
      expect(useSkillsStore().skillInfo.CustomSkill).toEqual({
        description: 'Individuelle Fertigkeit',
        actions: [{ name: SkillAction.Attack, examples: 'Spezialangriff' }],
      });
    });

    it('accepts legacy string skills during import', () => {
      const { applyImport } = useImportExport();
      applyImport({ ...validV10, skills: ['CustomSkill'] });
      expect(useSkillsStore().skills).toEqual(['CustomSkill']);
      expect(useSkillsStore().skillInfo.CustomSkill).toEqual({ description: '', actions: [] });
    });

    it('falls back to SKILL_LIST when skills is undefined (v1.0)', () => {
      const { applyImport } = useImportExport();
      const { skills: _s, ...data } = validV10;
      applyImport(data as AppData);
      expect(useSkillsStore().skills.length).toBeGreaterThan(0);
    });

    it('applies campaign-character assignments to the store', () => {
      const { applyImport } = useImportExport();
      const assignment: CampaignCharacterAssignment = { campaignId: 'camp1', characterId: 'c1' };
      applyImport({ ...validV10, campaignCharacterAssignments: [assignment] });
      expect(useCampaignsStore().assignments).toEqual([assignment]);
    });

    it('clears previous store data before applying new import', () => {
      const { applyImport } = useImportExport();
      const existingChar: Character = {
        id: 'old',
        name: 'Altcharakter',
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
      useCharactersStore().addCharacter(existingChar);
      applyImport({ ...validV10, characters: [] });
      expect(useCharactersStore().characters).toHaveLength(0);
    });

    it('preserves character type field (nsc)', () => {
      const { applyImport } = useImportExport();
      const nsc: Character = {
        id: 'n1',
        name: 'Bösewicht',
        type: 'nsc',
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
      applyImport({ ...validV10, characters: [nsc] });
      expect(useCharactersStore().characters[0]!.type).toBe('nsc');
    });
  });

  describe('exportJSON', () => {
    let createObjectURL: ReturnType<typeof vi.fn>;
    let revokeObjectURL: ReturnType<typeof vi.fn>;
    let fakeLink: { href: string; download: string; click: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      createObjectURL = vi.fn(() => 'blob:fake-url');
      revokeObjectURL = vi.fn();
      vi.spyOn(URL, 'createObjectURL').mockImplementation(createObjectURL);
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(revokeObjectURL);

      fakeLink = { href: '', download: '', click: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValueOnce(fakeLink as unknown as HTMLElement);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('triggers a file download (link.click is called)', () => {
      const { exportJSON } = useImportExport();
      exportJSON();
      expect(fakeLink.click).toHaveBeenCalledOnce();
    });

    it('sets download filename matching fate-copilot-export-YYYY-MM-DD.json', () => {
      const { exportJSON } = useImportExport();
      exportJSON();
      expect(fakeLink.download).toMatch(/^fate-copilot-export-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('exported JSON contains characters from the store', async () => {
      useCharactersStore().addCharacter({ ...minimalCharacter, name: 'Aragorn' });

      let capturedBlob: Blob | undefined;
      vi.spyOn(URL, 'createObjectURL').mockImplementation((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:fake-url';
      });

      const { exportJSON } = useImportExport();
      exportJSON();

      const text = await capturedBlob!.text();
      const parsed = JSON.parse(text);
      expect(parsed.characters[0].name).toBe('Aragorn');
    });

    it('exported JSON has formatVersion 1.0', async () => {
      let capturedBlob: Blob | undefined;
      vi.spyOn(URL, 'createObjectURL').mockImplementation((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:fake-url';
      });

      const { exportJSON } = useImportExport();
      exportJSON();

      const text = await capturedBlob!.text();
      const parsed = JSON.parse(text);
      expect(parsed.formatVersion).toBe('1.0');
    });

    it('exports structured skills with descriptions and action examples', async () => {
      useSkillsStore().replaceAllWithInfo(['Mystik'], {
        Mystik: {
          description: 'Arkane Praxis',
          actions: [{ name: SkillAction.CreateAdvantage, examples: 'Runen analysieren' }],
        },
      });

      let capturedBlob: Blob | undefined;
      vi.spyOn(URL, 'createObjectURL').mockImplementation((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:fake-url';
      });

      const { exportJSON } = useImportExport();
      exportJSON();

      const text = await capturedBlob!.text();
      const parsed = JSON.parse(text);
      expect(parsed.skills).toEqual([
        {
          name: 'Mystik',
          description: 'Arkane Praxis',
          actions: [{ name: SkillAction.CreateAdvantage, examples: 'Runen analysieren' }],
        },
      ]);
    });
  });

  describe('exportToClipboard', () => {
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
      const { exportToClipboard } = useImportExport();
      await exportToClipboard();
      expect(writeText).toHaveBeenCalledOnce();
    });

    it('written JSON has formatVersion 1.0', async () => {
      const { exportToClipboard } = useImportExport();
      await exportToClipboard();
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.formatVersion).toBe('1.0');
    });

    it('written JSON contains characters from the store', async () => {
      useCharactersStore().addCharacter({ ...minimalCharacter, name: 'Bilbo' });
      const { exportToClipboard } = useImportExport();
      await exportToClipboard();
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.characters[0].name).toBe('Bilbo');
    });

    it('written JSON contains campaigns from the store', async () => {
      const campaign: Campaign = {
        id: 'camp1',
        name: 'Mittelerde',
        description: '',
        status: 'active',
        notes: '',
        avatar: '🗺️',
        milestones: [],
      };
      useCampaignsStore().addCampaign(campaign);
      const { exportToClipboard } = useImportExport();
      await exportToClipboard();
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.campaigns[0].name).toBe('Mittelerde');
    });

    it('written JSON preserves campaign avatars', async () => {
      useCampaignsStore().addCampaign({
        id: 'camp1',
        name: 'Mittelerde',
        description: '',
        status: 'active',
        notes: '',
        avatar: '🗺️',
        milestones: [],
      });
      const { exportToClipboard } = useImportExport();
      await exportToClipboard();
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.campaigns[0].avatar).toBe('🗺️');
    });

    it('exported JSON preserves character redDice and blueDice', async () => {
      useCharactersStore().addCharacter({ ...minimalCharacter, redDice: 2, blueDice: 4 });
      const { exportToClipboard } = useImportExport();
      await exportToClipboard();
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.characters[0].redDice).toBe(2);
      expect(parsed.characters[0].blueDice).toBe(4);
    });

    it('includes all required AppData fields', async () => {
      const { exportToClipboard } = useImportExport();
      await exportToClipboard();
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed).toHaveProperty('formatVersion');
      expect(parsed).toHaveProperty('exportDate');
      expect(parsed).toHaveProperty('campaigns');
      expect(parsed).toHaveProperty('characters');
      expect(parsed).toHaveProperty('campaignCharacterAssignments');
    });

    it('writes structured skills to the clipboard export', async () => {
      useSkillsStore().replaceAllWithInfo(['Mystik'], {
        Mystik: {
          description: 'Arkane Praxis',
          actions: [{ name: SkillAction.Defend, examples: 'Schutzkreis errichten' }],
        },
      });

      const { exportToClipboard } = useImportExport();
      await exportToClipboard();

      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.skills).toEqual([
        {
          name: 'Mystik',
          description: 'Arkane Praxis',
          actions: [{ name: SkillAction.Defend, examples: 'Schutzkreis errichten' }],
        },
      ]);
    });
  });
});
