<script setup lang="ts">
import FateButton from './FateButton.vue';
import { useTimerStore } from '../../stores/timer';

withDefaults(
  defineProps<{
    showCloseButton?: boolean;
  }>(),
  {
    showCloseButton: true,
  },
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'stop'): void;
}>();

const timerStore = useTimerStore();

function handleStopClick() {
  timerStore.stop();
  emit('stop');
}
</script>

<template>
  <section class="fate-timer" aria-label="Fate Timer">
    <div v-if="showCloseButton" class="timer-close-row">
      Timer
      <FateButton
        icon="close"
        variant="danger-outline"
        size="S"
        aria-label="Timer schließen"
        title="Schließen"
        @click="$emit('close')"
      />
    </div>

    <p class="timer-value" :class="{ overtime: timerStore.isOvertime }">{{ timerStore.formattedTime }}</p>

    <div class="timer-add-row">
      <FateButton variant="add" size="S" title="+1 Minute" @click="timerStore.addMinutes(1)">+1</FateButton>
      <FateButton variant="add" size="S" title="+5 Minuten" @click="timerStore.addMinutes(5)">+5</FateButton>
      <FateButton variant="add" size="S" title="+10 Minuten" @click="timerStore.addMinutes(10)">+10</FateButton>
    </div>

    <div class="timer-control-row">
      <template v-if="!timerStore.hasStarted">
        <FateButton
          icon="reset"
          variant="secondary"
          size="M"
          aria-label="Timer zurücksetzen"
          title="Reset"
          :disabled="!(timerStore.remainingSeconds > 0)"
          @click="timerStore.reset"
        />
        <FateButton
          icon="play"
          variant="primary"
          size="M"
          aria-label="Timer starten"
          title="Start"
          :disabled="!timerStore.canStart"
          @click="timerStore.start"
        />
      </template>
      <template v-else-if="timerStore.isRunning">
        <FateButton
          icon="pause"
          variant="secondary"
          size="M"
          aria-label="Timer pausieren"
          title="Pause"
          @click="timerStore.pause"
        />
        <FateButton
          icon="stop"
          variant="danger-outline"
          size="M"
          aria-label="Timer stoppen"
          title="Stop"
          @click="handleStopClick"
        />
      </template>
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
.fate-timer {
  width: min(100%, 12.5rem);
  border: 1px solid var(--fate-border);
  border-radius: 12px;
  background: var(--fate-white);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2);
  padding: 0.85rem 1rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timer-close-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -0.15rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fate-text);
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
  letter-spacing: 0.05em;
  margin: 0.5rem 0 0.8rem 0;
}

.timer-value.overtime {
  color: var(--fate-red);
}

.timer-add-row {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
}

.timer-add-row :deep(.fate-btn) {
  --btn-size: 40px;
  min-width: var(--btn-size);
  height: var(--btn-size);
  padding: 0 0.35rem;
  justify-content: center;
  font-size: 0.95rem;
}

.timer-control-row {
  display: flex;
  gap: 0.45rem;
  justify-content: center;
}

.timer-control-row :deep(.fate-btn) {
  --btn-size: 40px;
}
</style>
