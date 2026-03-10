import { watch } from 'vue'
import type { AppData, AppDataVersion } from '../types'
import { SKILL_LIST } from '../types'
import { useCharactersStore } from '../stores/characters'
import { useCampaignsStore } from '../stores/campaigns'
import { useSkillsStore } from '../stores/skills'

const STORAGE_KEY = 'fate-copilot-data'
const FORMAT_VERSION: AppDataVersion = '1.1'

export function initPersistence() {
  const charactersStore = useCharactersStore()
  const campaignsStore = useCampaignsStore()
  const skillsStore = useSkillsStore()

  // Beim Start: aus localStorage laden
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const data = JSON.parse(raw) as AppData
      if (data.formatVersion === '1.0' || data.formatVersion === '1.1') {
        charactersStore.replaceAll(data.characters ?? [])
        const campaigns = (data.campaigns ?? []).map(c => ({ ...c, milestones: c.milestones ?? [] }))
        campaignsStore.replaceAll(campaigns, data.campaignCharacterAssignments ?? [])
        skillsStore.replaceAll(data.skills ?? [...SKILL_LIST])
      }
    } catch {
      // Korrupte Daten still ignorieren
    }
  }

  // Bei jeder Änderung: in localStorage schreiben
  watch(
    [() => charactersStore.characters, () => campaignsStore.campaigns, () => campaignsStore.assignments, () => skillsStore.skills],
    () => {
      const data: AppData = {
        formatVersion: FORMAT_VERSION,
        exportDate: new Date().toISOString(),
        campaigns: campaignsStore.campaigns,
        characters: charactersStore.characters,
        campaignCharacterAssignments: campaignsStore.assignments,
        skills: skillsStore.skills,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },
    { deep: true }
  )
}
