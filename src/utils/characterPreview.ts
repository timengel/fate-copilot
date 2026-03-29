import type { Character } from '../types';

function normalized(value?: string) {
  return value?.trim() ?? '';
}

export function getCharacterPrimaryPreview(character: Character): string {
  if (character.type === 'nsc') {
    return normalized(character.aspects[0]);
  }

  return normalized(character.highConcept);
}

export function getCharacterSecondaryPreview(character: Character): string {
  if (character.type === 'nsc') {
    return normalized(character.aspects[1]);
  }

  return normalized(character.trouble);
}

export function getCharacterSearchText(character: Character): string {
  return [
    character.name,
    character.highConcept,
    character.trouble,
    ...(character.aspects ?? []),
  ]
    .map(normalized)
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
