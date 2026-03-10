<script setup lang="ts">
import type { StressBox } from '../../types'

const props = defineProps<{
  boxes: StressBox[]
  label: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  update: [boxes: StressBox[]]
}>()

function toggle(index: number) {
  if (props.readonly) return
  const updated = props.boxes.map((b, i) =>
    i === index ? { ...b, checked: !b.checked } : b
  )
  emit('update', updated)
}
</script>

<template>
  <div class="stress-track">
    <div class="stress-label">{{ label }}</div>
    <div class="stress-boxes">
      <label
        v-for="(box, i) in boxes"
        :key="i"
        class="stress-box"
        :class="{ checked: box.checked, readonly }"
      >
        <input
          type="checkbox"
          :checked="box.checked"
          :disabled="readonly"
          @change="toggle(i)"
        />
        <span class="box-value">{{ box.value }}</span>
      </label>
    </div>
  </div>
</template>
