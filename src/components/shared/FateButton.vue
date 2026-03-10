<script setup lang="ts">
import type { ButtonVariant, ButtonSize } from '../../types'

withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
})
</script>

<template>
  <button
    :type="type"
    :class="['fate-btn', `fate-btn--${variant}`, { 'fate-btn--sm': size === 'sm' }]"
  >
    <slot />
  </button>
</template>
