import type { Campaign, Character, CharacterType, Consequence, Item } from '../types';
import { MENTAL_STRESS_LABEL, PHYSICAL_STRESS_LABEL } from '../utils/stressTracks';

function generateId(): string {
  return crypto.randomUUID();
}

export function createDefaultCharacter(type: CharacterType = 'sc'): Character {
  const consequences: Consequence[] =
    type === 'nsc'
      ? [{ severity: 2, label: 'mild', value: '' }]
      : [
          { severity: 2, label: 'mild', value: '' },
          { severity: 4, label: 'moderate', value: '' },
          { severity: 6, label: 'severe', value: '' },
          { severity: 8, label: 'extreme', value: '' },
        ];
  return {
    id: generateId(),
    type,
    archived: false,
    name: '',
    description: '',
    highConcept: '',
    trouble: '',
    aspects: [],
    skills: [],
    stunts: [],
    extras: '',
    refresh: 3,
    fatePoints: 3,
    stressTracks: [
      {
        label: PHYSICAL_STRESS_LABEL,
        boxes:
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
      },
      {
        label: MENTAL_STRESS_LABEL,
        boxes:
          type === 'nsc'
            ? [{ value: 1, checked: false }]
            : [
                { value: 1, checked: false },
                { value: 2, checked: false },
                { value: 3, checked: false },
                { value: 4, checked: false },
              ],
      },
    ],
    consequences,
    notes: '',
    color: 'pfau',
    avatar: '',
    redDice: 0,
    blueDice: 0,
    modifiers: [
      { label: 'Purer Schaden', value: 0 },
      { label: 'Deflektion', value: 0 },
    ],
  };
}

export function createDefaultItem(): Item {
  return {
    id: generateId(),
    type: 'item',
    archived: false,
    name: '',
    description: '',
    aspects: [''],
    stunts: [],
    extras: '',
    stressTracks: [],
    color: 'pfau',
    avatar: '',
    redDice: 0,
    blueDice: 0,
    modifiers: [
      { label: 'Purer Schaden', value: 0 },
      { label: 'Deflektion', value: 0 },
    ],
    consequences: [],
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
    color: 'pfau',
    avatar: '',
  };
}

export function useCharacterDefaults() {
  return { createDefaultCharacter, createDefaultItem, createDefaultCampaign, generateId };
}
