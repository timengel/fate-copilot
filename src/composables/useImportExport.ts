import { SKILL_LIST, type AppData, type AppDataVersion, type AppSkill, type SkillInfo } from '@fate/types';
import { useCharactersStore } from '../stores/characters';
import { useItemsStore } from '../stores/items';
import { useCampaignsStore } from '../stores/campaigns';
import { useSkillsStore } from '../stores/skills';
import { useCharacterItemsStore } from '../stores/characterItems';
import { normalizeCharacterStress, normalizeItemStress } from '../utils/stressTracks';
import {
  CURRENT_APP_DATA_VERSION,
  SUPPORTED_APP_DATA_VERSIONS,
  migrateAppDataToCurrent,
} from '../utils/appDataMigration';

const FORMAT_VERSION: AppDataVersion = CURRENT_APP_DATA_VERSION;
const SUPPORTED_VERSIONS: AppDataVersion[] = SUPPORTED_APP_DATA_VERSIONS;

function isAppSkill(value: unknown): value is AppSkill {
  return (
    typeof value === 'object' && value !== null && typeof (value as AppSkill).name === 'string'
  );
}

function getActionExamples(action: { examples?: string; note?: string }): string {
  return action.examples ?? action.note ?? '';
}

function buildAppSkills(skills: string[], skillInfo: Record<string, SkillInfo>): AppSkill[] {
  return skills.map((name) => ({
    name,
    description: skillInfo[name]?.description ?? '',
    actions: (skillInfo[name]?.actions ?? []).map((action) => ({
      name: action.name,
      examples: getActionExamples(action),
    })),
  }));
}

function parseImportedSkills(skills: AppData['skills']): {
  names: string[];
  info: Record<string, SkillInfo>;
} {
  if (!skills) {
    return { names: [...SKILL_LIST], info: {} };
  }

  if (skills.every((skill) => typeof skill === 'string')) {
    return { names: [...skills], info: {} };
  }

  if (skills.every(isAppSkill)) {
    return {
      names: skills.map((skill) => skill.name),
      info: Object.fromEntries(
        skills.map((skill) => [
          skill.name,
          {
            description: skill.description ?? '',
            actions: (skill.actions ?? []).map((action) => ({
              name: action.name,
              examples: action.examples ?? '',
            })),
          },
        ]),
      ),
    };
  }

  throw new Error('Ungültiges "skills"-Format.');
}

export function useImportExport() {
  function exportJSON() {
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();
    const campaignsStore = useCampaignsStore();
    const skillsStore = useSkillsStore();
    const characterItemsStore = useCharacterItemsStore();

    const data: AppData = {
      formatVersion: FORMAT_VERSION,
      exportDate: new Date().toISOString(),
      campaigns: campaignsStore.campaigns,
      characters: charactersStore.characters.map(normalizeCharacterStress),
      items: itemsStore.items.map(normalizeItemStress),
      campaignCharacterAssignments: campaignsStore.assignments,
      campaignItemAssignments: campaignsStore.itemAssignments,
      characterItemAssignments: characterItemsStore.assignments,
      skills: buildAppSkills(skillsStore.skills, skillsStore.skillInfo),
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

  async function exportToClipboard(): Promise<void> {
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();
    const campaignsStore = useCampaignsStore();
    const skillsStore = useSkillsStore();
    const characterItemsStore = useCharacterItemsStore();

    const data: AppData = {
      formatVersion: FORMAT_VERSION,
      exportDate: new Date().toISOString(),
      campaigns: campaignsStore.campaigns,
      characters: charactersStore.characters.map(normalizeCharacterStress),
      items: itemsStore.items.map(normalizeItemStress),
      campaignCharacterAssignments: campaignsStore.assignments,
      campaignItemAssignments: campaignsStore.itemAssignments,
      characterItemAssignments: characterItemsStore.assignments,
      skills: buildAppSkills(skillsStore.skills, skillsStore.skillInfo),
    };

    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  }

  function importFromString(jsonString: string): AppData {
    const raw = JSON.parse(jsonString);
    validateImportData(raw);
    return migrateAppDataToCurrent(raw as AppData);
  }

  function importJSON(file: File): Promise<AppData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const raw = JSON.parse(e.target?.result as string);
          if (validateImportData(raw)) {
            resolve(migrateAppDataToCurrent(raw as AppData));
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
    const migratedData = migrateAppDataToCurrent(data);
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();
    const campaignsStore = useCampaignsStore();
    const skillsStore = useSkillsStore();
    const characterItemsStore = useCharacterItemsStore();

    itemsStore.replaceAll(migratedData.items ?? []);
    charactersStore.replaceAll(migratedData.characters);
    campaignsStore.replaceAll(
      migratedData.campaigns,
      migratedData.campaignCharacterAssignments,
      migratedData.campaignItemAssignments ?? [],
    );
    characterItemsStore.replaceAll(migratedData.characterItemAssignments ?? []);
    const importedSkills = parseImportedSkills(migratedData.skills);
    skillsStore.replaceAllWithInfo(importedSkills.names, importedSkills.info);
  }

  return { exportJSON, exportToClipboard, importJSON, importFromString, applyImport };
}
