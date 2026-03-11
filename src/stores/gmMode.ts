import { defineStore } from 'pinia';
import { useSessionStorage } from '@vueuse/core';

export const useGMModeStore = defineStore('gmMode', () => {
  const isGMMode = useSessionStorage('gm-mode', false);

  function toggle() {
    isGMMode.value = !isGMMode.value;
  }

  return { isGMMode, toggle };
});
