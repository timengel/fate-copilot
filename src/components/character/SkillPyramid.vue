<script setup lang="ts">
import { computed } from 'vue';
import type { SkillEntry } from '../../types';
import { SKILL_LEVEL_LABELS } from '../../types';
import { useSkillsStore } from '../../stores/skills';
import FateButton from '../shared/FateButton.vue';

const props = defineProps<{
  skills: SkillEntry[];
  readonly?: boolean;
  maxLevel?: number;
  maxCols?: number;
}>();

const emit = defineEmits<{
  update: [skills: SkillEntry[]];
  updateLayout: [payload: { maxLevel: number; maxCols: number }];
}>();

const skillsStore = useSkillsStore();

const effectiveMaxLevel = computed(() => props.maxLevel ?? 5);
const effectiveCols = computed(() => props.maxCols ?? 5);

const rows = computed(() =>
  Array.from({ length: effectiveMaxLevel.value }, (_, i) => effectiveMaxLevel.value - i),
);

const maxOccupiedLevel = computed(() => {
  if (!props.readonly) return effectiveMaxLevel.value;
  const levels = props.skills.map((s) => s.level);
  return levels.length > 0 ? Math.max(...levels) : 0;
});

const visibleRows = computed(() => rows.value.filter((level) => level <= maxOccupiedLevel.value));

const skillsAtLevel = computed(() => {
  const map: Record<number, string[]> = {};
  for (let l = 1; l <= effectiveMaxLevel.value; l++) map[l] = [];
  for (const entry of props.skills) {
    if (map[entry.level]) map[entry.level]!.push(entry.skill);
  }
  return map;
});

const usedSkills = computed(() => new Set(props.skills.map((s) => s.skill)));
const canAddRow = computed(() => effectiveMaxLevel.value < 8);

function getSlotValue(level: number, slotIndex: number): string {
  return skillsAtLevel.value[level]?.[slotIndex] ?? '';
}

function updateSlot(level: number, slotIndex: number, value: string) {
  const atLevel = props.skills.filter((s) => s.level === level);
  const others = props.skills.filter((s) => s.level !== level);
  if (value) {
    const newAtLevel = [...atLevel];
    newAtLevel[slotIndex] = { skill: value, level };
    emit('update', [...others, ...newAtLevel.filter((s) => s.skill)]);
  } else {
    const newAtLevel = atLevel.filter((_, i) => i !== slotIndex);
    emit('update', [...others, ...newAtLevel]);
  }
}

function addRow() {
  if (!canAddRow.value) return;
  emit('updateLayout', { maxLevel: effectiveMaxLevel.value + 1, maxCols: effectiveCols.value });
}

function removeRow() {
  const newMaxLevel = effectiveMaxLevel.value - 1;
  if (newMaxLevel < 1) return;
  const updatedSkills = props.skills.filter((s) => s.level <= newMaxLevel);
  emit('update', updatedSkills);
  emit('updateLayout', { maxLevel: newMaxLevel, maxCols: effectiveCols.value });
}

function addCol() {
  emit('updateLayout', { maxLevel: effectiveMaxLevel.value, maxCols: effectiveCols.value + 1 });
}

function onSkillChange(level: number, i: number, e: Event) {
  if (e.target instanceof HTMLSelectElement) updateSlot(level, i - 1, e.target.value);
}

function removeCol() {
  const newCols = effectiveCols.value - 1;
  if (newCols < 1) return;
  const updatedSkills = props.skills.filter((s) => {
    const atLevel = skillsAtLevel.value[s.level] ?? [];
    return atLevel.indexOf(s.skill) < newCols;
  });
  emit('update', updatedSkills);
  emit('updateLayout', { maxLevel: effectiveMaxLevel.value, maxCols: newCols });
}
</script>

