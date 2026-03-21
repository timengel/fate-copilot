import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import { setActivePinia, createPinia } from 'pinia';
import ImportExportBar from './ImportExportBar.vue';
import type { AppData } from '../../types';

const mockExportJSON = vi.fn();
const mockExportToClipboard = vi.fn();
const mockImportJSON = vi.fn();
const mockImportFromString = vi.fn();
const mockApplyImport = vi.fn();

vi.mock('../../composables/useImportExport', () => ({
  useImportExport: () => ({
    exportJSON: mockExportJSON,
    exportToClipboard: mockExportToClipboard,
    importJSON: mockImportJSON,
    importFromString: mockImportFromString,
    applyImport: mockApplyImport,
  }),
}));

const mockToastShow = vi.fn();
vi.mock('../../stores/toast', () => ({
  useToastStore: () => ({ show: mockToastShow }),
}));

const validAppData: AppData = {
  formatVersion: '1.1',
  exportDate: '2026-01-01T00:00:00.000Z',
  campaigns: [],
  characters: [],
  campaignCharacterAssignments: [],
};

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
  mockExportToClipboard.mockResolvedValue(undefined);
  mockImportFromString.mockReturnValue(validAppData);
});

describe('ImportExportBar', () => {
  describe('rendering', () => {
    it('renders Exportieren button', () => {
      render(ImportExportBar);
      expect(screen.getByText('Exportieren')).toBeTruthy();
    });

    it('renders Kopieren button', () => {
      render(ImportExportBar);
      expect(screen.getByText('Kopieren')).toBeTruthy();
    });

    it('renders two Importieren buttons', () => {
      render(ImportExportBar);
      expect(screen.getAllByText('Importieren')).toHaveLength(2);
    });

    it('always renders the JSON text textarea', () => {
      const { container } = render(ImportExportBar);
      expect(container.querySelector('textarea')).toBeTruthy();
    });

    it('does not show a ConfirmDialog initially', () => {
      const { container } = render(ImportExportBar);
      expect(container.querySelector('.dialog-overlay')).toBeNull();
    });

    it('does not show an error message initially', () => {
      const { container } = render(ImportExportBar);
      expect(container.querySelector('.import-error')).toBeNull();
    });
  });

  describe('JSON-Datei export', () => {
    it('calls exportJSON when Exportieren is clicked', async () => {
      render(ImportExportBar);
      await fireEvent.click(screen.getByText('Exportieren'));
      expect(mockExportJSON).toHaveBeenCalledOnce();
    });
  });

  describe('JSON-Text export (Kopieren)', () => {
    it('calls exportToClipboard when Kopieren is clicked', async () => {
      render(ImportExportBar);
      await fireEvent.click(screen.getByText('Kopieren'));
      expect(mockExportToClipboard).toHaveBeenCalledOnce();
    });

    it('shows success toast after successful copy', async () => {
      render(ImportExportBar);
      await fireEvent.click(screen.getByText('Kopieren'));
      await new Promise((r) => setTimeout(r, 0));
      expect(mockToastShow).toHaveBeenCalledWith('In die Zwischenablage kopiert!');
    });

    it('shows importError when exportToClipboard rejects', async () => {
      mockExportToClipboard.mockRejectedValueOnce(new Error('Kein Clipboard-Zugriff'));
      const { container } = render(ImportExportBar);
      await fireEvent.click(screen.getByText('Kopieren'));
      await new Promise((r) => setTimeout(r, 0));
      expect(container.querySelector('.import-error')?.textContent).toBe('Kein Clipboard-Zugriff');
    });

    it('does not show toast when copy fails', async () => {
      mockExportToClipboard.mockRejectedValueOnce(new Error('Fehler'));
      render(ImportExportBar);
      await fireEvent.click(screen.getByText('Kopieren'));
      await new Promise((r) => setTimeout(r, 0));
      expect(mockToastShow).not.toHaveBeenCalled();
    });
  });

  describe('JSON-Text import (textarea)', () => {
    function getTextImportButton() {
      // Text import button is first in DOM (JSON-Text card is above JSON-Datei card)
      return screen.getAllByText('Importieren')[0]!;
    }

    it('calls importFromString with the textarea content', async () => {
      const { container } = render(ImportExportBar);
      const jsonStr = JSON.stringify(validAppData);
      await fireEvent.update(container.querySelector('textarea')!, jsonStr);
      await fireEvent.click(getTextImportButton());
      expect(mockImportFromString).toHaveBeenCalledWith(jsonStr);
    });

    it('shows ConfirmDialog after valid JSON is submitted', async () => {
      const { container } = render(ImportExportBar);
      await fireEvent.update(container.querySelector('textarea')!, JSON.stringify(validAppData));
      await fireEvent.click(getTextImportButton());
      expect(container.querySelector('.dialog-overlay')).toBeTruthy();
    });

    it('clears textarea after valid JSON is submitted', async () => {
      const { container } = render(ImportExportBar);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      await fireEvent.update(textarea, JSON.stringify(validAppData));
      await fireEvent.click(getTextImportButton());
      expect(textarea.value).toBe('');
    });

    it('shows importError when importFromString throws', async () => {
      mockImportFromString.mockImplementationOnce(() => {
        throw new Error('Ungültiger JSON-String');
      });
      const { container } = render(ImportExportBar);
      await fireEvent.update(container.querySelector('textarea')!, 'not json');
      await fireEvent.click(getTextImportButton());
      expect(container.querySelector('.import-error')?.textContent).toBe('Ungültiger JSON-String');
    });

    it('does not show ConfirmDialog when importFromString throws', async () => {
      mockImportFromString.mockImplementationOnce(() => {
        throw new Error('bad');
      });
      const { container } = render(ImportExportBar);
      await fireEvent.update(container.querySelector('textarea')!, 'bad');
      await fireEvent.click(getTextImportButton());
      expect(container.querySelector('.dialog-overlay')).toBeNull();
    });

    it('calls applyImport with parsed data and hides dialog on confirm', async () => {
      const { container } = render(ImportExportBar);
      await fireEvent.update(container.querySelector('textarea')!, JSON.stringify(validAppData));
      await fireEvent.click(getTextImportButton());
      await fireEvent.click(screen.getByText('Bestätigen'));
      expect(mockApplyImport).toHaveBeenCalledWith(validAppData);
      expect(container.querySelector('.dialog-overlay')).toBeNull();
    });

    it('hides dialog and does not call applyImport on cancel', async () => {
      const { container } = render(ImportExportBar);
      await fireEvent.update(container.querySelector('textarea')!, JSON.stringify(validAppData));
      await fireEvent.click(getTextImportButton());
      await fireEvent.click(screen.getByText('Abbrechen'));
      expect(mockApplyImport).not.toHaveBeenCalled();
      expect(container.querySelector('.dialog-overlay')).toBeNull();
    });
  });

  describe('JSON-Datei import', () => {
    function selectFile(container: Element, content = JSON.stringify(validAppData)) {
      const fileInput = container.querySelector('input[type="file"]')!;
      const file = new File([content], 'export.json', { type: 'application/json' });
      return fireEvent.change(fileInput, { target: { files: [file] } });
    }

    it('shows ConfirmDialog after a valid file is selected', async () => {
      mockImportJSON.mockResolvedValueOnce(validAppData);
      const { container } = render(ImportExportBar);
      await selectFile(container);
      await new Promise((r) => setTimeout(r, 0));
      expect(container.querySelector('.dialog-overlay')).toBeTruthy();
    });

    it('shows importError when importJSON rejects', async () => {
      mockImportJSON.mockRejectedValueOnce(new Error('Ungültige Datei'));
      const { container } = render(ImportExportBar);
      await selectFile(container, 'bad');
      await new Promise((r) => setTimeout(r, 0));
      expect(container.querySelector('.import-error')?.textContent).toBe('Ungültige Datei');
    });

    it('calls applyImport and hides dialog on confirm', async () => {
      mockImportJSON.mockResolvedValueOnce(validAppData);
      const { container } = render(ImportExportBar);
      await selectFile(container);
      await new Promise((r) => setTimeout(r, 0));
      await fireEvent.click(screen.getByText('Bestätigen'));
      expect(mockApplyImport).toHaveBeenCalledWith(validAppData);
      expect(container.querySelector('.dialog-overlay')).toBeNull();
    });

    it('hides dialog and does not call applyImport on cancel', async () => {
      mockImportJSON.mockResolvedValueOnce(validAppData);
      const { container } = render(ImportExportBar);
      await selectFile(container);
      await new Promise((r) => setTimeout(r, 0));
      await fireEvent.click(screen.getByText('Abbrechen'));
      expect(mockApplyImport).not.toHaveBeenCalled();
      expect(container.querySelector('.dialog-overlay')).toBeNull();
    });
  });
});
