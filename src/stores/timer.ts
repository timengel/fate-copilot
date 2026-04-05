import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const useTimerStore = defineStore('timer', () => {
  const remainingSeconds = ref(0);
  const isRunning = ref(false);
  const hasStarted = ref(false);
  const isPopoverOpen = ref(false);
  const overtimeFlashToken = ref(0);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const formattedTime = computed(() => {
    const absSeconds = Math.abs(remainingSeconds.value);
    const minutes = Math.floor(absSeconds / 60);
    const seconds = absSeconds % 60;
    const sign = remainingSeconds.value < 0 ? '-' : '';
    return `${sign}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  const canStart = computed(
    () => remainingSeconds.value > 0 && !isRunning.value && !hasStarted.value,
  );

  const isPaused = computed(() => hasStarted.value && !isRunning.value);
  const isOvertime = computed(() => remainingSeconds.value < 0);

  function clearTimerInterval() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function tick() {
    const previousSeconds = remainingSeconds.value;
    remainingSeconds.value -= 1;

    if (previousSeconds >= 0 && remainingSeconds.value < 0) {
      overtimeFlashToken.value += 1;
    }
  }

  function beginInterval() {
    clearTimerInterval();
    intervalId = setInterval(() => {
      tick();
    }, 1000);
  }

  function addMinutes(minutes: number) {
    remainingSeconds.value += minutes * 60;
  }

  function start() {
    if (!canStart.value) return;
    hasStarted.value = true;
    isRunning.value = true;
    beginInterval();
  }

  function pause() {
    if (!isRunning.value) return;
    isRunning.value = false;
    clearTimerInterval();
  }

  function continueTimer() {
    if (!isPaused.value) return;
    isRunning.value = true;
    beginInterval();
  }

  function reset() {
    isRunning.value = false;
    hasStarted.value = false;
    remainingSeconds.value = 0;
    clearTimerInterval();
  }

  function openPopover() {
    isPopoverOpen.value = true;
  }

  function closePopover() {
    isPopoverOpen.value = false;
  }

  function togglePopover() {
    isPopoverOpen.value = !isPopoverOpen.value;
  }

  return {
    remainingSeconds,
    isRunning,
    hasStarted,
    isPopoverOpen,
    overtimeFlashToken,
    formattedTime,
    canStart,
    isPaused,
    isOvertime,
    addMinutes,
    start,
    pause,
    continueTimer,
    reset,
    openPopover,
    closePopover,
    togglePopover,
    clearTimerInterval,
  };
});
