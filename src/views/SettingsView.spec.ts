import { render, fireEvent, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import SettingsView from './SettingsView.vue';
import { useGMModeStore } from '../stores/gmMode';
import { useCharactersStore } from '../stores/characters';

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
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }] });
    return render(SettingsView, {
      global: {
        plugins: [pinia, router],
        stubs: {
          ImportExportBar: true,
          FateHeader: { template: '<div />' },
        },
      },
    });
  }

  function getToggleInRow(container: HTMLElement, rowLabel: string) {
    const label = screen.getByText(rowLabel);
    const row = label.closest('.settings-row');
    expect(row).toBeTruthy();
    return row!.querySelector('.fate-toggle') as HTMLElement;
  }

  describe('GM-Modus toggle', () => {
    it('is off by default', () => {
      const { container } = setup();
      const toggle = getToggleInRow(container, 'GM-Modus');
      const track = toggle.querySelector('.toggle-track')!;
      expect(track.classList.contains('toggle-track--on')).toBe(false);
    });

    it('clicking the toggle sets isGMMode to true in the store', async () => {
      const { container } = setup();
      const gmModeStore = useGMModeStore();
      await fireEvent.click(getToggleInRow(container, 'GM-Modus'));
      expect(gmModeStore.isGMMode).toBe(true);
    });

    it('clicking the toggle again sets isGMMode back to false', async () => {
      useGMModeStore().isGMMode = true;
      const { container } = setup();
      const gmModeStore = useGMModeStore();
      await fireEvent.click(getToggleInRow(container, 'GM-Modus'));
      expect(gmModeStore.isGMMode).toBe(false);
    });
  });

  describe('GM-Modus toggle visibility', () => {
    it('toggle is off by default', () => {
      const { container } = setup();
      const toggle = getToggleInRow(container, 'Sichtbarkeit des GM-Modus-Toggle');
      const track = toggle.querySelector('.toggle-track')!;
      expect(track.classList.contains('toggle-track--on')).toBe(false);
    });

    it('reflects true when the store value is already true', () => {
      useGMModeStore().showGMToggle = true;
      const { container } = setup();
      const toggle = getToggleInRow(container, 'Sichtbarkeit des GM-Modus-Toggle');
      const track = toggle.querySelector('.toggle-track')!;
      expect(track.classList.contains('toggle-track--on')).toBe(true);
    });

    it('clicking the toggle sets showGMToggle to true in the store', async () => {
      const { container } = setup();
      const gmModeStore = useGMModeStore();
      await fireEvent.click(getToggleInRow(container, 'Sichtbarkeit des GM-Modus-Toggle'));
      expect(gmModeStore.showGMToggle).toBe(true);
    });

    it('clicking the toggle again sets showGMToggle back to false', async () => {
      useGMModeStore().showGMToggle = true;
      const { container } = setup();
      const gmModeStore = useGMModeStore();
      await fireEvent.click(getToggleInRow(container, 'Sichtbarkeit des GM-Modus-Toggle'));
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
      expect(screen.queryByText('Wirklich alle Daten löschen?')).toBeNull();
    });

    it('clicking "Zurücksetzen" shows the confirm dialog', async () => {
      setup();
      await fireEvent.click(screen.getByText('Zurücksetzen'));
      expect(screen.getByText('Wirklich alle Daten löschen?')).toBeTruthy();
    });

    it('clicking "Abbrechen" closes the dialog without clearing storage', async () => {
      localStorage.setItem('test-key', 'test-value');
      setup();
      await fireEvent.click(screen.getByText('Zurücksetzen'));
      await fireEvent.click(screen.getByText('Abbrechen'));
      expect(screen.queryByText('Wirklich alle Daten löschen?')).toBeNull();
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });

    it('clicking "Bestätigen" clears localStorage and sessionStorage', async () => {
      const localClear = vi.spyOn(localStorage, 'clear');
      const sessionClear = vi.spyOn(sessionStorage, 'clear');

      setup();
      await fireEvent.click(screen.getByText('Zurücksetzen'));
      await fireEvent.click(screen.getByText('Bestätigen'));

      expect(localClear).toHaveBeenCalledOnce();
      expect(sessionClear).toHaveBeenCalledOnce();
    });

    it('clicking "Bestätigen" resets characters store', async () => {
      const charactersStore = useCharactersStore();
      charactersStore.characters.push({ id: '1', name: 'Test', type: 'sc', description: '', highConcept: '', trouble: '', aspects: [], skills: [], extras: '', stunts: [], refresh: 3, fatePoints: 3, stressPhysical: [], stressMental: [], consequences: [], notes: '' });

      setup();
      await fireEvent.click(screen.getByText('Zurücksetzen'));
      await fireEvent.click(screen.getByText('Bestätigen'));

      expect(charactersStore.characters).toHaveLength(0);
    });

    it('clicking "Bestätigen" resets GM mode', async () => {
      const gmModeStore = useGMModeStore();
      gmModeStore.isGMMode = true;
      gmModeStore.showGMToggle = true;

      setup();
      await fireEvent.click(screen.getByText('Zurücksetzen'));
      await fireEvent.click(screen.getByText('Bestätigen'));

      expect(gmModeStore.isGMMode).toBe(false);
      expect(gmModeStore.showGMToggle).toBe(false);
    });

    it('clicking "Bestätigen" closes the dialog', async () => {
      setup();
      await fireEvent.click(screen.getByText('Zurücksetzen'));
      await fireEvent.click(screen.getByText('Bestätigen'));
      expect(screen.queryByText('Wirklich alle Daten löschen?')).toBeNull();
    });
  });
});
