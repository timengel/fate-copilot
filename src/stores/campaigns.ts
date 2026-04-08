import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Campaign,
  CampaignCharacterAssignment,
  CampaignItemAssignment,
  Milestone,
} from '../types';
import { useCharactersStore } from './characters';
import { useItemsStore } from './items';

export const useCampaignsStore = defineStore(
  'campaigns',
  () => {
    const campaigns = ref<Campaign[]>([]);
    const assignments = ref<CampaignCharacterAssignment[]>([]);
    const itemAssignments = ref<CampaignItemAssignment[]>([]);

    function addCampaign(campaign: Campaign) {
      campaigns.value.push(campaign);
    }

    function updateCampaign(updated: Campaign) {
      const index = campaigns.value.findIndex((c) => c.id === updated.id);

      if (index === -1) return;

      campaigns.value[index] = updated;
    }

    function updateCampaignGmNotes(campaignId: string, gmNotes: string) {
      const index = campaigns.value.findIndex((c) => c.id === campaignId);

      if (index === -1) return;

      const campaign = campaigns.value[index]!;
      campaigns.value[index] = { ...campaign, gmNotes };
    }

    function deleteCampaign(id: string) {
      campaigns.value = campaigns.value.filter((c) => c.id !== id);
      assignments.value = assignments.value.filter((a) => a.campaignId !== id);
      itemAssignments.value = itemAssignments.value.filter((a) => a.campaignId !== id);
    }

    function getById(id: string): Campaign | undefined {
      return campaigns.value.find((c) => c.id === id);
    }

    function assignCharacter(campaignId: string, characterId: string) {
      const exists = assignments.value.some(
        (a) => a.campaignId === campaignId && a.characterId === characterId,
      );
      if (!exists) {
        assignments.value.push({ campaignId, characterId });
      }
    }

    function unassignCharacter(campaignId: string, characterId: string) {
      assignments.value = assignments.value.filter(
        (a) => !(a.campaignId === campaignId && a.characterId === characterId),
      );
    }

    function getCharactersForCampaign(campaignId: string) {
      const charactersStore = useCharactersStore();
      const ids = assignments.value
        .filter((a) => a.campaignId === campaignId)
        .map((a) => a.characterId);
      return charactersStore.characters.filter((c) => ids.includes(c.id));
    }

    function assignItem(campaignId: string, itemId: string) {
      const exists = itemAssignments.value.some(
        (a) => a.campaignId === campaignId && a.itemId === itemId,
      );
      if (!exists) {
        itemAssignments.value.push({ campaignId, itemId });
      }
    }

    function unassignItem(campaignId: string, itemId: string) {
      itemAssignments.value = itemAssignments.value.filter(
        (a) => !(a.campaignId === campaignId && a.itemId === itemId),
      );
    }

    function getItemsForCampaign(campaignId: string) {
      const itemsStore = useItemsStore();
      const ids = itemAssignments.value
        .filter((a) => a.campaignId === campaignId)
        .map((a) => a.itemId);
      return itemsStore.items.filter((i) => ids.includes(i.id));
    }

    function getCampaignsForItem(itemId: string) {
      const ids = itemAssignments.value.filter((a) => a.itemId === itemId).map((a) => a.campaignId);
      return campaigns.value.filter((c) => ids.includes(c.id));
    }

    function getCampaignsForCharacter(characterId: string) {
      const ids = assignments.value
        .filter((a) => a.characterId === characterId)
        .map((a) => a.campaignId);
      return campaigns.value.filter((c) => ids.includes(c.id));
    }

    function addMilestone(campaignId: string, milestone: Milestone) {
      const index = campaigns.value.findIndex((c) => c.id === campaignId);

      if (index === -1) return;

      const campaign = campaigns.value[index]!;

      campaigns.value[index] = { ...campaign, milestones: [...campaign.milestones, milestone] };
    }

    function removeMilestone(campaignId: string, milestoneId: string) {
      const index = campaigns.value.findIndex((c) => c.id === campaignId);

      if (index === -1) return;

      const campaign = campaigns.value[index]!;
      campaigns.value[index] = {
        ...campaign,
        milestones: campaign.milestones.filter((m) => m.id !== milestoneId),
      };
    }

    function updateMilestone(campaignId: string, updated: Milestone) {
      const index = campaigns.value.findIndex((c) => c.id === campaignId);

      if (index === -1) return;

      const campaign = campaigns.value[index]!;
      campaigns.value[index] = {
        ...campaign,
        milestones: campaign.milestones.map((m) => (m.id === updated.id ? updated : m)),
      };
    }

    function replaceAll(
      incomingCampaigns: Campaign[],
      incomingAssignments: CampaignCharacterAssignment[],
      incomingItemAssignments: CampaignItemAssignment[] = [],
    ) {
      campaigns.value = incomingCampaigns;
      assignments.value = incomingAssignments;
      itemAssignments.value = incomingItemAssignments;
    }

    function reset() {
      campaigns.value = [];
      assignments.value = [];
      itemAssignments.value = [];
    }

    const activeCampaigns = computed(() => campaigns.value.filter((c) => c.status === 'active'));

    const characterCountsForCampaign = computed(() => (campaignId: string) => {
      const chars = getCharactersForCampaign(campaignId);
      return {
        sc: chars.filter((c) => (c.type ?? 'sc') === 'sc').length,
        nsc: chars.filter((c) => c.type === 'nsc').length,
      };
    });

    return {
      campaigns,
      assignments,
      itemAssignments,
      activeCampaigns,
      characterCountsForCampaign,
      addCampaign,
      updateCampaign,
      updateCampaignGmNotes,
      deleteCampaign,
      getById,
      assignCharacter,
      unassignCharacter,
      getCharactersForCampaign,
      getCampaignsForCharacter,
      assignItem,
      unassignItem,
      getItemsForCampaign,
      getCampaignsForItem,
      addMilestone,
      removeMilestone,
      updateMilestone,
      replaceAll,
      reset,
    };
  },
  {
    persist: { key: 'fcp-campaigns' },
  },
);
