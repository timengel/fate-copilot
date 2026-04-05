<script setup lang="ts">
import FateCheatSheet from '../components/shared/cheat-sheet/FateCheatSheet.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import { useGMModeStore } from '../stores/gmMode';

const gmModeStore = useGMModeStore();
</script>

<template>
  <div class="cheat-sheet-view">
    <FateHeader title="Cheat Sheet" />

    <FateCheatSheet :variant="gmModeStore.isGMMode ? 'gm' : 'basic'" />
  </div>
</template>

<style scoped>
.cheat-sheet-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
