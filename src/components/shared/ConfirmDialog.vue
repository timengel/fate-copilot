<script setup lang="ts">
import FateButton from './FateButton.vue'

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
        <FateButton variant="secondary" @click="emit('cancel')">Abbrechen</FateButton>
        <FateButton variant="danger" @click="emit('confirm')">Bestätigen</FateButton>
      </div>
    </div>
  </div>
</template>
