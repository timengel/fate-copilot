import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimerStore } from './timer';

describe('timer store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    const store = useTimerStore();
    store.clearTimerInterval();
    vi.useRealTimers();
  });

  it('supports add, start, pause, continue and reset flow', async () => {
    const store = useTimerStore();

    store.addMinutes(1);
    expect(store.remainingSeconds).toBe(60);
    expect(store.canStart).toBe(true);

    store.start();
    expect(store.isRunning).toBe(true);

    await vi.advanceTimersByTimeAsync(2000);
    expect(store.remainingSeconds).toBe(58);

    store.pause();
    expect(store.isRunning).toBe(false);
    expect(store.isPaused).toBe(true);

    store.continueTimer();
    expect(store.isRunning).toBe(true);

    await vi.advanceTimersByTimeAsync(1000);
    expect(store.remainingSeconds).toBe(57);

    store.reset();
    expect(store.remainingSeconds).toBe(0);
    expect(store.isRunning).toBe(false);
    expect(store.hasStarted).toBe(false);
  });

  it('increments overtime flash token exactly when crossing below zero', async () => {
    const store = useTimerStore();

    store.addMinutes(1);
    store.start();

    await vi.advanceTimersByTimeAsync(60000);
    expect(store.remainingSeconds).toBe(0);
    expect(store.overtimeFlashToken).toBe(0);

    await vi.advanceTimersByTimeAsync(1000);
    expect(store.remainingSeconds).toBe(-1);
    expect(store.overtimeFlashToken).toBe(1);

    await vi.advanceTimersByTimeAsync(3000);
    expect(store.remainingSeconds).toBe(-4);
    expect(store.overtimeFlashToken).toBe(1);
  });

  it('opens, closes and toggles popover state', () => {
    const store = useTimerStore();

    expect(store.isPopoverOpen).toBe(false);

    store.openPopover();
    expect(store.isPopoverOpen).toBe(true);

    store.togglePopover();
    expect(store.isPopoverOpen).toBe(false);

    store.togglePopover();
    expect(store.isPopoverOpen).toBe(true);

    store.closePopover();
    expect(store.isPopoverOpen).toBe(false);
  });
});
