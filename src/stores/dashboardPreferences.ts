import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardPreferencesStore = defineStore(
  'dashboardPreferences',
  () => {
    const selectedCampaignFilter = ref('active');
    const showSC = ref(true);
    const showNSC = ref(true);
    const showArchivedCharacters = ref(false);
    const showItems = ref(true);
    const showArchivedItems = ref(false);
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
      modifiers: true,
    });

    function reset() {
      selectedCampaignFilter.value = 'active';
      showSC.value = true;
      showNSC.value = true;
      showArchivedCharacters.value = false;
      showItems.value = true;
      showArchivedItems.value = false;
      showEditButton.value = true;
      layout.value = 'list';
      visibleSections.value = {
        general: true,
        aspects: true,
        skills: true,
        extras: true,
        stunts: true,
        stress: true,
        consequences: true,
        gmNotes: true,
        dice: true,
        modifiers: true,
      };
    }

    return {
      selectedCampaignFilter,
      showSC,
      showNSC,
      showArchivedCharacters,
      showItems,
      showArchivedItems,
      showEditButton,
      layout,
      visibleSections,
      reset,
    };
  },
  { persist: { key: 'fcp-dashboard' } },
);
