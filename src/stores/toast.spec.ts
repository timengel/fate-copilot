import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useToastStore } from './toast';

describe('useToastStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  it('show sets message, type, and visible', () => {
    const store = useToastStore();
    store.show('Gespeichert');
    expect(store.message).toBe('Gespeichert');
    expect(store.type).toBe('success');
    expect(store.visible).toBe(true);
  });

  it('uses success as the default type', () => {
    const store = useToastStore();
    store.show('Standard');
    expect(store.type).toBe('success');
  });

  it('respects a custom error type', () => {
    const store = useToastStore();
    store.show('Fehler', 2500, 'error');
    expect(store.type).toBe('error');
  });

  it('auto-hides after the given duration', () => {
    const store = useToastStore();
    store.show('Kurz', 500);
    vi.advanceTimersByTime(499);
    expect(store.visible).toBe(true);
    vi.advanceTimersByTime(1);
    expect(store.visible).toBe(false);
  });

  it('replaces the previous message immediately when show is called again', () => {
    const store = useToastStore();
    store.show('Alt', 2500);
    store.show('Neu', 2500);
    expect(store.message).toBe('Neu');
    expect(store.visible).toBe(true);
  });

  it('clears the old timer when show is called again', () => {
    const store = useToastStore();
    store.show('Alt', 1000);
    vi.advanceTimersByTime(900);
    store.show('Neu', 1000);
    vi.advanceTimersByTime(100);
    expect(store.visible).toBe(true);
    vi.advanceTimersByTime(899);
    expect(store.visible).toBe(true);
    vi.advanceTimersByTime(1);
    expect(store.visible).toBe(false);
  });
});
