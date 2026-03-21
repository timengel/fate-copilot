import { defineStore } from 'pinia';
import { useLocalStorage, useSessionStorage } from '@vueuse/core';

export const useGMModeStore = defineStore('gmMode', () => {
  const isGMMode = useSessionStorage('gm-mode', false);
  const showGMToggle = useLocalStorage('gm-toggle-visible', false);

  function toggle() {
    isGMMode.value = !isGMMode.value;
  }

  return { isGMMode, showGMToggle, toggle };
});
