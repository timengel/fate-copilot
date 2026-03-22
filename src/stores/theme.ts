import { computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useLocalStorage, usePreferredDark } from '@vueuse/core';

export type ThemeMode = 'light' | 'dark' | 'system';

export const useThemeStore = defineStore('theme', () => {
  const mode = useLocalStorage<ThemeMode>('fcp-theme', 'system');
  const prefersDark = usePreferredDark();

  const isDark = computed(() =>
    mode.value === 'dark' || (mode.value === 'system' && prefersDark.value)
  );

  watch(isDark, (dark) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, { immediate: true });

  return { mode, isDark };
});
