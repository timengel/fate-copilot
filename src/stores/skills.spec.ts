import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { DEFAULT_SKILL_INFO, DEFAULT_SKILL_NAMES, useSkillsStore } from './skills';
import { useCharactersStore } from './characters';
import { SKILL_LIST, SkillAction } from '../types';
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

describe('useSkillsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with the default SKILL_LIST', () => {
    expect(useSkillsStore().skills).toEqual(SKILL_LIST);
    expect(useSkillsStore().skills).toEqual(DEFAULT_SKILL_NAMES);
  });

  it('adds a new skill', () => {
    const store = useSkillsStore();
    store.addSkill('Mystik');
    expect(store.skills).toContain('Mystik');
    expect(store.skillInfo.Mystik).toEqual({ description: '', actions: [] });
  });

  it('trims whitespace when adding a skill', () => {
    const store = useSkillsStore();
    store.addSkill('  Mystik  ');
    expect(store.skills).toContain('Mystik');
    expect(store.skills).not.toContain('  Mystik  ');
  });

  it('does not add a duplicate skill', () => {
    const store = useSkillsStore();
    const count = store.skills.length;
    store.addSkill('Athletik'); // already in SKILL_LIST
    expect(store.skills).toHaveLength(count);
  });

  it('does not add an empty string', () => {
    const store = useSkillsStore();
    const count = store.skills.length;
    store.addSkill('');
    expect(store.skills).toHaveLength(count);
  });

  it('does not add a whitespace-only string', () => {
    const store = useSkillsStore();
    const count = store.skills.length;
    store.addSkill('   ');
    expect(store.skills).toHaveLength(count);
  });

  it('removes a skill', () => {
    const store = useSkillsStore();
    store.removeSkill('Athletik');
    expect(store.skills).not.toContain('Athletik');
  });

  it('removes the skill from all characters when deleted', () => {
    const skillsStore = useSkillsStore();
    const charactersStore = useCharactersStore();
    charactersStore.addCharacter(
      makeChar({
        id: 'c1',
        skills: [
          { skill: 'Athletik', level: 2 },
          { skill: 'Kämpfen', level: 3 },
        ],
      }),
    );
    skillsStore.removeSkill('Athletik');
    const character = charactersStore.getById('c1')!;
    expect(character.skills.find((e) => e.skill === 'Athletik')).toBeUndefined();
    expect(character.skills.find((e) => e.skill === 'Kämpfen')).toBeDefined();
  });

  it('does not modify characters that do not have the deleted skill', () => {
    const skillsStore = useSkillsStore();
    const charactersStore = useCharactersStore();
    charactersStore.addCharacter(makeChar({ id: 'c1', skills: [{ skill: 'Kämpfen', level: 3 }] }));
    skillsStore.removeSkill('Athletik');
    expect(charactersStore.getById('c1')!.skills).toHaveLength(1);
  });

  it('replaceAll replaces all skills', () => {
    const store = useSkillsStore();
    store.replaceAll(['Custom1', 'Custom2']);
    expect(store.skills).toEqual(['Custom1', 'Custom2']);
    expect(store.skillInfo).toEqual({
      Custom1: { description: '', actions: [] },
      Custom2: { description: '', actions: [] },
    });
  });

  it('resetToDefaults restores SKILL_LIST', () => {
    const store = useSkillsStore();
    store.replaceAll(['Custom']);
    store.resetToDefaults();
    expect(store.skills).toEqual(SKILL_LIST);
  });

  it('resetToDefaults restores the Fate default skill info after editing a default skill', () => {
    const store = useSkillsStore();
    const originalAthletik = structuredClone(DEFAULT_SKILL_INFO.Athletik);

    store.setSkillInfo('Athletik', {
      description: 'Benutzerdefiniert',
      actions: [{ name: SkillAction.Attack, examples: 'Eigene Aktion' }],
    });

    expect(store.skillInfo.Athletik).toEqual({
      description: 'Benutzerdefiniert',
      actions: [{ name: SkillAction.Attack, examples: 'Eigene Aktion' }],
    });

    store.resetToDefaults();

    expect(store.skillInfo.Athletik).toEqual(originalAthletik);
    expect(store.skillInfo.Athletik?.description).toContain('Körperliche Fitness');
    expect(store.skillInfo.Athletik?.actions[0]?.examples).toContain('Springen');
  });

  it('replaceAll with empty array clears all skills', () => {
    const store = useSkillsStore();
    store.replaceAll([]);
    expect(store.skills).toHaveLength(0);
  });

  it('removeSkill with non-existent name does nothing', () => {
    const store = useSkillsStore();
    const before = [...store.skills];
    store.removeSkill('DoesNotExist');
    expect(store.skills).toEqual(before);
  });

  it('replaceAll clears stale skillInfo for removed skills', () => {
    const store = useSkillsStore();
    store.setSkillInfo('Athletik', {
      description: 'Alt',
      actions: [{ name: SkillAction.Attack, examples: 'Alt' }],
    });

    store.replaceAll(['Mystik']);

    expect(store.skillInfo.Athletik).toBeUndefined();
    expect(store.skillInfo.Mystik).toEqual({ description: '', actions: [] });
  });
});

