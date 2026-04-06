import { fireEvent, render, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import FateTimer from './FateTimer.vue';
import { useTimerStore } from '../../stores/timer';

describe('FateTimer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    const timerStore = useTimerStore();
    timerStore.clearTimerInterval();
    timerStore.reset();
    timerStore.closePopover();
    vi.useRealTimers();
  });

  function renderTimer(openPopover = false) {
    const timerStore = useTimerStore();
    if (openPopover) {
      timerStore.openPopover();
    }
    return render(FateTimer);
  }

  it('adds minutes with increment buttons', async () => {
    renderTimer(true);

    await fireEvent.click(screen.getByRole('button', { name: '+1' }));
    await fireEvent.click(screen.getByRole('button', { name: '+5' }));
    await fireEvent.click(screen.getByRole('button', { name: '+10' }));

    expect(screen.getByText('16:00')).toBeTruthy();
  });

  it('disables start when timer is at zero', () => {
    renderTimer(true);

    expect(screen.getByRole('button', { name: 'Timer starten' }).hasAttribute('disabled')).toBe(true);
  });

  it('shows pause button while running after start', async () => {
    renderTimer(true);

    await fireEvent.click(screen.getByRole('button', { name: '+1' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Timer starten' }));

    expect(screen.getByRole('button', { name: 'Timer pausieren' })).toBeTruthy();
  });

  it('shows reset and continue buttons when paused', async () => {
    renderTimer(true);

    await fireEvent.click(screen.getByRole('button', { name: '+1' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Timer starten' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Timer pausieren' }));

    expect(screen.getByRole('button', { name: 'Timer zurücksetzen' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Timer fortsetzen' })).toBeTruthy();
  });

  it('continues countdown from paused value', async () => {
    renderTimer(true);

    await fireEvent.click(screen.getByRole('button', { name: '+1' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Timer starten' }));
    await vi.advanceTimersByTimeAsync(2000);
    await fireEvent.click(screen.getByRole('button', { name: 'Timer pausieren' }));

    expect(screen.getByText('00:58')).toBeTruthy();

    await fireEvent.click(screen.getByRole('button', { name: 'Timer fortsetzen' }));
    await vi.advanceTimersByTimeAsync(1000);

    expect(screen.getByText('00:57')).toBeTruthy();
  });

  it('resets to idle zero state', async () => {
    renderTimer(true);

    await fireEvent.click(screen.getByRole('button', { name: '+5' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Timer starten' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Timer pausieren' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Timer zurücksetzen' }));

    expect(screen.getByText('00:00')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Timer starten' })).toBeTruthy();
  });

  it('shows reset before start when time is set and resets without starting', async () => {
    renderTimer(true);

    await fireEvent.click(screen.getByRole('button', { name: '+5' }));
    expect(screen.getByRole('button', { name: 'Timer zurücksetzen' })).toBeTruthy();

    await fireEvent.click(screen.getByRole('button', { name: 'Timer zurücksetzen' }));
    expect(screen.getByText('00:00')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Timer zurücksetzen' })).toBeNull();
  });

  it('continues into negative time after reaching zero', async () => {
    renderTimer(true);

    await fireEvent.click(screen.getByRole('button', { name: '+1' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Timer starten' }));
    await vi.advanceTimersByTimeAsync(61000);

    expect(screen.getByText('-00:01')).toBeTruthy();
  });

  it('shows pill when timer is running and popover is closed', async () => {
    renderTimer();
    const timerStore = useTimerStore();
    timerStore.addMinutes(1);
    timerStore.start();

    await nextTick();

    // Should show pill (teleported to body)
    expect(screen.getByRole('button', { name: 'Timer öffnen' })).toBeTruthy();
  });

  it('shows drag handle icon on the left side of the pill', async () => {
    renderTimer();
    const timerStore = useTimerStore();
    timerStore.addMinutes(1);
    timerStore.start();

    await nextTick();

    expect(screen.getByTestId('timer-pill-drag-handle')).toBeTruthy();
  });

  it('hides pill when timer is not running', () => {
    renderTimer();

    // Should not show pill
    expect(screen.queryByRole('button', { name: 'Timer öffnen' })).toBeNull();
  });

  it('shows menu when popover is open', async () => {
    renderTimer(true);

    expect(screen.getByRole('button', { name: 'Timer schließen' })).toBeTruthy();
  });

  it('hides menu when popover is closed', () => {
    renderTimer();

    expect(screen.queryByRole('button', { name: 'Timer schließen' })).toBeNull();
  });

  it('applies danger style to pill when in overtime', async () => {
    renderTimer();
    const timerStore = useTimerStore();
    timerStore.remainingSeconds = -4;
    timerStore.hasStarted = true;
    timerStore.isRunning = true;

    await vi.runAllTimersAsync();

    const pill = screen.getByRole('button', { name: 'Timer öffnen' });
    expect(pill.classList.contains('timer-pill--overtime')).toBe(true);
  });

  it('opens popover when pill is clicked', async () => {
    renderTimer();
    const timerStore = useTimerStore();
    timerStore.addMinutes(1);
    timerStore.start();

    await nextTick();

    expect(timerStore.isPopoverOpen).toBe(false);

    const pill = screen.getByRole('button', { name: 'Timer öffnen' });
    await fireEvent.click(pill);

    expect(timerStore.isPopoverOpen).toBe(true);
  });

  it('moves pill position when dragging the handle', async () => {
    renderTimer();
    const timerStore = useTimerStore();
    timerStore.addMinutes(1);
    timerStore.start();

    await nextTick();

    const pill = screen.getByRole('button', { name: 'Timer öffnen' });
    const handle = screen.getByTestId('timer-pill-drag-handle');
    const initialLeft = pill.style.left;
    const initialTop = pill.style.top;

    await fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100, clientY: 80 });
    await fireEvent.pointerMove(window, { pointerId: 1, clientX: 260, clientY: 220 });
    await fireEvent.pointerUp(window, { pointerId: 1, clientX: 260, clientY: 220 });

    expect(pill.style.left).not.toBe(initialLeft);
    expect(pill.style.top).not.toBe(initialTop);
  });

  it('keeps dragged pill inside viewport bounds', async () => {
    renderTimer();
    const timerStore = useTimerStore();
    timerStore.addMinutes(1);
    timerStore.start();

    await nextTick();

    const pill = screen.getByRole('button', { name: 'Timer öffnen' });
    const handle = screen.getByTestId('timer-pill-drag-handle');

    await fireEvent.pointerDown(handle, { pointerId: 2, button: 0, clientX: 10, clientY: 10 });
    await fireEvent.pointerMove(window, { pointerId: 2, clientX: -500, clientY: -500 });
    await fireEvent.pointerUp(window, { pointerId: 2, clientX: -500, clientY: -500 });

    expect(Number.parseFloat(pill.style.left)).toBeGreaterThanOrEqual(0);
    expect(Number.parseFloat(pill.style.top)).toBeGreaterThanOrEqual(0);
  });

  it('resets to default placement when component remounts', async () => {
    const first = renderTimer();
    const timerStore = useTimerStore();
    timerStore.addMinutes(1);
    timerStore.start();

    await nextTick();

    const firstPill = screen.getByRole('button', { name: 'Timer öffnen' });
    const handle = screen.getByTestId('timer-pill-drag-handle');

    await fireEvent.pointerDown(handle, { pointerId: 3, button: 0, clientX: 20, clientY: 20 });
    await fireEvent.pointerMove(window, { pointerId: 3, clientX: 5, clientY: 5 });
    await fireEvent.pointerUp(window, { pointerId: 3, clientX: 5, clientY: 5 });

    const draggedLeft = firstPill.style.left;
    const draggedTop = firstPill.style.top;

    first.unmount();
    timerStore.closePopover();
    timerStore.reset();
    timerStore.addMinutes(1);
    timerStore.start();

    renderTimer();
    await nextTick();

    const remountedPill = screen.getByRole('button', { name: 'Timer öffnen' });
    expect(remountedPill.style.left).not.toBe(draggedLeft);
    expect(remountedPill.style.top).not.toBe(draggedTop);
  });
});
