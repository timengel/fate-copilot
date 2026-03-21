import { render, fireEvent, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import SettingsView from './SettingsView.vue';
import { useGMModeStore } from '../stores/gmMode';

describe('SettingsView', () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function setup() {
    return render(SettingsView, {
      global: {
        plugins: [pinia],
        stubs: {
          ImportExportBar: true,
          FateHeader: { template: '<div />' },
        },
      },
    });
  }

  describe('GM-Modus toggle visibility', () => {
    it('toggle is off by default', () => {
      const { container } = setup();
      const track = container.querySelector('.toggle-track')!;
      expect(track.classList.contains('toggle-track--on')).toBe(false);
    });

    it('reflects true when the store value is already true', () => {
      useGMModeStore().showGMToggle = true;
      const { container } = setup();
      const track = container.querySelector('.toggle-track')!;
      expect(track.classList.contains('toggle-track--on')).toBe(true);
    });

    it('clicking the toggle sets showGMToggle to true in the store', async () => {
      const { container } = setup();
      const gmModeStore = useGMModeStore();
      await fireEvent.click(container.querySelector('.fate-toggle')!);
      expect(gmModeStore.showGMToggle).toBe(true);
    });

    it('clicking the toggle again sets showGMToggle back to false', async () => {
      useGMModeStore().showGMToggle = true;
      const { container } = setup();
      const gmModeStore = useGMModeStore();
      await fireEvent.click(container.querySelector('.fate-toggle')!);
      expect(gmModeStore.showGMToggle).toBe(false);
    });
  });

  describe('clear all data', () => {
    it('"Zurücksetzen" button is present', () => {
      setup();
      expect(screen.getByText('Zurücksetzen')).toBeTruthy();
    });

    it('confirm dialog is not shown initially', () => {
      setup();
      expect(screen.queryByText('Alle Daten löschen')).toBeNull();
    });

    it('clicking "Zurücksetzen" shows the confirm dialog', async () => {
      setup();
      await fireEvent.click(screen.getByText('Zurücksetzen'));
      expect(screen.getByText('Alle Daten löschen')).toBeTruthy();
    });

    it('clicking "Abbrechen" closes the dialog without clearing storage', async () => {
      localStorage.setItem('test-key', 'test-value');
      setup();
      await fireEvent.click(screen.getByText('Zurücksetzen'));
      await fireEvent.click(screen.getByText('Abbrechen'));
      expect(screen.queryByText('Alle Daten löschen')).toBeNull();
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });

    it('clicking "Bestätigen" clears localStorage, sessionStorage, and reloads', async () => {
      const reloadMock = vi.fn();
      vi.stubGlobal('location', { reload: reloadMock });
      const localClear = vi.spyOn(localStorage, 'clear');
      const sessionClear = vi.spyOn(sessionStorage, 'clear');

      setup();
      await fireEvent.click(screen.getByText('Zurücksetzen'));
      await fireEvent.click(screen.getByText('Bestätigen'));

      expect(localClear).toHaveBeenCalledOnce();
      expect(sessionClear).toHaveBeenCalledOnce();
      expect(reloadMock).toHaveBeenCalledOnce();
    });

    it('clicking "Bestätigen" closes the dialog before reloading', async () => {
      vi.stubGlobal('location', { reload: vi.fn() });

      setup();
      await fireEvent.click(screen.getByText('Zurücksetzen'));
      await fireEvent.click(screen.getByText('Bestätigen'));
      expect(screen.queryByText('Alle Daten löschen')).toBeNull();
    });
  });
});
