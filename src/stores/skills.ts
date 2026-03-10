import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SKILL_LIST } from '../types'

export const useSkillsStore = defineStore('skills', () => {
  const skills = ref<string[]>([...SKILL_LIST])

  function addSkill(name: string) {
    const trimmed = name.trim()
    if (trimmed && !skills.value.includes(trimmed)) {
      skills.value.push(trimmed)
    }
  }

  function removeSkill(name: string) {
    skills.value = skills.value.filter(s => s !== name)
  }

  function replaceAll(incoming: string[]) {
    skills.value = incoming
  }

  function resetToDefaults() {
    skills.value = [...SKILL_LIST]
  }

  return { skills, addSkill, removeSkill, replaceAll, resetToDefaults }
})
