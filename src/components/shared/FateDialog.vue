<script setup lang="ts">
import { Teleport, onBeforeUnmount, onMounted, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  ariaLabel?: string;
  contentClass?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleKeydown(event: KeyboardEvent) {
  if (!props.open) return;
  if (event.key !== 'Escape') return;
  emit('close');
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    // Clear potential stuck text selection on open for smoother light-dismiss UX.
    window.getSelection?.()?.removeAllRanges();
  },
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fate-dialog-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="ariaLabel"
      @click.self="emit('close')"
    >
      <div class="fate-dialog-content" :class="contentClass">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.fate-dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  z-index: 2100;
  background: rgba(11, 18, 32, 0.46);
  backdrop-filter: blur(2px);
}

.fate-dialog-content {
  max-width: 100%;
  max-height: 100%;
}
</style>
