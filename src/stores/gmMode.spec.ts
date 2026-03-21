import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGMModeStore } from './gmMode';

describe('useGMModeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('isGMMode defaults to false', () => {
    expect(useGMModeStore().isGMMode).toBe(false);
  });

  it('showGMToggle defaults to false', () => {
    expect(useGMModeStore().showGMToggle).toBe(false);
  });

  it('toggle flips isGMMode on', () => {
    const store = useGMModeStore();
    store.toggle();
    expect(store.isGMMode).toBe(true);
  });

  it('toggle flips isGMMode off again', () => {
    const store = useGMModeStore();
    store.isGMMode = true;
    store.toggle();
    expect(store.isGMMode).toBe(false);
  });

  it('reset sets isGMMode to false', () => {
    const store = useGMModeStore();
    store.isGMMode = true;
    store.reset();
    expect(store.isGMMode).toBe(false);
  });

  it('reset sets showGMToggle to false', () => {
    const store = useGMModeStore();
    store.showGMToggle = true;
    store.reset();
    expect(store.showGMToggle).toBe(false);
  });

  it('reset clears both isGMMode and showGMToggle together', () => {
    const store = useGMModeStore();
    store.isGMMode = true;
    store.showGMToggle = true;
    store.reset();
    expect(store.isGMMode).toBe(false);
    expect(store.showGMToggle).toBe(false);
  });
});
