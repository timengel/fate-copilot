<script setup lang="ts">
import FateCheatSheet from './cheat-sheet/FateCheatSheet.vue';

type CheatSheetVariant = 'basic' | 'gm';

const props = withDefaults(
  defineProps<{
    variant?: CheatSheetVariant;
  }>(),
  {
    variant: 'gm',
  },
);
</script>

<template>
  <FateCheatSheet :variant="props.variant" />
</template>
