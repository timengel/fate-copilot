<script setup lang="ts">
import { useToastStore } from '../../stores/toast';

const toastStore = useToastStore();
</script>

<template>
  <Transition name="toast">
    <div
      v-if="toastStore.visible"
      class="fate-toast"
      :class="`fate-toast--${toastStore.type}`"
    >
      {{ toastStore.message }}
    </div>
  </Transition>
</template>

<style scoped>
.fate-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  white-space: nowrap;
  pointer-events: none;
}

.fate-toast--success {
  background: #1c9ed6;
}

.fate-toast--error {
  background: var(--fate-red);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(0.5rem);
}
</style>
