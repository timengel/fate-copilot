import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardPreferencesStore = defineStore(
  'dashboardPreferences',
  () => {
    const selectedCampaignId = ref<string | null>(null);
    const showSC = ref(true);
    const showNSC = ref(true);
    const showItems = ref(true);
    const showEditButton = ref(true);
    const layout = ref<'list' | 'grid'>('list');
    const visibleSections = ref({
      general: true,
      aspects: true,
      skills: true,
      extras: true,
      stunts: true,
      stress: true,
      consequences: true,
      gmNotes: true,
      dice: true,
    });

    return { selectedCampaignId, showSC, showNSC, showItems, showEditButton, layout, visibleSections };
  },
  { persist: { key: 'fcp-dashboard' } },
);
