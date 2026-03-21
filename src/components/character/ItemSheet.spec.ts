import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import ItemSheet from './ItemSheet.vue';
import { useGMModeStore } from '../../stores/gmMode';
import type { Item } from '../../types';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    type: 'item',
    name: 'Altes Schwert',
    description: '',
    aspects: [],
    stunts: [],
    extras: '',
    stressPhysical: [],
    stressMental: [],
    redDice: 0,
    blueDice: 0,
    archived: false,
    hidden: false,
    notes: '',
    ...overrides,
  } as Item;
}

function renderForm(item?: Item, extraProps: Record<string, unknown> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  return render(ItemSheet, {
    props: { item: item ?? makeItem(), mode: 'edit', isNew: true, ...extraProps },
    global: { plugins: [pinia] },
  });
}

function renderView(item?: Item, extraProps: Record<string, unknown> = {}, isGMMode = false) {
  const pinia = createPinia();
  setActivePinia(pinia);
  useGMModeStore().isGMMode = isGMMode;
  return render(ItemSheet, {
    props: { item: item ?? makeItem(), mode: 'view', ...extraProps },
    global: { plugins: [pinia] },
  });
}

describe('ItemSheet', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('view mode', () => {
    it('hides the description row when description is empty', () => {
      renderView(makeItem({ description: '' }));
      expect(screen.queryByText('Beschreibung')).toBeNull();
    });

    it('hides the sheet behind the GM-only hidden state for non-GM users', () => {
      renderView(makeItem({ hidden: true }), {}, false);
      expect(screen.getByText('Details sind im GM-Modus sichtbar.')).toBeTruthy();
      expect(screen.queryByText('ALLGEMEINES')).toBeNull();
    });

    it('still shows hidden items for GM users', () => {
      renderView(makeItem({ hidden: true, description: 'Geheimes Artefakt' }), {}, true);
      expect(screen.getByText('ALLGEMEINES')).toBeTruthy();
      expect(screen.getByText('Geheimes Artefakt')).toBeTruthy();
    });

    it('renders archived and hidden badges in the name bar for GM users', () => {
      renderView(makeItem({ archived: true, hidden: true }), {}, true);
      expect(screen.getByText('ARCHIVIERT')).toBeTruthy();
      expect(screen.getByText('VERSTECKT')).toBeTruthy();
    });

    it('honors the sections prop in view mode', () => {
      renderView(
        makeItem({
          description: 'Beschreibung',
          aspects: ['A1'],
          extras: 'Extra',
          stunts: [{ name: 'Stunt', description: 'Text' }],
          stressPhysical: [{ value: 1, checked: false }],
          gmNotes: 'Nur GM',
          redDice: 1,
          blueDice: 1,
        }),
        {
          sections: {
            general: false,
            aspects: false,
            extras: false,
            stunts: false,
            stress: false,
            gmNotes: false,
            dice: false,
          },
        },
        true,
      );

      expect(screen.getByText('ALLGEMEINES').closest('section')?.getAttribute('style')).toContain(
        'display: none',
      );
      expect(screen.queryByText('ASPEKTE')).toBeNull();
      expect(screen.queryByText('EXTRAS')).toBeNull();
      expect(screen.queryByText('STUNTS')).toBeNull();
      expect(screen.queryByText('STRESS')).toBeNull();
      expect(screen.queryByText('GM OPTIONS')).toBeNull();
      expect(screen.queryByText('ROTE & BLAUE WÜRFEL')).toBeNull();
    });
  });

  describe('edit mode', () => {
    it('adds and removes physical and mental stress boxes', async () => {
      const onSave = vi.fn();
      const item = makeItem({
        stressPhysical: [{ value: 1, checked: false }],
        stressMental: [{ value: 1, checked: false }],
      });
      const { container } = renderForm(item, { onSave });
      const buttons = container.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');

      await fireEvent.click(buttons[1]!);
      await fireEvent.click(buttons[3]!);
      await fireEvent.click(buttons[0]!);
      await fireEvent.click(buttons[2]!);
      await fireEvent.click(screen.getByText('Speichern'));

      const saved = onSave.mock.calls[0]![0] as Item;
      expect(saved.stressPhysical).toHaveLength(1);
      expect(saved.stressMental).toHaveLength(1);
      expect(saved.stressPhysical[0]!.value).toBe(1);
      expect(saved.stressMental[0]!.value).toBe(1);
    });

    it('updates red and blue dice via the dice tracks', async () => {
      const onSave = vi.fn();
      const { container } = renderForm(makeItem(), { onSave });
      const diceButtons = container.querySelectorAll<HTMLButtonElement>('.die');

      await fireEvent.click(diceButtons[1]!);
      await fireEvent.click(diceButtons[6]!);
      await fireEvent.click(screen.getByText('Speichern'));

      const saved = onSave.mock.calls[0]![0] as Item;
      expect(saved.redDice).toBe(2);
      expect(saved.blueDice).toBe(3);
    });

    it('adds and removes aspects', async () => {
      const { container } = renderForm(makeItem({ aspects: ['Erster'] }));

      await fireEvent.click(screen.getByText('+ Aspekt'));
      expect(container.querySelectorAll('.aspect-row')).toHaveLength(2);

      await fireEvent.click(container.querySelector('.aspect-row button')!);
      expect(container.querySelectorAll('.aspect-row')).toHaveLength(1);
    });

    it('emits a deep-cloned updated item on save', async () => {
      const onSave = vi.fn();
      const item = makeItem({
        name: 'Original',
        stressPhysical: [{ value: 1, checked: false }],
        aspects: ['Scharf'],
      });
      const { container } = renderForm(item, { onSave });

      await fireEvent.update(
        container.querySelector('input[placeholder="Name des Gegenstands"]')!,
        'Neuer Name',
      );
      await fireEvent.click(screen.getByText('Speichern'));

      const saved = onSave.mock.calls[0]![0] as Item;
      expect(saved.name).toBe('Neuer Name');
      expect(saved).not.toBe(item);
      expect(saved.stressPhysical).not.toBe(item.stressPhysical);
      expect(saved.aspects).not.toBe(item.aspects);
    });

    it('disables save when unchanged for an existing item and enables it after edits', async () => {
      const item = makeItem({ name: 'Bestehend' });
      const { container } = render(ItemSheet, {
        props: { item, mode: 'edit', isNew: false },
        global: { plugins: [createPinia()] },
      });

      expect((screen.getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(
        true,
      );

      await fireEvent.update(
        container.querySelector('input[placeholder="Name des Gegenstands"]')!,
        'Geaendert',
      );

      expect((screen.getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(
        false,
      );
    });
  });
});
