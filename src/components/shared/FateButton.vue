<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'danger-outline' | 'link' | 'outline' | 'add' | 'info' | 'counter' | 'ghost'
  size?: 'sm' | 'md'
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
