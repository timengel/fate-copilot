import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';

// vi.mock factories are hoisted before variable declarations, so we use
// vi.hoisted() to create a stable object that exists before the factory runs.
// The factory then replaces setPrefersDark with the real setter once it has
// access to Vue's ref.
const mock = vi.hoisted(() => ({ setPrefersDark: (_v: boolean) => {} }));

vi.mock('@vueuse/core', async (importOriginal) => {
  const { ref } = await import('vue');
  const isDarkRef = ref(false);
  mock.setPrefersDark = (v: boolean) => {
    isDarkRef.value = v;
  };
  const actual = await importOriginal<typeof import('@vueuse/core')>();
  return {
    ...actual,
    usePreferredDark: () => isDarkRef,
  };
});

import { useThemeStore } from './theme';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    mock.setPrefersDark(false);
    document.documentElement.removeAttribute('data-theme');
    setActivePinia(createPinia());
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  // ── Default state ────────────────────────────────────────────────────────

  it('mode defaults to system', () => {
    const store = useThemeStore();
    expect(store.mode).toBe('system');
  });

  // ── isDark computed ──────────────────────────────────────────────────────

  it('isDark is false when mode is light', () => {
    const store = useThemeStore();
    store.mode = 'light';
    expect(store.isDark).toBe(false);
  });

  it('isDark is true when mode is dark', () => {
    const store = useThemeStore();
    store.mode = 'dark';
    expect(store.isDark).toBe(true);
  });

  it('isDark is false when mode is system and system prefers light', () => {
    mock.setPrefersDark(false);
    const store = useThemeStore();
    expect(store.isDark).toBe(false);
  });

  it('isDark is true when mode is system and system prefers dark', () => {
    mock.setPrefersDark(true);
    const store = useThemeStore();
    expect(store.isDark).toBe(true);
  });

  it('isDark stays true when mode is dark regardless of system preference', () => {
    mock.setPrefersDark(false);
    const store = useThemeStore();
    store.mode = 'dark';
    expect(store.isDark).toBe(true);
  });

  it('isDark stays false when mode is light regardless of system preference', () => {
    mock.setPrefersDark(true);
    const store = useThemeStore();
    store.mode = 'light';
    expect(store.isDark).toBe(false);
  });

  it('isDark reacts to system preference change while in system mode', async () => {
    const store = useThemeStore();
    expect(store.isDark).toBe(false);
    mock.setPrefersDark(true);
    await nextTick();
    expect(store.isDark).toBe(true);
  });

  it('isDark does not react to system preference change in light mode', async () => {
    const store = useThemeStore();
    store.mode = 'light';
    mock.setPrefersDark(true);
    await nextTick();
    expect(store.isDark).toBe(false);
  });

  it('isDark does not react to system preference change in dark mode', async () => {
    const store = useThemeStore();
    store.mode = 'dark';
    mock.setPrefersDark(false);
    await nextTick();
    expect(store.isDark).toBe(true);
  });

  // ── data-theme attribute ─────────────────────────────────────────────────

  it('sets data-theme="light" immediately on init when mode is system and prefers light', () => {
    useThemeStore();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('sets data-theme="dark" immediately on init when mode is dark', () => {
    localStorage.setItem('fcp-theme', 'dark');
    useThemeStore();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('sets data-theme="dark" immediately on init when mode is system and system prefers dark', () => {
    mock.setPrefersDark(true);
    useThemeStore();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('updates data-theme to "dark" when mode changes to dark', async () => {
    const store = useThemeStore();
    store.mode = 'dark';
    await nextTick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('updates data-theme to "light" when mode changes to light', async () => {
    localStorage.setItem('fcp-theme', 'dark');
    const store = useThemeStore();
    store.mode = 'light';
    await nextTick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('updates data-theme when system preference changes in system mode', async () => {
    useThemeStore();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    mock.setPrefersDark(true);
    await nextTick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  // ── localStorage persistence ─────────────────────────────────────────────

  it('persists mode changes to localStorage', async () => {
    const store = useThemeStore();
    store.mode = 'dark';
    await nextTick();
    expect(localStorage.getItem('fcp-theme')).toBe('dark');
  });

  it('reads persisted mode from localStorage on init', () => {
    localStorage.setItem('fcp-theme', 'light');
    const store = useThemeStore();
    expect(store.mode).toBe('light');
  });

  it('persists dark mode to localStorage key fcp-theme', async () => {
    const store = useThemeStore();
    store.mode = 'dark';
    await nextTick();
    expect(localStorage.getItem('fcp-theme')).toBe('dark');
    store.mode = 'system';
    await nextTick();
    expect(localStorage.getItem('fcp-theme')).toBe('system');
  });
});
