import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import PasteImportDialog from './PasteImportDialog.vue';

const validCharacterJson = JSON.stringify({ name: 'Alice', type: 'sc' });
const validItemJson = JSON.stringify({ name: 'Schwert', type: 'item' });

describe('PasteImportDialog', () => {
  describe('rendering', () => {
    it('shows "Charakter importieren" title for entity-type character', () => {
      render(PasteImportDialog, { props: { entityType: 'character' } });
      expect(screen.getByText('Charakter importieren')).toBeTruthy();
    });

    it('shows "Gegenstand importieren" title for entity-type item', () => {
      render(PasteImportDialog, { props: { entityType: 'item' } });
      expect(screen.getByText('Gegenstand importieren')).toBeTruthy();
    });

    it('renders a textarea', () => {
      const { container } = render(PasteImportDialog, { props: { entityType: 'character' } });
      expect(container.querySelector('textarea')).toBeTruthy();
    });

    it('renders "Importieren" and "Abbrechen" buttons', () => {
      render(PasteImportDialog, { props: { entityType: 'character' } });
      expect(screen.getByText('Importieren')).toBeTruthy();
      expect(screen.getByText('Abbrechen')).toBeTruthy();
    });

    it('"Importieren" button is disabled when textarea is empty', () => {
      const { container } = render(PasteImportDialog, { props: { entityType: 'character' } });
      const btn = container.querySelector('button[disabled]');
      expect(btn).toBeTruthy();
    });
  });

  describe('cancel', () => {
    it('emits cancel when "Abbrechen" is clicked', async () => {
      const onCancel = vi.fn();
      render(PasteImportDialog, { props: { entityType: 'character', onCancel } });
      await fireEvent.click(screen.getByText('Abbrechen'));
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it('emits cancel when the overlay backdrop is clicked', async () => {
      const onCancel = vi.fn();
      const { container } = render(PasteImportDialog, { props: { entityType: 'character', onCancel } });
      await fireEvent.click(container.querySelector('.dialog-overlay')!);
      expect(onCancel).toHaveBeenCalledOnce();
    });
  });

  describe('validation errors', () => {
    it('shows an error for invalid JSON', async () => {
      const { container } = render(PasteImportDialog, { props: { entityType: 'character' } });
      await fireEvent.update(container.querySelector('textarea')!, 'not json');
      await fireEvent.click(screen.getByText('Importieren'));
      expect(screen.getByText('Ungültiges JSON-Format.')).toBeTruthy();
    });

    it('shows an error when name is missing', async () => {
      const { container } = render(PasteImportDialog, { props: { entityType: 'character' } });
      await fireEvent.update(container.querySelector('textarea')!, JSON.stringify({ type: 'sc' }));
      await fireEvent.click(screen.getByText('Importieren'));
      expect(screen.getByText(/name/)).toBeTruthy();
    });

    it('shows an error when name is empty', async () => {
      const { container } = render(PasteImportDialog, { props: { entityType: 'character' } });
      await fireEvent.update(container.querySelector('textarea')!, JSON.stringify({ name: '' }));
      await fireEvent.click(screen.getByText('Importieren'));
      expect(screen.getByText(/name/)).toBeTruthy();
    });

    it('does not emit import when validation fails', async () => {
      const onImport = vi.fn();
      const { container } = render(PasteImportDialog, { props: { entityType: 'character', onImport } });
      await fireEvent.update(container.querySelector('textarea')!, 'bad json');
      await fireEvent.click(screen.getByText('Importieren'));
      expect(onImport).not.toHaveBeenCalled();
    });
  });

  describe('successful import', () => {
    it('emits import with parsed character on valid character JSON', async () => {
      const onImport = vi.fn();
      const { container } = render(PasteImportDialog, { props: { entityType: 'character', onImport } });
      await fireEvent.update(container.querySelector('textarea')!, validCharacterJson);
      await fireEvent.click(screen.getByText('Importieren'));
      expect(onImport).toHaveBeenCalledOnce();
      expect(onImport.mock.calls[0]![0].name).toBe('Alice');
    });

    it('emits import with parsed item on valid item JSON', async () => {
      const onImport = vi.fn();
      const { container } = render(PasteImportDialog, { props: { entityType: 'item', onImport } });
      await fireEvent.update(container.querySelector('textarea')!, validItemJson);
      await fireEvent.click(screen.getByText('Importieren'));
      expect(onImport).toHaveBeenCalledOnce();
      expect(onImport.mock.calls[0]![0].name).toBe('Schwert');
    });

    it('emitted character has a fresh id', async () => {
      const onImport = vi.fn();
      const { container } = render(PasteImportDialog, { props: { entityType: 'character', onImport } });
      await fireEvent.update(container.querySelector('textarea')!, JSON.stringify({ name: 'Bob', id: 'old-id' }));
      await fireEvent.click(screen.getByText('Importieren'));
      expect(onImport.mock.calls[0]![0].id).not.toBe('old-id');
    });

    it('emitted item has type "item" regardless of input', async () => {
      const onImport = vi.fn();
      const { container } = render(PasteImportDialog, { props: { entityType: 'item', onImport } });
      await fireEvent.update(container.querySelector('textarea')!, JSON.stringify({ name: 'Schild', type: 'wrong' }));
      await fireEvent.click(screen.getByText('Importieren'));
      expect(onImport.mock.calls[0]![0].type).toBe('item');
    });

    it('does not show an error on successful import', async () => {
      const { container } = render(PasteImportDialog, { props: { entityType: 'character' } });
      await fireEvent.update(container.querySelector('textarea')!, validCharacterJson);
      await fireEvent.click(screen.getByText('Importieren'));
      expect(container.querySelector('.error-message')).toBeNull();
    });
  });
});
