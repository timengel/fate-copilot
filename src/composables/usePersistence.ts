import { watchEffect } from 'vue';
import type { AppData, AppDataVersion } from '../types';
import { SKILL_LIST } from '../types';
import { useCharactersStore } from '../stores/characters';
import { useItemsStore } from '../stores/items';
import { useCampaignsStore } from '../stores/campaigns';
import { useSkillsStore } from '../stores/skills';

const STORAGE_KEY = 'fate-copilot-data';
const FORMAT_VERSION: AppDataVersion = '1.1';

export function initPersistence() {
  const charactersStore = useCharactersStore();
  const itemsStore = useItemsStore();
  const campaignsStore = useCampaignsStore();
  const skillsStore = useSkillsStore();

  // Beim Start: aus localStorage laden
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const data: unknown = JSON.parse(raw);
      if (
        typeof data === 'object' &&
        data !== null &&
        'formatVersion' in data &&
        (data.formatVersion === '1.0' || data.formatVersion === '1.1')
      ) {
        const appData = data as AppData; // safe: object shape and format version validated
        // Items in eigenem Store laden; Migration: alte Daten hatten Items im characters-Array
        if (appData.items) {
          itemsStore.replaceAll(appData.items);
          charactersStore.replaceAll((appData.characters ?? []).filter((c) => c.type !== 'item'));
        } else {
          itemsStore.replaceAll((appData.characters ?? []).filter((c) => c.type === 'item'));
          charactersStore.replaceAll((appData.characters ?? []).filter((c) => c.type !== 'item'));
        }
        const campaigns = (appData.campaigns ?? []).map((c) => ({
          ...c,
          milestones: c.milestones ?? [],
        }));
        campaignsStore.replaceAll(campaigns, appData.campaignCharacterAssignments ?? []);
        skillsStore.replaceAll(appData.skills ?? [...SKILL_LIST]);
      }
    } catch {
      // Korrupte Daten still ignorieren
    }
  }

  // Bei jeder Änderung: in localStorage schreiben
  watchEffect(() => {
    const data: AppData = {
      formatVersion: FORMAT_VERSION,
      exportDate: new Date().toISOString(),
      campaigns: campaignsStore.campaigns,
      characters: charactersStore.characters,
      items: itemsStore.items,
      campaignCharacterAssignments: campaignsStore.assignments,
      skills: skillsStore.skills,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  });
}
