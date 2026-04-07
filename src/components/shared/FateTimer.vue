<script setup lang="ts">
import { Teleport, computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import FateIcon from './FateIcon.vue';
import FateTimerPanel from './FateTimerPanel.vue';
import { useTimerStore } from '../../stores/timer';

defineEmits<{
  (e: 'close'): void;
}>();

const timerStore = useTimerStore();
const pillRef = ref<HTMLButtonElement | null>(null);
const pillPosition = ref<{ x: number; y: number } | null>(null);
const hasManualPosition = ref(false);
const isDragging = ref(false);
const isOvertimeFlashActive = ref(false);
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
let overtimeFlashTimeoutId: ReturnType<typeof setTimeout> | null = null;

function getRootRemPx() {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(value) ? value : 16;
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
  const isSmallScreen = window.innerWidth <= 600;
  const bottomOffset = isSmallScreen ? 0.85 * rem : 2 * rem;
  const { width, height } = getPillSize();
  const x = (window.innerWidth - width) / 2;
  const y = window.innerHeight - height - bottomOffset;
  pillPosition.value = clampPosition(x, y);
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
  isDragging.value = true;

  window.addEventListener('pointermove', handleDragMove);
  window.addEventListener('pointerup', handleDragEnd);
  window.addEventListener('pointercancel', handleDragEnd);
}

function handleDragHandleClick(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function handleDragMove(event: PointerEvent) {
  if (!isDragging.value || dragPointerId !== event.pointerId) return;

  const movedX = Math.abs(event.clientX - dragStartPointerX);
  const movedY = Math.abs(event.clientY - dragStartPointerY);
  if (movedX <= DRAG_THRESHOLD && movedY <= DRAG_THRESHOLD) return;

  const nextX = event.clientX - dragOffsetX;
  const nextY = event.clientY - dragOffsetY;
  pillPosition.value = clampPosition(nextX, nextY);
  hasManualPosition.value = true;
}

function handleDragEnd(event: PointerEvent) {
  if (dragPointerId !== event.pointerId) return;
  removeDragListeners();
  isDragging.value = false;
  dragPointerId = null;
}

function handlePillClick() {
  timerStore.openPopover();
}

function handleMenuClose() {
  timerStore.closePopover();
}

function triggerOvertimeFlash() {
  isOvertimeFlashActive.value = true;
  if (overtimeFlashTimeoutId) {
    clearTimeout(overtimeFlashTimeoutId);
  }
  overtimeFlashTimeoutId = setTimeout(() => {
    isOvertimeFlashActive.value = false;
    overtimeFlashTimeoutId = null;
  }, 650);
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

watch(
  () => timerStore.overtimeFlashToken,
  (newToken, previousToken) => {
    if (!showPill.value) return;
    if (newToken > (previousToken ?? 0)) {
      triggerOvertimeFlash();
    }
  },
);

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
  if (overtimeFlashTimeoutId) {
    clearTimeout(overtimeFlashTimeoutId);
  }
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
      :class="{
        'timer-pill--overtime': timerStore.isOvertime,
        'timer-pill--dragging': isDragging,
        'timer-pill--flash': isOvertimeFlashActive,
      }"
      :style="pillInlineStyle"
      aria-label="Timer"
      title="Timer"
      @click="handlePillClick"
    >
      <span
        class="timer-pill__drag-handle"
        data-testid="timer-pill-drag-handle"
        title="Timer verschieben"
        @pointerdown="handleDragStart"
        @click="handleDragHandleClick"
      >
        <FateIcon name="grip" :size="18" />
      </span>
      <span class="timer-pill__open-hit">
        <span class="timer-pill__value">{{ timerStore.formattedTime }}</span>
      </span>
    </button>
  </Teleport>

  <FateTimerPanel v-if="timerStore.isPopoverOpen" @close="$emit('close'); handleMenuClose()" />
</template>

<style scoped>
.timer-pill {
  position: fixed;
  z-index: 1105;
  border: 1px solid var(--fate-blue);
  box-sizing: border-box;
  border-radius: 999px;
  background: var(--fate-white);
  color: var(--fate-blue);
  font-variant-numeric: tabular-nums;
  font-size: 0.96rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 0;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.3);
  cursor: pointer;
  transition: box-shadow 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0;
}

[data-theme='dark'] {
  .timer-pill {
    border: 1px solid var(--fate-text);
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

.timer-pill--flash {
  animation: timer-pill-overtime-flash 0.65s ease-out;
}

.timer-pill--overtime {
  background: var(--fate-red);
  border: none;
  color: var(--fate-white);
}

@keyframes timer-pill-overtime-flash {
  0%,
  100% {
    box-shadow:
      0 8px 22px rgba(15, 23, 42, 0.3),
      0 0 0 0 rgba(239, 68, 68, 0);
  }
  35% {
    box-shadow:
      0 10px 28px rgba(15, 23, 42, 0.42),
      0 0 0 8px rgba(239, 68, 68, 0.42);
  }
}

.timer-pill__drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: 2rem;
  color: currentColor;
  cursor: grab;
  touch-action: none;
  border-right: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  padding: 0 0.3rem 0 0.5rem;
  margin-right: 0;
}

.timer-pill__drag-handle:active {
  cursor: grabbing;
}

.timer-pill__open-hit {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  min-width: 4.2rem;
  padding: 0 0.8rem 0 0.45rem;
  border-radius: 0 999px 999px 0;
  transition: background-color 0.15s ease;
}

.timer-pill__open-hit:hover {
  background: color-mix(in srgb, var(--fate-blue) 14%, transparent);
}

.timer-pill--overtime .timer-pill__open-hit:hover {
  background: color-mix(in srgb, var(--fate-white) 20%, transparent);
}

.timer-pill__value {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

</style>
