<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <div class="fate-header">
    <h1>{{ title }}</h1>
    <slot />
  </div>
</template>

<style scoped>
.fate-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--fate-heading);
}

@container main (width < 480px) {
  .fate-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>
