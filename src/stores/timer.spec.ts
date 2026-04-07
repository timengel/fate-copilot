import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimerStore } from './timer';
import { useToastStore } from './toast';

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

  it('stop resets timer and increments stop signal', async () => {
    const store = useTimerStore();
    store.addMinutes(1);
    store.start();
    await vi.advanceTimersByTimeAsync(1000);

    expect(store.stopSignal).toBe(0);

    store.stop();
    expect(store.remainingSeconds).toBe(0);
    expect(store.isRunning).toBe(false);
    expect(store.hasStarted).toBe(false);
    expect(store.stopSignal).toBe(1);
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

  it('shows "Timer abgelaufen!" when countdown reaches zero', async () => {
    const store = useTimerStore();
    const toastStore = useToastStore();
    const toastSpy = vi.spyOn(toastStore, 'show');

    store.addMinutes(1);
    store.start();

    await vi.advanceTimersByTimeAsync(60000);

    expect(store.remainingSeconds).toBe(0);
    expect(toastSpy).toHaveBeenCalledWith('Timer abgelaufen!');
    expect(toastStore.message).toBe('Timer abgelaufen!');
    expect(toastStore.visible).toBe(true);
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

  it('caps added time at 99:59', () => {
    const store = useTimerStore();

    store.addMinutes(200);

    expect(store.remainingSeconds).toBe(5999);
    expect(store.formattedTime).toBe('99:59');
  });

  it('keeps cap when adding minutes near maximum', () => {
    const store = useTimerStore();
    store.remainingSeconds = 6000;

    store.addMinutes(5);

    expect(store.remainingSeconds).toBe(5999);
    expect(store.formattedTime).toBe('99:59');
  });
});
