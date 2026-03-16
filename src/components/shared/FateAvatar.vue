<script setup lang="ts">
withDefaults(defineProps<{ value?: string; size?: 'S' | 'M' }>(), { size: 'M' });
</script>

<template>
  <div v-if="value" class="fate-avatar" :class="`fate-avatar--${size}`">{{ value }}</div>
</template>

<style scoped>
.fate-avatar {
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
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
