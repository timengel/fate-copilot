import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGMModeStore = defineStore('gmMode', () => {
  const isGMMode = ref(false)

  function toggle() {
    isGMMode.value = !isGMMode.value
  }

  return { isGMMode, toggle }
})
