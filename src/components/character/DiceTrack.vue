<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  count: number;
  label: string;
  color: 'red' | 'blue';
  maxDice?: number;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  update: [count: number];
}>();

const max = computed(() => props.maxDice ?? 4);

// 3×3 grid (0–8, row-major): which cells contain a pip for each die face
const pipPatterns: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
};

function handleClick(index: number) {
  if (props.readonly) return;
  // Clicking the last active die toggles it off (count → 0), otherwise set to index+1
  const newCount = index + 1 === props.count ? 0 : index + 1;
  emit('update', newCount);
}
</script>

<template>
  <div class="dice-track" :class="color">
    <div class="dice-label">{{ label }}</div>
    <div class="dice-row">
      <button
        v-for="i in max"
        :key="i"
        type="button"
        class="die"
        :class="{ active: i <= count, interactive: !readonly }"
        :disabled="readonly"
        :aria-label="`Würfel ${i}`"
        @click="handleClick(i - 1)"
      >
        <div class="pip-grid">
          <div v-for="cell in 9" :key="cell" class="pip-cell">
            <div v-if="pipPatterns[i]?.includes(cell - 1)" class="pip" />
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dice-track.red {
  --die-color: #dc2626;
  --die-color-light: #fee2e2;
}

.dice-track.blue {
  --die-color: #1480b0;
  --die-color-light: #e8f4fb;
}

.dice-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--die-color);
  background: color-mix(in srgb, var(--die-color) 15%, var(--fate-white));
  padding: 2px 4px;
  margin-bottom: 4px;
}

.dice-row {
  display: flex;
  gap: 6px;
}

.die {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid var(--die-color);
  background: var(--fate-white);
  padding: 0;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.die.interactive {
  cursor: pointer;
}

.die.interactive:hover:not(.active) {
  background: color-mix(in srgb, var(--die-color) 15%, var(--fate-white));
}

.die.interactive:hover.active {
  filter: brightness(1.1);
}

.die.active {
  background: var(--die-color);
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.pip-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 2px;
  width: 20px;
  height: 20px;
}

.pip-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pip {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--die-color);
  opacity: 0.45;
}

.die.active .pip {
  background: white;
  opacity: 1;
}
</style>
