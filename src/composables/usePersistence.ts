import { watchEffect } from 'vue';
import type { AppData, AppDataVersion, Character, Item } from '../types';
import { SKILL_LIST } from '../types';
import { useCharactersStore } from '../stores/characters';
import { useItemsStore } from '../stores/items';
import { useCampaignsStore } from '../stores/campaigns';
import { useSkillsStore } from '../stores/skills';

const STORAGE_KEY = 'fate-copilot-data';
const FORMAT_VERSION: AppDataVersion = '1.1';

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

export function initPersistence() {
  const charactersStore = useCharactersStore();
  const itemsStore = useItemsStore();
  const campaignsStore = useCampaignsStore();
  const skillsStore = useSkillsStore();

  // Beim Start: aus localStorage laden
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw) as AppData;
      if (data.formatVersion === '1.0' || data.formatVersion === '1.1') {
        if (data.items) {
          itemsStore.replaceAll(data.items);
          charactersStore.replaceAll((data.characters ?? []));
        } else {
          const legacy = (data.characters ?? []) as unknown as LegacyCharacter[];
          itemsStore.replaceAll(legacy.filter((c) => c.type === 'item').map(migrateToItem));
          charactersStore.replaceAll(legacy.filter((c) => c.type !== 'item') as unknown as Character[]);
        }
        const campaigns = (data.campaigns ?? []).map((c) => ({
          ...c,
          milestones: c.milestones ?? [],
        }));
        campaignsStore.replaceAll(campaigns, data.campaignCharacterAssignments ?? []);
        skillsStore.replaceAll(data.skills ?? [...SKILL_LIST]);
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
