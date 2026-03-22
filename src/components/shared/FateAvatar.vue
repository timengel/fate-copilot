<script setup lang="ts">
withDefaults(defineProps<{ value?: string; size?: 'S' | 'M'; background?: string }>(), {
  size: 'M',
  background: 'rgba(255, 255, 255, 0.3)',
});
</script>

<template>
  <div
    v-if="value"
    class="fate-avatar"
    :class="`fate-avatar--${size}`"
    :style="{ background }"
  >
    <span class="fate-avatar__content">{{ value }}</span>
  </div>
</template>

<style scoped>
.fate-avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  overflow: hidden;
}

.fate-avatar__content {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
}

.fate-avatar--M {
  width: 2rem;
  height: 2rem;
  font-size: 1rem;
}

.fate-avatar--S {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.95rem;
}
</style>
