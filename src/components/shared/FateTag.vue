<script setup lang="ts">
import { computed } from 'vue';
import type { TagColor } from '../../types';
import { CHARACTER_COLORS } from '../../types';
import { useThemeStore } from '../../stores/theme';

const props = defineProps<{
  color: TagColor;
  label: string;
}>();

const themeStore = useThemeStore();

const style = computed(() => {
  if (props.color === 'gray') {
    return themeStore.isDark
      ? { background: '#3a4a55', color: '#b0c8d8' }
      : { background: '#e8e8e8', color: '#555555' };
  }
  const entry = CHARACTER_COLORS.find((c) => c.id === props.color);
  if (!entry) return {};
  return themeStore.isDark
    ? { background: entry.dark, color: entry.light }
    : { background: entry.light, color: entry.dark };
});
</script>

<template>
  <span class="fate-tag" :style="style">{{ label }}</span>
</template>

<style scoped>
.fate-tag {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
