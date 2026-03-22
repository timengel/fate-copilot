import type { Character, Item } from '../types';

export function useSingleImportExport() {
  async function copyToClipboard(entity: Character | Item): Promise<void> {
    await navigator.clipboard.writeText(JSON.stringify(entity, null, 2));
  }

  function parseCharacter(json: string): Character {
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch {
      throw new Error('Ungültiges JSON-Format.');
    }
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error('JSON muss ein Objekt sein.');
    }
    const obj = data as Record<string, unknown>;
    if (typeof obj.name !== 'string' || !obj.name.trim()) {
      throw new Error('Das Feld "name" fehlt oder ist leer.');
    }
    const type = obj.type === 'nsc' ? 'nsc' : 'sc';
    return { ...obj, id: crypto.randomUUID(), type } as Character;
  }

  function parseItem(json: string): Item {
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch {
      throw new Error('Ungültiges JSON-Format.');
    }
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error('JSON muss ein Objekt sein.');
    }
    const obj = data as Record<string, unknown>;
    if (typeof obj.name !== 'string' || !obj.name.trim()) {
      throw new Error('Das Feld "name" fehlt oder ist leer.');
    }
    return { ...obj, id: crypto.randomUUID(), type: 'item' } as Item;
  }

  return { copyToClipboard, parseCharacter, parseItem };
}
