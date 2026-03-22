<script setup lang="ts">
import FateButton from './FateButton.vue';
import type { ButtonVariant } from '../../types';

withDefaults(defineProps<{
  title: string;
  message: string;
  confirmVariant?: ButtonVariant;
}>(), {
  confirmVariant: 'danger',
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <div class="dialog-overlay" @click.self="emit('cancel')">
    <div class="dialog-box">
      <div class="dialog-title">{{ title }}</div>
      <div class="dialog-message">{{ message }}</div>
      <div class="dialog-actions">
        <FateButton icon="close" variant="secondary" @click="emit('cancel')">Abbrechen</FateButton>
        <FateButton icon="check" :variant="confirmVariant" @click="emit('confirm')">Bestätigen</FateButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: var(--fate-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-box {
  background: var(--fate-white);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--fate-text);
  margin-bottom: 0.75rem;
}

.dialog-message {
  font-size: 0.9rem;
  color: var(--fate-text);
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
