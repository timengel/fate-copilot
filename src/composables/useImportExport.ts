import type { AppData, AppDataVersion } from '../types';
import { SKILL_LIST } from '../types';
import { useCharactersStore } from '../stores/characters';
import { useItemsStore } from '../stores/items';
import { useCampaignsStore } from '../stores/campaigns';
import { useSkillsStore } from '../stores/skills';

const FORMAT_VERSION: AppDataVersion = '1.1';
const SUPPORTED_VERSIONS: AppDataVersion[] = ['1.0', '1.1'];

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
    if (!('formatVersion' in data) || (data.formatVersion !== '1.0' && data.formatVersion !== '1.1')) {
      throw new Error(
        `Unbekannte Formatversion: "${String('formatVersion' in data ? data.formatVersion : '')}". Unterstützt: ${SUPPORTED_VERSIONS.join(', ')}`,
      );
    }
    if (!('campaigns' in data) || !Array.isArray(data.campaigns))
      throw new Error('Fehlende oder ungültige "campaigns"-Liste');
    if (!('characters' in data) || !Array.isArray(data.characters))
      throw new Error('Fehlende oder ungültige "characters"-Liste');
    if (!('campaignCharacterAssignments' in data) || !Array.isArray(data.campaignCharacterAssignments))
      throw new Error('Fehlende oder ungültige "campaignCharacterAssignments"-Liste');
    return true;
  }

  function importJSON(file: File): Promise<AppData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== 'string') {
            reject(new Error('Datei konnte nicht gelesen werden'));
            return;
          }
          const raw = JSON.parse(result);
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
    // Migration: alte Exporte haben Items im characters-Array
    if (data.items) {
      itemsStore.replaceAll(data.items);
      charactersStore.replaceAll(data.characters.filter((c) => c.type !== 'item'));
    } else {
      itemsStore.replaceAll(data.characters.filter((c) => c.type === 'item'));
      charactersStore.replaceAll(data.characters.filter((c) => c.type !== 'item'));
    }
    campaignsStore.replaceAll(data.campaigns, data.campaignCharacterAssignments);
    skillsStore.replaceAll(data.skills ?? [...SKILL_LIST]);
  }

  return { exportJSON, importJSON, applyImport };
}
