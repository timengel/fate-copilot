<script setup lang="ts">
import { computed } from 'vue'
import type { SkillEntry } from '../../types'
import { SKILL_LEVEL_LABELS } from '../../types'
import { useSkillsStore } from '../../stores/skills'
import FateButton from '../shared/FateButton.vue'

const props = defineProps<{
  skills: SkillEntry[]
  readonly?: boolean
  maxLevel?: number
  maxCols?: number
}>()

const emit = defineEmits<{
  update: [skills: SkillEntry[]]
  updateLayout: [payload: { maxLevel: number; maxCols: number }]
}>()

const skillsStore = useSkillsStore()

const effectiveMaxLevel = computed(() => props.maxLevel ?? 5)
const effectiveCols = computed(() => props.maxCols ?? 5)

const rows = computed(() =>
  Array.from({ length: effectiveMaxLevel.value }, (_, i) => effectiveMaxLevel.value - i)
)

const skillsAtLevel = computed(() => {
  const map: Record<number, string[]> = {}
  for (let l = 1; l <= effectiveMaxLevel.value; l++) map[l] = []
  for (const entry of props.skills) {
    if (map[entry.level]) map[entry.level]!.push(entry.skill)
  }
  return map
})

const usedSkills = computed(() => new Set(props.skills.map(s => s.skill)))
const canAddRow = computed(() => effectiveMaxLevel.value < 8)

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

function addRow() {
  if (!canAddRow.value) return
  emit('updateLayout', { maxLevel: effectiveMaxLevel.value + 1, maxCols: effectiveCols.value })
}

function removeRow() {
  const newMaxLevel = effectiveMaxLevel.value - 1
  if (newMaxLevel < 1) return
  const updatedSkills = props.skills.filter(s => s.level <= newMaxLevel)
  emit('update', updatedSkills)
  emit('updateLayout', { maxLevel: newMaxLevel, maxCols: effectiveCols.value })
}

function addCol() {
  emit('updateLayout', { maxLevel: effectiveMaxLevel.value, maxCols: effectiveCols.value + 1 })
}

function removeCol() {
  const newCols = effectiveCols.value - 1
  if (newCols < 1) return
  const updatedSkills = props.skills.filter(s => {
    const atLevel = skillsAtLevel.value[s.level] ?? []
    return atLevel.indexOf(s.skill) < newCols
  })
  emit('update', updatedSkills)
  emit('updateLayout', { maxLevel: effectiveMaxLevel.value, maxCols: newCols })
}
</script>

<template>
  <div class="skill-pyramid">
    <div v-for="level in rows" :key="level" class="pyramid-row">
      <div class="level-label">
        <span class="level-plus">+{{ level }}</span>
        <span class="level-name">{{ SKILL_LEVEL_LABELS[level] ?? '' }}</span>
      </div>
      <div class="level-slots">
        <div v-for="i in effectiveCols" :key="i" class="skill-slot">
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
    <div v-if="!readonly" class="pyramid-actions">
      <FateButton variant="secondary" size="S" :disabled="effectiveMaxLevel <= 1" @click="removeRow">− Zeile</FateButton>
      <FateButton variant="add" size="S" :disabled="!canAddRow" @click="addRow">+ Zeile</FateButton>
      <FateButton variant="secondary" size="S" :disabled="effectiveCols <= 1" @click="removeCol">− Spalte</FateButton>
      <FateButton variant="add" size="S" @click="addCol">+ Spalte</FateButton>
    </div>
  </div>
</template>
