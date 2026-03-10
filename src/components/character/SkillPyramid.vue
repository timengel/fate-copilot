<script setup lang="ts">
import { computed } from 'vue'
import type { SkillEntry } from '../../types'
import { SKILL_LEVEL_LABELS } from '../../types'
import { useSkillsStore } from '../../stores/skills'

const props = defineProps<{
  skills: SkillEntry[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  update: [skills: SkillEntry[]]
}>()

const skillsStore = useSkillsStore()

const rows = [5, 4, 3, 2, 1]
const MAX_COLS = 5

const skillsAtLevel = computed(() => {
  const map: Record<number, string[]> = { 5: [], 4: [], 3: [], 2: [], 1: [] }
  for (const entry of props.skills) {
    if (map[entry.level]) map[entry.level]!.push(entry.skill)
  }
  return map
})

// Set of all currently assigned skills across all slots
const usedSkills = computed(() => new Set(props.skills.map(s => s.skill)))

function getSlotValue(level: number, slotIndex: number): string {
  return skillsAtLevel.value[level]?.[slotIndex] ?? ''
}

function updateSlot(level: number, slotIndex: number, value: string) {
  const atLevel = props.skills.filter(s => s.level === level)
  const others = props.skills.filter(s => s.level !== level)
  if (value) {
    const newAtLevel = [...atLevel]
    newAtLevel[slotIndex] = { skill: value, level }
    emit('update', [...others, ...newAtLevel.filter(s => s.skill)])
  } else {
    const newAtLevel = atLevel.filter((_, i) => i !== slotIndex)
    emit('update', [...others, ...newAtLevel])
  }
}
</script>

<template>
  <div class="skill-pyramid">
    <div v-for="level in rows" :key="level" class="pyramid-row">
      <div class="level-label">
        <span class="level-plus">+{{ level }}</span>
        <span class="level-name">{{ SKILL_LEVEL_LABELS[level] }}</span>
      </div>
      <div class="level-slots">
        <div v-for="i in MAX_COLS" :key="i" class="skill-slot">
          <span v-if="readonly" class="skill-value">{{ getSlotValue(level, i - 1) }}</span>
          <select
            v-else
            class="skill-select"
            :value="getSlotValue(level, i - 1)"
            @change="updateSlot(level, i - 1, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">—</option>
            <option
              v-for="skill in skillsStore.skills"
              :key="skill"
              :value="skill"
              :disabled="usedSkills.has(skill) && skill !== getSlotValue(level, i - 1)"
            >{{ skill }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
