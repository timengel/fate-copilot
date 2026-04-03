<script setup lang="ts">
import FateCheatSheet from '../components/shared/FateCheatSheet.vue';
import FateHeader from '../components/shared/FateHeader.vue';
import { useGMModeStore } from '../stores/gmMode';

const gmModeStore = useGMModeStore();
</script>

<template>
  <div class="cheat-sheet-view">
    <FateHeader title="Cheat Sheet" />

    <FateCheatSheet v-if="gmModeStore.isGMMode" />
    <div v-else class="gm-only-hint">Cheat Sheet ist nur im GM-Modus sichtbar.</div>
  </div>
</template>

<style scoped>
.cheat-sheet-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gm-only-hint {
  border: 1px solid var(--fate-border);
  border-radius: 10px;
  padding: 0.9rem;
  color: var(--fate-text-light);
  background: var(--fate-white);
}
</style>
