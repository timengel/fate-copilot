import type { Campaign, Character, CharacterType, Consequence } from '../types';

function generateId(): string {
  return crypto.randomUUID();
}

export function createDefaultCharacter(type: CharacterType = 'sc'): Character {
  return {
    id: generateId(),
    type,
    name: '',
    description: '',
    highConcept: '',
    trouble: '',
    aspects: ['', '', ''],
    skills: [],
    stunts: [],
    extras: '',
    refresh: 3,
    fatePoints: 3,
    stressPhysical:
      type === 'nsc'
        ? [
            { value: 1, checked: false },
            { value: 2, checked: false },
          ]
        : [
            { value: 1, checked: false },
            { value: 2, checked: false },
            { value: 3, checked: false },
            { value: 4, checked: false },
          ],
    stressMental:
      type === 'nsc'
        ? [{ value: 1, checked: false }]
        : [
            { value: 1, checked: false },
            { value: 2, checked: false },
            { value: 3, checked: false },
            { value: 4, checked: false },
          ],
    consequences: (type === 'nsc'
      ? [{ severity: 2, label: 'mild', value: '' }]
      : [
          { severity: 2, label: 'mild', value: '' },
          { severity: 4, label: 'moderate', value: '' },
          { severity: 6, label: 'severe', value: '' },
          { severity: 8, label: 'extreme', value: '' },
        ]) as Consequence[],
    notes: '',
    color: 'pfau',
  };
}

export function createDefaultCampaign(): Campaign {
  return {
    id: generateId(),
    name: '',
    description: '',
    status: 'active',
    notes: '',
    milestones: [],
  };
}

export function useCharacterDefaults() {
  return { createDefaultCharacter, createDefaultCampaign, generateId };
}
