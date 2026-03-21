import { watch } from 'vue';
import { defineStore } from 'pinia';
import { useLocalStorage, useSessionStorage } from '@vueuse/core';

export const useGMModeStore = defineStore('gmMode', () => {
  const isGMMode = useSessionStorage('gm-mode', false);
  const showGMToggle = useLocalStorage('gm-toggle-visible', false);

  watch(showGMToggle, (visible) => {
    if (!visible) isGMMode.value = false;
  });

  function toggle() {
    isGMMode.value = !isGMMode.value;
  }

  function reset() {
    isGMMode.value = false;
    showGMToggle.value = false;
  }

  return { isGMMode, showGMToggle, toggle, reset };
});
