<script setup lang="ts">
import { useSlots } from 'vue'
import type { ButtonVariant, ButtonSize, ButtonIcon } from '../../types'
import FateIcon from './FateIcon.vue'

const slots = useSlots()

withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  icon?: ButtonIcon
}>(), {
  variant: 'primary',
  size: 'M',
  type: 'button',
})
</script>

<template>
  <button
    :type="type"
    :class="[
      'fate-btn',
      `fate-btn--${variant}`,
      `fate-btn--${size}`,
      { 'fate-btn--icon-only': icon && !slots.default },
    ]"
  >
    <FateIcon v-if="icon" :name="icon" />
    <slot />
  </button>
</template>
