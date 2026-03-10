<script setup lang="ts">
import { CHARACTER_COLORS } from '../../types'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="color-picker">
    <button
      v-for="c in CHARACTER_COLORS"
      :key="c.id"
      class="color-swatch"
      :class="{ active: (props.modelValue ?? 'pfau') === c.id }"
      :style="{ background: c.primary }"
      :title="c.label"
      type="button"
      @click="emit('update:modelValue', c.id)"
    />
  </div>
</template>

<style scoped>
.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  padding: 4px 0;
}

.color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid transparent;
  outline: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: transform 0.15s, outline-color 0.15s, border-color 0.15s;
}

.color-swatch:hover {
  transform: scale(1.15);
  outline-color: rgba(0, 0, 0, 0.2);
}

.color-swatch.active {
  border-color: #fff;
  outline-color: var(--fate-text);
  transform: scale(1.1);
}
</style>
