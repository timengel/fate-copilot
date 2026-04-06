import type { Character } from '../../types';
import { deepClone } from '../../utils/deepClone';
import { normalizeCharacterStress } from '../../utils/stressTracks';
import { buildComparator, type FieldPolicyMap } from './comparatorPolicy';

function normalizeForEdit(character: Character): Character {
  return normalizeCharacterStress(deepClone(character));
}

function areStringArraysEqual(left: string[] | undefined, right: string[] | undefined) {
  const leftValues = left ?? [];
  const rightValues = right ?? [];
  if (leftValues.length !== rightValues.length) return false;
  for (let i = 0; i < leftValues.length; i += 1) {
    if (leftValues[i] !== rightValues[i]) return false;
  }
  return true;
}

function areSkillEntriesEqual(left: Character['skills'], right: Character['skills']) {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    const leftEntry = left[i];
    const rightEntry = right[i];
    if (!leftEntry || !rightEntry) return false;
    if (leftEntry.skill !== rightEntry.skill || leftEntry.level !== rightEntry.level) return false;
  }
  return true;
}

function areStuntsEqual(
  left: Character['stunts'] | undefined,
  right: Character['stunts'] | undefined,
) {
  const leftStunts = left ?? [];
  const rightStunts = right ?? [];
  if (leftStunts.length !== rightStunts.length) return false;
  for (let i = 0; i < leftStunts.length; i += 1) {
    const leftStunt = leftStunts[i];
    const rightStunt = rightStunts[i];
    if (!leftStunt || !rightStunt) return false;
    if (leftStunt.name !== rightStunt.name || leftStunt.description !== rightStunt.description) {
      return false;
    }
  }
  return true;
}

function areStressTracksEqual(left: Character['stressTracks'], right: Character['stressTracks']) {
  const leftTracks = left ?? [];
  const rightTracks = right ?? [];
  if (leftTracks.length !== rightTracks.length) return false;
  for (let i = 0; i < leftTracks.length; i += 1) {
    const leftTrack = leftTracks[i];
    const rightTrack = rightTracks[i];
    if (!leftTrack || !rightTrack) return false;
    if (leftTrack.label !== rightTrack.label) return false;
    if (leftTrack.boxes.length !== rightTrack.boxes.length) return false;
    for (let j = 0; j < leftTrack.boxes.length; j += 1) {
      const leftBox = leftTrack.boxes[j];
      const rightBox = rightTrack.boxes[j];
      if (!leftBox || !rightBox) return false;
      if (leftBox.value !== rightBox.value || leftBox.checked !== rightBox.checked) return false;
    }
  }
  return true;
}

function areConsequencesEqual(left: Character['consequences'], right: Character['consequences']) {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    const leftConsequence = left[i];
    const rightConsequence = right[i];
    if (!leftConsequence || !rightConsequence) return false;
    if (
      leftConsequence.severity !== rightConsequence.severity ||
      leftConsequence.label !== rightConsequence.label ||
      leftConsequence.value !== rightConsequence.value
    ) {
      return false;
    }
  }
  return true;
}

function areModifiersEqual(left: Character['modifiers'], right: Character['modifiers']) {
  const leftModifiers = left ?? [];
  const rightModifiers = right ?? [];
  if (leftModifiers.length !== rightModifiers.length) return false;
  for (let i = 0; i < leftModifiers.length; i += 1) {
    const leftModifier = leftModifiers[i];
    const rightModifier = rightModifiers[i];
    if (!leftModifier || !rightModifier) return false;
    if (leftModifier.label !== rightModifier.label || leftModifier.value !== rightModifier.value) {
      return false;
    }
  }
  return true;
}

// When Character changes, update this map intentionally. `satisfies` enforces full key coverage.
export const characterFieldPolicy = {
  id: { mode: 'compare', equals: (left, right) => left === right },
  type: { mode: 'compare', equals: (left, right) => left === right },
  archived: { mode: 'compare', equals: (left, right) => left === right },
  name: { mode: 'compare', equals: (left, right) => left === right },
  description: { mode: 'compare', equals: (left, right) => left === right },
  highConcept: { mode: 'compare', equals: (left, right) => left === right },
  trouble: { mode: 'compare', equals: (left, right) => left === right },
  aspects: { mode: 'compare', equals: areStringArraysEqual },
  skills: { mode: 'compare', equals: areSkillEntriesEqual },
  stunts: { mode: 'compare', equals: areStuntsEqual },
  extras: { mode: 'compare', equals: (left, right) => left === right },
  refresh: { mode: 'compare', equals: (left, right) => left === right },
  fatePoints: { mode: 'compare', equals: (left, right) => left === right },
  stressTracks: { mode: 'compare', equals: areStressTracksEqual },
  stressPhysical: {
    mode: 'ignore',
    reason: 'Deprecated legacy field; normalized to stressTracks before compare.',
  },
  stressMental: {
    mode: 'ignore',
    reason: 'Deprecated legacy field; normalized to stressTracks before compare.',
  },
  consequences: { mode: 'compare', equals: areConsequencesEqual },
  notes: { mode: 'compare', equals: (left, right) => left === right },
  gmNotes: { mode: 'compare', equals: (left, right) => left === right },
  pyramidMaxLevel: { mode: 'compare', equals: (left, right) => left === right },
  pyramidMaxCols: { mode: 'compare', equals: (left, right) => left === right },
  color: { mode: 'compare', equals: (left, right) => left === right },
  avatar: { mode: 'compare', equals: (left, right) => left === right },
  redDice: { mode: 'compare', equals: (left, right) => left === right },
  blueDice: { mode: 'compare', equals: (left, right) => left === right },
  modifiers: { mode: 'compare', equals: areModifiersEqual },
  pureDamage: {
    mode: 'ignore',
    reason: 'Deprecated legacy field; replaced by modifiers and excluded from dirty tracking.',
  },
  deflection: {
    mode: 'ignore',
    reason: 'Deprecated legacy field; replaced by modifiers and excluded from dirty tracking.',
  },
} satisfies FieldPolicyMap<Character>;

export const isCharacterFormEqual = buildComparator<Character>(characterFieldPolicy);

export function createCharacterFormSnapshot(character: Character) {
  return normalizeForEdit(character);
}

export function syncCharacterFormState(form: Character, source: Character) {
  const next = normalizeForEdit(source);
  for (const key of Object.keys(form) as Array<keyof Character>) {
    delete form[key];
  }
  Object.assign(form, next);
  return next;
}
