import { describe, it, expect } from 'vitest';
import { createDefaultCharacter, useCharacterDefaults } from './useCharacterDefaults';

describe('createDefaultCharacter', () => {
  it('returns a non-empty id', () => {
    expect(createDefaultCharacter().id).toBeTruthy();
  });

  it('each call returns a unique id', () => {
    expect(createDefaultCharacter().id).not.toBe(createDefaultCharacter().id);
  });

  it('returns refresh=3 and fatePoints=3', () => {
    const char = createDefaultCharacter();
    expect(char.refresh).toBe(3);
    expect(char.fatePoints).toBe(3);
  });

  it('returns 4 physical stress boxes with values 1–4, all unchecked', () => {
    const { stressPhysical } = createDefaultCharacter();
    expect(stressPhysical).toHaveLength(4);
    expect(stressPhysical.map((b) => b.value)).toEqual([1, 2, 3, 4]);
    expect(stressPhysical.every((b) => !b.checked)).toBe(true);
  });

  it('returns 4 mental stress boxes with values 1–4, all unchecked', () => {
    const { stressMental } = createDefaultCharacter();
    expect(stressMental).toHaveLength(4);
    expect(stressMental.map((b) => b.value)).toEqual([1, 2, 3, 4]);
    expect(stressMental.every((b) => !b.checked)).toBe(true);
  });

  it('returns 4 consequence slots with severities 2/4/6/8', () => {
    const { consequences } = createDefaultCharacter();
    expect(consequences).toHaveLength(4);
    expect(consequences.map((c) => c.severity)).toEqual([2, 4, 6, 8]);
    expect(consequences.every((c) => c.value === '')).toBe(true);
  });

  it('returns empty strings for name, highConcept, trouble, notes', () => {
    const char = createDefaultCharacter();
    expect(char.name).toBe('');
    expect(char.highConcept).toBe('');
    expect(char.trouble).toBe('');
    expect(char.notes).toBe('');
  });

  it('returns 3 empty aspect slots', () => {
    expect(createDefaultCharacter().aspects).toEqual(['', '', '']);
  });

  it("returns default color 'pfau'", () => {
    expect(createDefaultCharacter().color).toBe('pfau');
  });
});

describe('createDefaultCharacter (NSC)', () => {
  it('returns type nsc', () => {
    expect(createDefaultCharacter('nsc').type).toBe('nsc');
  });

  it('returns 2 physical stress boxes with values [1, 2], all unchecked', () => {
    const { stressPhysical } = createDefaultCharacter('nsc');
    expect(stressPhysical).toHaveLength(2);
    expect(stressPhysical.map((b) => b.value)).toEqual([1, 2]);
    expect(stressPhysical.every((b) => !b.checked)).toBe(true);
  });

  it('returns 1 mental stress box with value [1], unchecked', () => {
    const { stressMental } = createDefaultCharacter('nsc');
    expect(stressMental).toHaveLength(1);
    expect(stressMental[0]!.value).toBe(1);
    expect(stressMental[0]!.checked).toBe(false);
  });

  it('returns exactly 1 consequence slot with severity 2 and label mild', () => {
    const { consequences } = createDefaultCharacter('nsc');
    expect(consequences).toHaveLength(1);
    expect(consequences[0]!.severity).toBe(2);
    expect(consequences[0]!.label).toBe('mild');
    expect(consequences[0]!.value).toBe('');
  });
});

describe('createDefaultCharacter (SC, explicit)', () => {
  it('returns type sc', () => {
    expect(createDefaultCharacter('sc').type).toBe('sc');
  });

  it('returns 4 physical stress boxes with values [1,2,3,4]', () => {
    const { stressPhysical } = createDefaultCharacter('sc');
    expect(stressPhysical).toHaveLength(4);
    expect(stressPhysical.map((b) => b.value)).toEqual([1, 2, 3, 4]);
  });

  it('returns 4 mental stress boxes with values [1,2,3,4]', () => {
    const { stressMental } = createDefaultCharacter('sc');
    expect(stressMental).toHaveLength(4);
    expect(stressMental.map((b) => b.value)).toEqual([1, 2, 3, 4]);
  });

  it('returns 4 consequence slots with severities [2,4,6,8]', () => {
    const { consequences } = createDefaultCharacter('sc');
    expect(consequences).toHaveLength(4);
    expect(consequences.map((c) => c.severity)).toEqual([2, 4, 6, 8]);
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const { generateId } = useCharacterDefaults();
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns unique values on successive calls', () => {
    const { generateId } = useCharacterDefaults();
    expect(generateId()).not.toBe(generateId());
  });
});
