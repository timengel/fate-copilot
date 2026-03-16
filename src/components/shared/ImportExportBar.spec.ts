import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import { setActivePinia, createPinia } from 'pinia';
import ImportExportBar from './ImportExportBar.vue';
import type { AppData } from '../../types';

const mockExportJSON = vi.fn();
const mockImportJSON = vi.fn();
const mockApplyImport = vi.fn();

vi.mock('../../composables/useImportExport', () => ({
  useImportExport: () => ({
    exportJSON: mockExportJSON,
    importJSON: mockImportJSON,
    applyImport: mockApplyImport,
  }),
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
});

describe('ImportExportBar', () => {
  it('renders an Exportieren button', () => {
    render(ImportExportBar);
    expect(screen.getByText('↓ Exportieren')).toBeTruthy();
  });

  it('renders an Importieren button', () => {
    render(ImportExportBar);
    expect(screen.getByText('↑ Importieren')).toBeTruthy();
  });

  it('calls exportJSON when Exportieren is clicked', async () => {
    render(ImportExportBar);
    await fireEvent.click(screen.getByText('↓ Exportieren'));
    expect(mockExportJSON).toHaveBeenCalledOnce();
  });

  it('does not show a ConfirmDialog initially', () => {
    const { container } = render(ImportExportBar);
    expect(container.querySelector('.dialog-overlay')).toBeNull();
  });

  it('shows ConfirmDialog after a valid file is selected', async () => {
    mockImportJSON.mockResolvedValueOnce(validAppData);
    const { container } = render(ImportExportBar);

    const fileInput = container.querySelector('input[type="file"]')!;
    const file = new File([JSON.stringify(validAppData)], 'export.json', {
      type: 'application/json',
    });
    await fireEvent.change(fileInput, { target: { files: [file] } });
    await new Promise((r) => setTimeout(r, 0));

    expect(container.querySelector('.dialog-overlay')).toBeTruthy();
  });

  it('shows import-error when importJSON rejects', async () => {
    mockImportJSON.mockRejectedValueOnce(new Error('Ungültige Datei'));
    const { container } = render(ImportExportBar);

    const fileInput = container.querySelector('input[type="file"]')!;
    const file = new File(['bad'], 'bad.json', { type: 'application/json' });
    await fireEvent.change(fileInput, { target: { files: [file] } });
    await new Promise((r) => setTimeout(r, 0));

    expect(container.querySelector('.import-error')?.textContent).toBe('Ungültige Datei');
  });

  it('calls applyImport and hides dialog on confirm', async () => {
    mockImportJSON.mockResolvedValueOnce(validAppData);
    const { container } = render(ImportExportBar);

    const fileInput = container.querySelector('input[type="file"]')!;
    const file = new File([JSON.stringify(validAppData)], 'export.json', {
      type: 'application/json',
    });
    await fireEvent.change(fileInput, { target: { files: [file] } });
    await new Promise((r) => setTimeout(r, 0));

    await fireEvent.click(screen.getByText('Bestätigen'));
    expect(mockApplyImport).toHaveBeenCalledWith(validAppData);
    expect(container.querySelector('.dialog-overlay')).toBeNull();
  });

  it('hides dialog on cancel without calling applyImport', async () => {
    mockImportJSON.mockResolvedValueOnce(validAppData);
    const { container } = render(ImportExportBar);

    const fileInput = container.querySelector('input[type="file"]')!;
    const file = new File([JSON.stringify(validAppData)], 'export.json', {
      type: 'application/json',
    });
    await fireEvent.change(fileInput, { target: { files: [file] } });
    await new Promise((r) => setTimeout(r, 0));

    await fireEvent.click(screen.getByText('Abbrechen'));
    expect(mockApplyImport).not.toHaveBeenCalled();
    expect(container.querySelector('.dialog-overlay')).toBeNull();
  });
});
