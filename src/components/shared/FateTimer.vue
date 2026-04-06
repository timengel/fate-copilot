<script setup lang="ts">
import { Teleport, computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import FateButton from './FateButton.vue';
import FateIcon from './FateIcon.vue';
import { useTimerStore } from '../../stores/timer';

defineEmits<{
  (e: 'close'): void;
}>();

const timerStore = useTimerStore();
const pillRef = ref<HTMLButtonElement | null>(null);
const pillPosition = ref<{ x: number; y: number } | null>(null);
const hasManualPosition = ref(false);
const isDragging = ref(false);
const showPill = computed(() => timerStore.isRunning && !timerStore.isPopoverOpen);
const pillInlineStyle = computed(() => {
  if (!pillPosition.value) return {};
  return {
    left: `${pillPosition.value.x}px`,
    top: `${pillPosition.value.y}px`,
    right: 'auto',
    bottom: 'auto',
    transform: 'none',
  };
});

const DRAG_THRESHOLD = 3;
let dragPointerId: number | null = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragStartPointerX = 0;
let dragStartPointerY = 0;
let dragDidMove = false;
let suppressNextPillClick = false;

function getRootRemPx() {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(value) ? value : 16;
}

function isMobileLayout() {
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(max-width: 600px)').matches;
  }
  return window.innerWidth <= 600;
}

function getPillSize() {
  const pillEl = pillRef.value;
  if (!pillEl) return { width: 0, height: 0 };
  const rect = pillEl.getBoundingClientRect();
  return {
    width: rect.width || pillEl.offsetWidth || 0,
    height: rect.height || pillEl.offsetHeight || 0,
  };
}

function clampPosition(x: number, y: number) {
  const { width, height } = getPillSize();
  const maxX = Math.max(0, window.innerWidth - width);
  const maxY = Math.max(0, window.innerHeight - height);

  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  };
}

function setDefaultPillPosition() {
  const rem = getRootRemPx();
  const marginX = 0.65 * rem;
  const desktopTop = 56 + 0.35 * rem;
  const mobileBottom = 0.85 * rem;
  const { width, height } = getPillSize();

  if (isMobileLayout()) {
    const x = (window.innerWidth - width) / 2;
    const y = window.innerHeight - height - mobileBottom;
    pillPosition.value = clampPosition(x, y);
    return;
  }

  const x = window.innerWidth - width - marginX;
  pillPosition.value = clampPosition(x, desktopTop);
}

function removeDragListeners() {
  window.removeEventListener('pointermove', handleDragMove);
  window.removeEventListener('pointerup', handleDragEnd);
  window.removeEventListener('pointercancel', handleDragEnd);
}

function handleDragStart(event: PointerEvent) {
  if (event.button !== 0) return;
  const pillEl = pillRef.value;
  if (!pillEl) return;

  event.preventDefault();
  event.stopPropagation();

  const rect = pillEl.getBoundingClientRect();
  if (!pillPosition.value) {
    pillPosition.value = clampPosition(rect.left, rect.top);
  }

  dragPointerId = event.pointerId;
  dragOffsetX = event.clientX - rect.left;
  dragOffsetY = event.clientY - rect.top;
  dragStartPointerX = event.clientX;
  dragStartPointerY = event.clientY;
  dragDidMove = false;
  isDragging.value = true;

  window.addEventListener('pointermove', handleDragMove);
  window.addEventListener('pointerup', handleDragEnd);
  window.addEventListener('pointercancel', handleDragEnd);
}

function handleDragMove(event: PointerEvent) {
  if (!isDragging.value || dragPointerId !== event.pointerId) return;

  const movedX = Math.abs(event.clientX - dragStartPointerX);
  const movedY = Math.abs(event.clientY - dragStartPointerY);
  if (movedX > DRAG_THRESHOLD || movedY > DRAG_THRESHOLD) {
    dragDidMove = true;
  }

  const nextX = event.clientX - dragOffsetX;
  const nextY = event.clientY - dragOffsetY;
  pillPosition.value = clampPosition(nextX, nextY);
  hasManualPosition.value = true;
}

function handleDragEnd(event: PointerEvent) {
  if (dragPointerId !== event.pointerId) return;
  removeDragListeners();
  isDragging.value = false;
  if (dragDidMove) {
    suppressNextPillClick = true;
  }
  dragPointerId = null;
}

function handlePillClick() {
  if (suppressNextPillClick) {
    suppressNextPillClick = false;
    return;
  }
  timerStore.openPopover();
}

function handleMenuClose() {
  timerStore.closePopover();
}

function handleWindowResize() {
  if (!showPill.value) return;
  if (!hasManualPosition.value) {
    setDefaultPillPosition();
    return;
  }

  const position = pillPosition.value;
  if (!position) return;
  pillPosition.value = clampPosition(position.x, position.y);
}

watch(showPill, async (isVisible) => {
  if (!isVisible) return;
  await nextTick();

  if (!hasManualPosition.value || !pillPosition.value) {
    setDefaultPillPosition();
    return;
  }

  pillPosition.value = clampPosition(pillPosition.value.x, pillPosition.value.y);
});

onMounted(async () => {
  window.addEventListener('resize', handleWindowResize);
  if (showPill.value) {
    await nextTick();
    setDefaultPillPosition();
  }
});

onBeforeUnmount(() => {
  removeDragListeners();
  window.removeEventListener('resize', handleWindowResize);
});
</script>

<template>
  <!-- Timer Pill (teleported outside popover so it always shows when running) -->
  <Teleport to="body">
    <button
      v-if="showPill"
      ref="pillRef"
      type="button"
      class="timer-pill"
      :class="{ 'timer-pill--overtime': timerStore.isOvertime, 'timer-pill--dragging': isDragging }"
      :style="pillInlineStyle"
      aria-label="Timer öffnen"
      title="Timer öffnen"
      @click="handlePillClick"
    >
      <span
        class="timer-pill__drag-handle"
        data-testid="timer-pill-drag-handle"
        title="Timer verschieben"
        @pointerdown="handleDragStart"
      >
        <FateIcon name="grip" :size="18" />
      </span>
      <span class="timer-pill__value">{{ timerStore.formattedTime }}</span>
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
  z-index: 1105;
  border: 1px solid color-mix(in srgb, var(--fate-blue) 70%, var(--fate-border));
  border-radius: 999px;
  background: var(--fate-white);
  color: var(--fate-blue);
  font-variant-numeric: tabular-nums;
  font-size: 0.96rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 0.4rem 0.8rem 0.4rem 0;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.3);
  cursor: pointer;
  transition: box-shadow 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
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

.timer-pill--dragging {
  transition: none;
}

.timer-pill--overtime {
  background: var(--fate-red);
  border-color: color-mix(in srgb, var(--fate-red) 72%, var(--fate-border));
  color: var(--fate-white);
}

.timer-pill__drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  width: 2.1rem;
  color: currentColor;
  cursor: grab;
  touch-action: none;
  border-right: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  padding: 0 0.5rem 0 0.55rem;
  margin-right: 0.15rem;
}

.timer-pill__drag-handle:active {
  cursor: grabbing;
}

.timer-pill__value {
  font-variant-numeric: tabular-nums;
  padding-left: 0.15rem;
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

</style>