<template>
  <div class="skill-pyramid">
    <div v-for="level in visibleRows" :key="level" class="pyramid-row">
      <div class="level-label">
        <span class="level-plus">+{{ level }}</span>
        <span class="level-name">{{ SKILL_LEVEL_LABELS[level] ?? '' }}</span>
      </div>
      <div class="level-slots">
        <div v-for="i in effectiveCols" :key="i" class="skill-slot">
          <span
            v-if="readonly"
            class="skill-value"
            :class="{ 'skill-value--filled': !!getSlotValue(level, i - 1) }"
            >{{ getSlotValue(level, i - 1) }}</span
          >
          <select
            v-else
            class="skill-select"
            :class="{ 'skill-select--filled': !!getSlotValue(level, i - 1) }"
            :value="getSlotValue(level, i - 1)"
            @change="onSkillChange(level, i, $event)"
          >
            <option value="">—</option>
            <option
              v-for="skill in skillsStore.skills"
              :key="skill"
              :value="skill"
              :disabled="usedSkills.has(skill) && skill !== getSlotValue(level, i - 1)"
            >
              {{ skill }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div v-if="!readonly" class="pyramid-actions">
      <FateButton variant="secondary" size="S" :disabled="effectiveMaxLevel <= 1" @click="removeRow"
        >− Zeile</FateButton
      >
      <FateButton
        variant="secondary"
        size="S"
        class="btn-flavor"
        :disabled="!canAddRow"
        @click="addRow"
        >+ Zeile</FateButton
      >
      <FateButton variant="secondary" size="S" :disabled="effectiveCols <= 1" @click="removeCol"
        >− Spalte</FateButton
      >
      <FateButton variant="secondary" size="S" class="btn-flavor" @click="addCol"
        >+ Spalte</FateButton
      >
    </div>
  </div>
</template>

<style scoped>
.skill-pyramid {
  padding: 0.5rem 0.75rem;
  container-type: inline-size;
}

.btn-flavor {
  background: var(--fate-blue) !important;
  color: white !important;
}
.btn-flavor:hover {
  background: var(--fate-blue-dark) !important;
}

.pyramid-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.5rem 0 0.25rem;
}

.pyramid-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 4px;
}

.level-label {
  display: flex;
  gap: 0.25rem;
  align-items: baseline;
  flex: 0 0 130px;
  overflow: hidden;
}

.level-plus {
  color: var(--fate-blue);
  font-weight: 700;
  font-size: 0.75rem;
}

.level-name {
  font-size: 0.75rem;
  color: var(--fate-text);
  font-weight: 500;
}

.level-slots {
  display: flex;
  gap: 4px;
  flex: 1;
}

.skill-slot {
  flex: 1;
  min-width: 0;
}

.skill-value {
  display: block;
  border-radius: 6px;
  height: 1.6em;
  padding: 0.15rem 0.4rem;
  font-size: 0.8rem;
  color: var(--fate-text);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-value--filled {
  background: var(--fate-blue-light);
}

.skill-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--fate-light-border);
  padding: 2px 3px;
  font-size: 0.8rem;
  font-family: inherit;
  color: var(--fate-text);
  background: transparent;
  outline: none;
  text-align: center;
}

.skill-input:focus {
  border-bottom-color: var(--fate-blue);
  background: var(--fate-blue-light);
}

.skill-slot--locked {
  border-radius: 6px;
  background: var(--fate-blue-light);
  opacity: 0.2;
  pointer-events: none;
}

.skill-select {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0.15rem 0.4rem;
  font-size: 0.75rem;
  font-family: inherit;
  color: var(--fate-text);
  background: var(--fate-blue-light);
  outline: none;
  cursor: pointer;
  appearance: auto;
  text-overflow: ellipsis;
}

.skill-select--filled {
  background: var(--fate-blue-light);
}

.skill-select:focus {
  border-color: var(--fate-blue);
  background: color-mix(in srgb, var(--fate-blue-light) 78%, white 22%);
}

@container (width < 500px) {
  .level-label {
    flex: 0 0 90px;
    overflow: hidden;
  }
  .pyramid-row {
    margin-bottom: 1rem;
  }
  .pyramid-row:last-of-type {
    margin-bottom: 0.25rem;
  }
  .pyramid-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

@container (width < 350px) {
  .pyramid-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    margin-bottom: 1rem;
  }
  .pyramid-row:last-of-type {
    margin-bottom: 0.25rem;
  }
  .level-label {
    flex: none;
    min-width: 0;
    overflow: visible;
  }
  .level-slots {
    width: 100%;
    flex-wrap: wrap;
  }
  .skill-slot {
    flex: 1 1 55px;
    min-width: 55px;
  }
}
</style>
