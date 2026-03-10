<script setup lang="ts">
defineProps<{
  title: string
  message: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div class="dialog-overlay" @click.self="emit('cancel')">
    <div class="dialog-box">
      <div class="dialog-title">{{ title }}</div>
      <div class="dialog-message">{{ message }}</div>
      <div class="dialog-actions">
        <button class="btn-secondary" @click="emit('cancel')">Abbrechen</button>
        <button class="btn-primary btn-danger" @click="emit('confirm')">Bestätigen</button>
      </div>
    </div>
  </div>
</template>
