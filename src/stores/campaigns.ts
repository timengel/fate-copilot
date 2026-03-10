import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Campaign, CampaignCharacterAssignment, Milestone } from '../types'
import { useCharactersStore } from './characters'

export const useCampaignsStore = defineStore('campaigns', () => {
  const campaigns = ref<Campaign[]>([])
  const assignments = ref<CampaignCharacterAssignment[]>([])

  function addCampaign(campaign: Campaign) {
    campaigns.value.push(campaign)
  }

  function updateCampaign(updated: Campaign) {
    const index = campaigns.value.findIndex(c => c.id === updated.id)
    if (index !== -1) {
      campaigns.value[index] = updated
    }
  }

  function deleteCampaign(id: string) {
    campaigns.value = campaigns.value.filter(c => c.id !== id)
    assignments.value = assignments.value.filter(a => a.campaignId !== id)
  }

  function getById(id: string): Campaign | undefined {
    return campaigns.value.find(c => c.id === id)
  }

  function assignCharacter(campaignId: string, characterId: string) {
    const exists = assignments.value.some(
      a => a.campaignId === campaignId && a.characterId === characterId
    )
    if (!exists) {
      assignments.value.push({ campaignId, characterId })
    }
  }

  function unassignCharacter(campaignId: string, characterId: string) {
    assignments.value = assignments.value.filter(
      a => !(a.campaignId === campaignId && a.characterId === characterId)
    )
  }

  function getCharactersForCampaign(campaignId: string) {
    const charactersStore = useCharactersStore()
    const ids = assignments.value
      .filter(a => a.campaignId === campaignId)
      .map(a => a.characterId)
    return charactersStore.characters.filter(c => ids.includes(c.id))
  }

  function getCampaignsForCharacter(characterId: string) {
    const ids = assignments.value
      .filter(a => a.characterId === characterId)
      .map(a => a.campaignId)
    return campaigns.value.filter(c => ids.includes(c.id))
  }

  function addMilestone(campaignId: string, milestone: Milestone) {
    const index = campaigns.value.findIndex(c => c.id === campaignId)
    if (index !== -1) {
      const c = campaigns.value[index]
      campaigns.value[index] = { ...c, milestones: [...c.milestones, milestone] }
    }
  }

  function removeMilestone(campaignId: string, milestoneId: string) {
    const index = campaigns.value.findIndex(c => c.id === campaignId)
    if (index !== -1) {
      const c = campaigns.value[index]
      campaigns.value[index] = { ...c, milestones: c.milestones.filter(m => m.id !== milestoneId) }
    }
  }

  function updateMilestone(campaignId: string, updated: Milestone) {
    const index = campaigns.value.findIndex(c => c.id === campaignId)
    if (index !== -1) {
      const c = campaigns.value[index]
      campaigns.value[index] = {
        ...c,
        milestones: c.milestones.map(m => m.id === updated.id ? updated : m),
      }
    }
  }

  function replaceAll(incomingCampaigns: Campaign[], incomingAssignments: CampaignCharacterAssignment[]) {
    campaigns.value = incomingCampaigns
    assignments.value = incomingAssignments
  }

  const activeCampaigns = computed(() => campaigns.value.filter(c => c.status === 'active'))

  return {
    campaigns,
    assignments,
    activeCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    getById,
    assignCharacter,
    unassignCharacter,
    getCharactersForCampaign,
    getCampaignsForCharacter,
    addMilestone,
    removeMilestone,
    updateMilestone,
    replaceAll,
  }
})
