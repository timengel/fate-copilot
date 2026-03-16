import type { AppData, AppDataVersion, Character, Item } from '../types';
import { SKILL_LIST } from '../types';
import { useCharactersStore } from '../stores/characters';
import { useItemsStore } from '../stores/items';
import { useCampaignsStore } from '../stores/campaigns';
import { useSkillsStore } from '../stores/skills';

const FORMAT_VERSION: AppDataVersion = '1.1';
const SUPPORTED_VERSIONS: AppDataVersion[] = ['1.0', '1.1'];

type LegacyCharacter = Omit<Character, 'type'> & { type?: string; redDice?: number; blueDice?: number };

function migrateToItem(c: LegacyCharacter): Item {
  return {
    id: c.id,
    type: 'item',
    name: c.name,
    description: c.description,
    highConcept: c.highConcept,
    trouble: c.trouble,
    aspects: c.aspects,
    stunts: c.stunts,
    extras: c.extras,
    stressPhysical: c.stressPhysical,
    stressMental: c.stressMental,
    gmNotes: c.gmNotes,
    color: c.color,
    redDice: c.redDice ?? 0,
    blueDice: c.blueDice ?? 0,
  };
}

export function useImportExport() {
  function exportJSON() {
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();
    const campaignsStore = useCampaignsStore();
    const skillsStore = useSkillsStore();

    const data: AppData = {
      formatVersion: FORMAT_VERSION,
      exportDate: new Date().toISOString(),
      campaigns: campaignsStore.campaigns,
      characters: charactersStore.characters,
      items: itemsStore.items,
      campaignCharacterAssignments: campaignsStore.assignments,
      skills: skillsStore.skills,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `fate-copilot-export-${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function validateImportData(data: unknown): data is AppData {
    if (typeof data !== 'object' || data === null) return false;
    const d = data as Record<string, unknown>;
    if (!SUPPORTED_VERSIONS.includes(d.formatVersion as AppDataVersion)) {
      throw new Error(
        `Unbekannte Formatversion: "${d.formatVersion}". Unterstützt: ${SUPPORTED_VERSIONS.join(', ')}`,
      );
    }
    if (!Array.isArray(d.campaigns)) throw new Error('Fehlende oder ungültige "campaigns"-Liste');
    if (!Array.isArray(d.characters)) throw new Error('Fehlende oder ungültige "characters"-Liste');
    if (!Array.isArray(d.campaignCharacterAssignments))
      throw new Error('Fehlende oder ungültige "campaignCharacterAssignments"-Liste');
    return true;
  }

  function importJSON(file: File): Promise<AppData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const raw = JSON.parse(e.target?.result as string);
          if (validateImportData(raw)) {
            resolve(raw);
          }
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Ungültige JSON-Datei'));
        }
      };
      reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
      reader.readAsText(file);
    });
  }

  function applyImport(data: AppData) {
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();
    const campaignsStore = useCampaignsStore();
    const skillsStore = useSkillsStore();

    if (data.items) {
      itemsStore.replaceAll(data.items);
      charactersStore.replaceAll(data.characters);
    } else {
      // Migration: alte Exporte haben Items im characters-Array
      const legacy = data.characters as unknown as LegacyCharacter[];
      itemsStore.replaceAll(legacy.filter((c) => c.type === 'item').map(migrateToItem));
      charactersStore.replaceAll(legacy.filter((c) => c.type !== 'item') as unknown as Character[]);
    }
    campaignsStore.replaceAll(data.campaigns, data.campaignCharacterAssignments);
    skillsStore.replaceAll(data.skills ?? [...SKILL_LIST]);
  }

  return { exportJSON, importJSON, applyImport };
}
