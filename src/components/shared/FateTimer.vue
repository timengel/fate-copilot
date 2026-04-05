<script setup lang="ts">
import { Teleport } from 'vue';
import FateButton from './FateButton.vue';
import { useTimerStore } from '../../stores/timer';

defineEmits<{
  (e: 'close'): void;
}>();

const timerStore = useTimerStore();

function handlePillClick() {
  timerStore.openPopover();
}

function handleMenuClose() {
  timerStore.closePopover();
}
</script>

<template>
  <!-- Timer Pill (teleported outside popover so it always shows when running) -->
  <Teleport to="body">
    <button
      v-if="timerStore.isRunning && !timerStore.isPopoverOpen"
      type="button"
      class="timer-pill"
      :class="{ 'timer-pill--overtime': timerStore.isOvertime }"
      aria-label="Timer öffnen"
      title="Timer öffnen"
      @click="handlePillClick"
    >
      {{ timerStore.formattedTime }}
    </button>
  </Teleport>

  <!-- Timer Menu (shows when popover is open) -->
  <section v-if="timerStore.isPopoverOpen" class="fate-timer" aria-label="Fate Timer">
    <div class="timer-close-row">
      <FateButton
        icon="close"
        variant="danger-outline"
        size="S"
        aria-label="Timer schließen"
        title="Schließen"
        @click="$emit('close'); handleMenuClose()"
      />
    </div>

    <p class="timer-value" :class="{ overtime: timerStore.isOvertime }">{{ timerStore.formattedTime }}</p>

    <div class="timer-add-row">
      <FateButton variant="secondary" size="S" title="+1 Minute" @click="timerStore.addMinutes(1)">+1</FateButton>
      <FateButton variant="secondary" size="S" title="+5 Minuten" @click="timerStore.addMinutes(5)">+5</FateButton>
      <FateButton variant="secondary" size="S" title="+10 Minuten" @click="timerStore.addMinutes(10)">+10</FateButton>
    </div>

    <div class="timer-control-row">
      <FateButton
        v-if="!timerStore.hasStarted"
        icon="play"
        variant="primary"
        size="M"
        aria-label="Timer starten"
        title="Start"
        :disabled="!timerStore.canStart"
        @click="timerStore.start"
      />
      <FateButton
        v-else-if="timerStore.isRunning"
        icon="pause"
        variant="secondary"
        size="M"
        aria-label="Timer pausieren"
        title="Pause"
        @click="timerStore.pause"
      />
      <template v-else>
        <FateButton
          icon="reset"
          variant="secondary"
          size="M"
          aria-label="Timer zurücksetzen"
          title="Reset"
          @click="timerStore.reset"
        />
        <FateButton
          icon="arrow-right"
          variant="primary"
          size="M"
          aria-label="Timer fortsetzen"
          title="Weiter"
          @click="timerStore.continueTimer"
        />
      </template>
    </div>
  </section>
</template>

<style scoped>
.timer-pill {
  position: fixed;
  right: 0.65rem;
  top: calc(56px + 0.35rem);
  z-index: 1105;
  border: 1px solid color-mix(in srgb, var(--fate-blue) 70%, var(--fate-border));
  border-radius: 999px;
  background: var(--fate-white);
  color: var(--fate-blue);
  font-variant-numeric: tabular-nums;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 0.38rem 0.65rem;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.3);
  cursor: pointer;
  transition: all 0.15s ease;
}

[data-theme='dark'] {
  .timer-pill {
    border-color: var(--fate-text);
  }

  .timer-pill,
  .timer-pill--overtime {
    color: var(--fate-text);
  }
}

.timer-pill:hover {
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.4);
}

.timer-pill:active {
  transform: scale(0.98);
}

.timer-pill--overtime {
  background: var(--fate-red);
  border-color: color-mix(in srgb, var(--fate-red) 72%, var(--fate-border));
  color: var(--fate-white);
}

.fate-timer {
  width: min(100%, 18.5rem);
  border: 1px solid var(--fate-border);
  border-radius: 12px;
  background: var(--fate-white);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.timer-close-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: -0.15rem;
}

.timer-close-row :deep(.fate-btn) {
  --btn-size: 20px;
}

.timer-value {
  margin: 0;
  font-variant-numeric: tabular-nums;
  font-size: 2.2rem;
  line-height: 1;
  font-weight: 800;
  color: var(--fate-heading);
  text-align: center;
  letter-spacing: 0.01em;
}

.timer-value.overtime {
  color: var(--fate-red);
}

.timer-add-row {
  display: flex;
  gap: 0.4rem;
}

.timer-add-row :deep(.fate-btn) {
  flex: 1;
  justify-content: center;
  font-size: 0.9rem;
  height: 28px;
}

.timer-control-row {
  display: flex;
  gap: 0.45rem;
  justify-content: flex-end;
}

.timer-control-row :deep(.fate-btn) {
  --btn-size: 36px;
}

@media (max-width: 600px) {
  .timer-pill {
    right: 0.85rem;
    left: auto;
    top: auto;
    bottom: calc(56px + 0.35rem);
  }
}
</style>