describe('setSkillInfo', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('stores description and actions for a skill', () => {
    const store = useSkillsStore();
    store.setSkillInfo('Mystik', {
      description: 'Magische Fähigkeiten',
      actions: [{ name: SkillAction.Attack, examples: 'Magischer Angriff' }],
    });
    expect(store.skillInfo['Mystik']?.description).toBe('Magische Fähigkeiten');
    expect(store.skillInfo['Mystik']?.actions).toHaveLength(1);
    expect(store.skillInfo['Mystik']?.actions[0]?.name).toBe(SkillAction.Attack);
  });

  it('overwrites existing info for the same skill', () => {
    const store = useSkillsStore();
    store.setSkillInfo('Athletik', { description: 'Alt', actions: [] });
    store.setSkillInfo('Athletik', { description: 'Neu', actions: [] });
    expect(store.skillInfo['Athletik']?.description).toBe('Neu');
  });

  it('stores an action without examples', () => {
    const store = useSkillsStore();
    store.setSkillInfo('Mystik', {
      description: '',
      actions: [{ name: SkillAction.Defend }],
    });
    expect(store.skillInfo['Mystik']?.actions[0]?.examples).toBeUndefined();
  });

  it('stores an action with examples', () => {
    const store = useSkillsStore();
    store.setSkillInfo('Mystik', {
      description: '',
      actions: [{ name: SkillAction.Overcome, examples: 'Nur mit Ritualzubehör' }],
    });
    expect(store.skillInfo['Mystik']?.actions[0]?.examples).toBe('Nur mit Ritualzubehör');
  });

  it('clones incoming skill info so external mutations do not affect the store', () => {
    const store = useSkillsStore();
    const info = {
      description: 'Magische Fähigkeiten',
      actions: [{ name: SkillAction.Attack, examples: 'Magischer Angriff' }],
    };

    store.setSkillInfo('Mystik', info);
    info.description = 'Geändert';
    info.actions[0]!.examples = 'Extern verändert';

    expect(store.skillInfo.Mystik).toEqual({
      description: 'Magische Fähigkeiten',
      actions: [{ name: SkillAction.Attack, examples: 'Magischer Angriff' }],
    });
  });
});

describe('replaceAllWithInfo', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('replaces the skills list', () => {
    const store = useSkillsStore();
    store.replaceAllWithInfo(['Mystik', 'Alchemie'], {});
    expect(store.skills).toEqual(['Mystik', 'Alchemie']);
  });

  it('replaces the skillInfo record', () => {
    const store = useSkillsStore();
    const info = { Mystik: { description: 'Magie', actions: [] } };
    store.replaceAllWithInfo(['Mystik'], info);
    expect(store.skillInfo['Mystik']?.description).toBe('Magie');
  });

  it('deep-clones incoming action arrays', () => {
    const store = useSkillsStore();
    const info = {
      Mystik: {
        description: 'Magie',
        actions: [{ name: SkillAction.Attack, examples: 'Magischer Angriff' }],
      },
    };

    store.replaceAllWithInfo(['Mystik'], info);
    info.Mystik.description = 'Geändert';
    info.Mystik.actions[0]!.examples = 'Extern verändert';

    expect(store.skillInfo.Mystik).toEqual({
      description: 'Magie',
      actions: [{ name: SkillAction.Attack, examples: 'Magischer Angriff' }],
    });
  });

  it('accepts an empty skillInfo object without crashing', () => {
    const store = useSkillsStore();
    expect(() => store.replaceAllWithInfo(['Mystik'], {})).not.toThrow();
    expect(store.skillInfo['Mystik']).toEqual({ description: '', actions: [] });
  });

  it('clears previous skillInfo when replaced', () => {
    const store = useSkillsStore();
    store.setSkillInfo('Athletik', { description: 'Alt', actions: [] });
    store.replaceAllWithInfo(['Mystik'], { Mystik: { description: 'Neu', actions: [] } });
    expect(store.skillInfo['Athletik']).toBeUndefined();
  });
});

describe('mergeWithInfo', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('appends new skills after the existing list', () => {
    const store = useSkillsStore();
    store.replaceAll(['Athletik', 'Kämpfen']);

    store.mergeWithInfo(['Mystik', 'Alchemie'], {});

    expect(store.skills).toEqual(['Athletik', 'Kämpfen', 'Mystik', 'Alchemie']);
  });

  it('updates skillInfo for matching skills without removing other skills', () => {
    const store = useSkillsStore();
    store.replaceAllWithInfo(
      ['Athletik', 'Mystik'],
      {
        Athletik: {
          description: 'Alt',
          actions: [{ name: SkillAction.Defend, examples: 'Alt' }],
        },
        Mystik: {
          description: 'Bestehend',
          actions: [],
        },
      },
    );

    store.mergeWithInfo(
      ['Athletik'],
      {
        Athletik: {
          description: 'Neu',
          actions: [{ name: SkillAction.Attack, examples: 'Neu' }],
        },
      },
    );

    expect(store.skills).toEqual(['Athletik', 'Mystik']);
    expect(store.skillInfo.Athletik).toEqual({
      description: 'Neu',
      actions: [{ name: SkillAction.Attack, examples: 'Neu' }],
    });
    expect(store.skillInfo.Mystik).toEqual({
      description: 'Bestehend',
      actions: [],
    });
  });

  it('creates empty info for appended skills when none is provided', () => {
    const store = useSkillsStore();

    store.mergeWithInfo(['Mystik'], {});

    expect(store.skillInfo.Mystik).toEqual({ description: '', actions: [] });
  });

  it('matches existing skills by normalized name when imported names contain whitespace', () => {
    const store = useSkillsStore();
    store.replaceAllWithInfo(
      ['Athletik'],
      {
        Athletik: {
          description: 'Alt',
          actions: [],
        },
      },
    );

    store.mergeWithInfo(
      ['  Athletik  '],
      {
        '  Athletik  ': {
          description: 'Neu',
          actions: [{ name: SkillAction.Attack, examples: 'Aktualisiert' }],
        },
      },
    );

    expect(store.skills).toEqual(['Athletik']);
    expect(store.skillInfo.Athletik).toEqual({
      description: 'Neu',
      actions: [{ name: SkillAction.Attack, examples: 'Aktualisiert' }],
    });
  });
});
