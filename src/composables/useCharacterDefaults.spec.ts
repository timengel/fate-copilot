import { describe, it, expect } from 'vitest';
import { createDefaultCharacter, createDefaultItem, useCharacterDefaults } from './useCharacterDefaults';

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
    const physicalTrack = createDefaultCharacter().stressTracks?.[0];
    expect(physicalTrack?.boxes).toHaveLength(4);
    expect(physicalTrack?.boxes.map((b) => b.value)).toEqual([1, 2, 3, 4]);
    expect(physicalTrack?.boxes.every((b) => !b.checked)).toBe(true);
  });

  it('returns 4 mental stress boxes with values 1–4, all unchecked', () => {
    const mentalTrack = createDefaultCharacter().stressTracks?.[1];
    expect(mentalTrack?.boxes).toHaveLength(4);
    expect(mentalTrack?.boxes.map((b) => b.value)).toEqual([1, 2, 3, 4]);
    expect(mentalTrack?.boxes.every((b) => !b.checked)).toBe(true);
  });

  it('returns 3 consequence slots with severities 2/4/6', () => {
    const { consequences } = createDefaultCharacter();
    expect(consequences).toHaveLength(3);
    expect(consequences.map((c) => c.severity)).toEqual([2, 4, 6]);
    expect(consequences.every((c) => c.value === '')).toBe(true);
  });

  it('returns empty strings for name, highConcept, trouble, notes', () => {
    const char = createDefaultCharacter();
    expect(char.name).toBe('');
    expect(char.highConcept).toBe('');
    expect(char.trouble).toBe('');
    expect(char.notes).toBe('');
  });

  it('returns an empty aspects array', () => {
    expect(createDefaultCharacter().aspects).toEqual([]);
  });

  it("returns default color 'pfau'", () => {
    expect(createDefaultCharacter().color).toBe('pfau');
  });

  it('returns redDice=0', () => {
    expect(createDefaultCharacter().redDice).toBe(0);
  });

  it('returns blueDice=0', () => {
    expect(createDefaultCharacter().blueDice).toBe(0);
  });
});

describe('createDefaultCharacter (NSC)', () => {
  it('returns type nsc', () => {
    expect(createDefaultCharacter('nsc').type).toBe('nsc');
  });

  it('returns 2 physical stress boxes with values [1, 2], all unchecked', () => {
    const physicalTrack = createDefaultCharacter('nsc').stressTracks?.[0];
    expect(physicalTrack?.boxes).toHaveLength(2);
    expect(physicalTrack?.boxes.map((b) => b.value)).toEqual([1, 2]);
    expect(physicalTrack?.boxes.every((b) => !b.checked)).toBe(true);
  });

  it('returns 1 mental stress box with value [1], unchecked', () => {
    const mentalTrack = createDefaultCharacter('nsc').stressTracks?.[1];
    expect(mentalTrack?.boxes).toHaveLength(1);
    expect(mentalTrack?.boxes[0]!.value).toBe(1);
    expect(mentalTrack?.boxes[0]!.checked).toBe(false);
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
    const physicalTrack = createDefaultCharacter('sc').stressTracks?.[0];
    expect(physicalTrack?.boxes).toHaveLength(4);
    expect(physicalTrack?.boxes.map((b) => b.value)).toEqual([1, 2, 3, 4]);
  });

  it('returns 4 mental stress boxes with values [1,2,3,4]', () => {
    const mentalTrack = createDefaultCharacter('sc').stressTracks?.[1];
    expect(mentalTrack?.boxes).toHaveLength(4);
    expect(mentalTrack?.boxes.map((b) => b.value)).toEqual([1, 2, 3, 4]);
  });

  it('returns 3 consequence slots with severities [2,4,6]', () => {
    const { consequences } = createDefaultCharacter('sc');
    expect(consequences).toHaveLength(3);
    expect(consequences.map((c) => c.severity)).toEqual([2, 4, 6]);
  });
});

describe('createDefaultItem', () => {
  it('returns a non-empty id', () => {
    expect(createDefaultItem().id).toBeTruthy();
  });

  it("returns type 'item'", () => {
    expect(createDefaultItem().type).toBe('item');
  });

  it('returns redDice=0 and blueDice=0', () => {
    const item = createDefaultItem();
    expect(item.redDice).toBe(0);
    expect(item.blueDice).toBe(0);
  });

  it('returns two default modifiers with value 0', () => {
    const item = createDefaultItem();
    expect(item.modifiers).toHaveLength(2);
    expect(item.modifiers![0]!.value).toBe(0);
    expect(item.modifiers![1]!.value).toBe(0);
  });

  it('returns no stress tracks by default', () => {
    expect(createDefaultItem().stressTracks).toEqual([]);
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
