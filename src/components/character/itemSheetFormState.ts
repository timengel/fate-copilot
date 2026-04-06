import type { Item } from '../../types';
import { deepClone } from '../../utils/deepClone';
import { normalizeItemStress } from '../../utils/stressTracks';
import { buildComparator, type FieldPolicyMap } from './comparatorPolicy';

function normalizeForEdit(item: Item): Item {
  return normalizeItemStress(deepClone(item));
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

function areStuntsEqual(left: Item['stunts'] | undefined, right: Item['stunts'] | undefined) {
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

function areStressTracksEqual(left: Item['stressTracks'], right: Item['stressTracks']) {
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

function areConsequencesEqual(left: Item['consequences'], right: Item['consequences']) {
  const leftConsequences = left ?? [];
  const rightConsequences = right ?? [];
  if (leftConsequences.length !== rightConsequences.length) return false;
  for (let i = 0; i < leftConsequences.length; i += 1) {
    const leftConsequence = leftConsequences[i];
    const rightConsequence = rightConsequences[i];
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

function areModifiersEqual(left: Item['modifiers'], right: Item['modifiers']) {
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

// When Item changes, update this map intentionally. `satisfies` enforces full key coverage.
export const itemFieldPolicy = {
  id: { mode: 'compare', equals: (left, right) => left === right },
  type: { mode: 'compare', equals: (left, right) => left === right },
  archived: { mode: 'compare', equals: (left, right) => left === right },
  name: { mode: 'compare', equals: (left, right) => left === right },
  description: { mode: 'compare', equals: (left, right) => left === right },
  aspects: { mode: 'compare', equals: areStringArraysEqual },
  stunts: { mode: 'compare', equals: areStuntsEqual },
  extras: { mode: 'compare', equals: (left, right) => left === right },
  stressTracks: { mode: 'compare', equals: areStressTracksEqual },
  stressPhysical: {
    mode: 'ignore',
    reason: 'Deprecated legacy field; normalized to stressTracks before compare.',
  },
  stressMental: {
    mode: 'ignore',
    reason: 'Deprecated legacy field; normalized to stressTracks before compare.',
  },
  gmNotes: { mode: 'compare', equals: (left, right) => left === right },
  hidden: { mode: 'compare', equals: (left, right) => left === right },
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
  consequences: { mode: 'compare', equals: areConsequencesEqual },
} satisfies FieldPolicyMap<Item>;

export const isItemFormEqual = buildComparator<Item>(itemFieldPolicy);

export function createItemFormSnapshot(item: Item) {
  return normalizeForEdit(item);
}

export function syncItemFormState(form: Item, source: Item) {
  const next = normalizeForEdit(source);
  for (const key of Object.keys(form) as Array<keyof Item>) {
    delete form[key];
  }
  Object.assign(form, next);
  return next;
}
