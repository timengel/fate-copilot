import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ItemSheet from './ItemSheet.vue';
import { useGMModeStore } from '../../stores/gmMode';
import type { Item } from '../../types';
import { isItemFormEqual } from './itemSheetFormState';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    type: 'item',
    name: 'Altes Schwert',
    description: '',
    aspects: [],
    stunts: [],
    extras: '',
    stressTracks: [],
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

    it('hides MODIFIERS section when all modifier values are 0', () => {
      renderView(makeItem({ modifiers: [{ label: 'Test', value: 0 }] }));
      expect(screen.queryByText('MODIFIERS')).toBeNull();
    });

    it('shows MODIFIERS section when a modifier value > 0', () => {
      renderView(makeItem({ modifiers: [{ label: 'Purer Schaden', value: 2 }] }));
      expect(screen.getByText('MODIFIERS')).toBeTruthy();
    });

    it('shows MODIFIERS section when a modifier value < 0', () => {
      renderView(makeItem({ modifiers: [{ label: 'Deflektion', value: -3 }] }));
      expect(screen.getByText('MODIFIERS')).toBeTruthy();
    });

    it('hides MODIFIERS section when sections.modifiers is false', () => {
      renderView(makeItem({ modifiers: [{ label: 'Purer Schaden', value: 2 }] }), { sections: { modifiers: false } });
      expect(screen.queryByText('MODIFIERS')).toBeNull();
    });

    it('renders both dice sections as siblings under the same parent when both have values', () => {
      const { container } = renderView(makeItem({ redDice: 2, modifiers: [{ label: 'Purer Schaden', value: 1 }] }));
      const redBlue = container.querySelector('.red-blue-dice-section');
      const pureDmg = container.querySelector('.modifiers-section');
      expect(redBlue).toBeTruthy();
      expect(pureDmg).toBeTruthy();
      expect(redBlue!.parentElement).toBe(pureDmg!.parentElement);
    });

    it('red-blue and modifiers sections are not nested inside each other', () => {
      const { container } = renderView(makeItem({ redDice: 1, modifiers: [{ label: 'Deflektion', value: 2 }] }));
      const redBlue = container.querySelector('.red-blue-dice-section');
      const pureDmg = container.querySelector('.modifiers-section');
      expect(redBlue!.contains(pureDmg)).toBe(false);
      expect(pureDmg!.contains(redBlue)).toBe(false);
    });

    it('lets the red-blue dice section span the full row when modifiers are hidden', () => {
      const { container } = renderView(makeItem({ redDice: 2, blueDice: 1, modifiers: [{ label: 'Test', value: 0 }] }));
      expect(container.querySelector('.red-blue-dice-section')?.classList.contains('span-full')).toBe(true);
      expect(container.querySelector('.modifiers-section')).toBeNull();
    });

    it('lets the modifiers section span the full row when dice are hidden', () => {
      const { container } = renderView(makeItem({ modifiers: [{ label: 'Purer Schaden', value: 2 }] }));
      expect(container.querySelector('.red-blue-dice-section')).toBeNull();
      expect(container.querySelector('.modifiers-section')?.classList.contains('span-full')).toBe(true);
    });

    it('keeps dice and modifiers split when both sections are visible', () => {
      const { container } = renderView(makeItem({ redDice: 1, modifiers: [{ label: 'Deflektion', value: 2 }] }));
      expect(container.querySelector('.red-blue-dice-section')?.classList.contains('span-full')).toBe(false);
      expect(container.querySelector('.modifiers-section')?.classList.contains('span-full')).toBe(false);
    });

    it('honors the sections prop in view mode', () => {
      renderView(
        makeItem({
          description: 'Beschreibung',
          aspects: ['A1'],
          extras: 'Extra',
          stunts: [{ name: 'Stunt', description: 'Text' }],
          stressTracks: [{ label: 'Körperlich', boxes: [{ value: 1, checked: false }] }],
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
    it('adds a stunt row even when the item has no stunts array', async () => {
      const { container } = renderForm({ ...makeItem(), stunts: undefined } as Item);

      expect(container.querySelectorAll('.stunt-edit-row')).toHaveLength(0);
      await fireEvent.click(screen.getByText('+ Stunt hinzufügen'));
      expect(container.querySelectorAll('.stunt-edit-row')).toHaveLength(1);
    });

    it('adds and removes physical and mental stress boxes', async () => {
      const onSave = vi.fn();
      const item = makeItem({
        stressTracks: [
          { label: 'Körperlich', boxes: [{ value: 1, checked: false }] },
          { label: 'Geistig', boxes: [{ value: 1, checked: false }] },
        ],
      });
      const { container } = renderForm(item, { onSave });
      const buttons = container.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');

      await fireEvent.click(buttons[1]!);
      await fireEvent.click(buttons[4]!);
      await fireEvent.click(buttons[0]!);
      await fireEvent.click(buttons[3]!);
      await fireEvent.click(screen.getByText('Speichern'));

      const saved = onSave.mock.calls[0]![0] as Item;
      expect(saved.stressTracks?.[0]?.boxes).toHaveLength(1);
      expect(saved.stressTracks?.[1]?.boxes).toHaveLength(1);
      expect(saved.stressTracks?.[0]?.boxes[0]!.value).toBe(1);
      expect(saved.stressTracks?.[1]?.boxes[0]!.value).toBe(1);
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
        stressTracks: [{ label: 'Körperlich', boxes: [{ value: 1, checked: false }] }],
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
      expect(saved.stressTracks).not.toBe(item.stressTracks);
      expect(saved.aspects).not.toBe(item.aspects);
    });

    it('adds, renames, and removes stress tracks', async () => {
      const onSave = vi.fn();
      const { container } = renderForm(makeItem(), { onSave });

      await fireEvent.click(screen.getByText('+ Stress-Track hinzufügen'));

      const labelInput = container.querySelectorAll<HTMLInputElement>('.stress-label-input')[0];
      await fireEvent.update(labelInput!, 'Armor');

      const rowButtons = container.querySelectorAll('.stress-track-row')[0]!.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
      await fireEvent.click(rowButtons[1]!);
      await fireEvent.click(screen.getByText('Speichern'));

      const saved = onSave.mock.calls[0]![0] as Item;
      expect(saved.stressTracks?.[0]?.label).toBe('Armor');
      expect(saved.stressTracks?.[0]?.boxes[0]!.value).toBe(1);
    });

    it('removes a stress track', async () => {
      const onSave = vi.fn();
      const { container } = renderForm(
        makeItem({
          stressTracks: [{ label: 'Armor', boxes: [{ value: 1, checked: false }] }],
        }),
        { onSave },
      );

      const rowButtons = container.querySelector('.stress-track-row')!.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
      await fireEvent.click(rowButtons[2]!);
      await fireEvent.click(screen.getByText('Speichern'));

      const saved = onSave.mock.calls[0]![0] as Item;
      expect(saved.stressTracks).toEqual([]);
    });

    it('updates modifier values via the icon counters', async () => {
      const onSave = vi.fn();
      const { container } = renderForm(makeItem({ modifiers: [{ label: 'Purer Schaden', value: 1 }, { label: 'Deflektion', value: 2 }] }), { onSave });

      const plusButtons = Array.from(
        container.querySelectorAll<HTMLButtonElement>('.icon-counter .icon-controls button[aria-label="Erhöhen"]'),
      );
      await fireEvent.click(plusButtons[0]!); // 1 → 2
      await fireEvent.click(plusButtons[1]!); // 2 → 3
      await fireEvent.click(screen.getByText('Speichern'));

      const saved = onSave.mock.calls[0]![0] as Item;
      expect(saved.modifiers![0]!.value).toBe(2);
      expect(saved.modifiers![1]!.value).toBe(3);
    });

    describe('consequences', () => {
      it('hides KONSEQUENZEN section when consequences array is empty', () => {
        renderView(makeItem({ consequences: [] }));
        expect(screen.queryByText('KONSEQUENZEN')).toBeNull();
      });

      it('hides KONSEQUENZEN section when all consequence values are empty strings', () => {
        renderView(makeItem({ consequences: [{ severity: 2, label: 'mild', value: '' }] }));
        expect(screen.queryByText('KONSEQUENZEN')).toBeNull();
      });

      it('shows KONSEQUENZEN section when at least one consequence has a value', () => {
        renderView(makeItem({ consequences: [{ severity: 2, label: 'mild', value: 'Gebrochen' }] }));
        expect(screen.getByText('KONSEQUENZEN')).toBeTruthy();
      });

      it('hides KONSEQUENZEN section when sections.consequences is false', () => {
        renderView(
          makeItem({ consequences: [{ severity: 2, label: 'mild', value: 'Verletzt' }] }),
          { sections: { consequences: false } },
        );
        expect(screen.queryByText('KONSEQUENZEN')).toBeNull();
      });

      it('shows KONSEQUENZEN section in edit mode even when consequences is empty', () => {
        renderForm(makeItem({ consequences: [] }));
        expect(screen.getByText('KONSEQUENZEN')).toBeTruthy();
      });

      it('add consequence slot button adds a slot of the given severity', async () => {
        const { container } = renderForm(makeItem({ consequences: [] }));
        const addBtns = container.querySelectorAll<HTMLButtonElement>('.consequence-config-btn');
        // One button per severity: Leicht(0), Mittel(1), Schwer(2), Extrem(3)
        await fireEvent.click(addBtns[0]!);
        expect(container.querySelectorAll('.consequence-row')).toHaveLength(1);
      });

      it('save emits item with correct consequences array', async () => {
        const onSave = vi.fn();
        const consequences = [{ severity: 2 as const, label: 'mild' as const, value: 'Leichte Wunde' }];
        renderForm(makeItem({ consequences }), { onSave });
        await fireEvent.click(screen.getByText('Speichern'));
        const saved = onSave.mock.calls[0]![0] as Item;
        expect(saved.consequences).toHaveLength(1);
        expect(saved.consequences![0]!.value).toBe('Leichte Wunde');
      });
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

    it('does not crash with malformed legacy arrays in existing-item mode', () => {
      render(ItemSheet, {
        props: {
          item: {
            ...makeItem(),
            stunts: undefined,
            aspects: undefined,
          } as unknown as Item,
          mode: 'edit',
          isNew: false,
        },
        global: { plugins: [createPinia()] },
      });

      expect(screen.getByText('Speichern')).toBeTruthy();
    });

    it('resets local edits and dirty state when item prop reference changes', async () => {
      const item = makeItem({ id: 'item-1', name: 'Alt' });
      const { container, rerender } = render(ItemSheet, {
        props: { item, mode: 'edit', isNew: false },
        global: { plugins: [createPinia()] },
      });

      await fireEvent.update(
        container.querySelector('input[placeholder="Name des Gegenstands"]')!,
        'Unsaved',
      );
      expect((screen.getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(
        false,
      );

      await rerender({ item: makeItem({ id: 'item-2', name: 'Neu' }), mode: 'edit', isNew: false });
      expect(
        (container.querySelector('input[placeholder="Name des Gegenstands"]') as HTMLInputElement)
          .value,
      ).toBe('Neu');
      expect((screen.getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(
        true,
      );
    });

    it('resets nested local edits when item prop reference changes', async () => {
      const item = makeItem({
        id: 'item-1',
        stunts: [{ name: 'Old Stunt', description: 'Old Desc' }],
      });
      const { container, rerender } = render(ItemSheet, {
        props: { item, mode: 'edit', isNew: false },
        global: { plugins: [createPinia()] },
      });

      await fireEvent.update(
        container.querySelector<HTMLInputElement>('.stunt-name-input')!,
        'Unsaved Stunt',
      );

      await rerender({
        item: makeItem({
          id: 'item-2',
          stunts: [{ name: 'Fresh Stunt', description: 'Fresh Desc' }],
        }),
        mode: 'edit',
        isNew: false,
      });

      expect(container.querySelector<HTMLInputElement>('.stunt-name-input')!.value).toBe(
        'Fresh Stunt',
      );
    });

    it('disables save again after saving nested edits', async () => {
      const item = makeItem({
        modifiers: [{ label: 'Purer Schaden', value: 1 }],
      });
      const onSave = vi.fn();
      const { container } = render(ItemSheet, {
        props: { item, mode: 'edit', isNew: false, onSave },
        global: { plugins: [createPinia()] },
      });

      const plusButton = container.querySelector<HTMLButtonElement>(
        '.icon-counter .icon-controls button[aria-label="Erhöhen"]',
      );
      await fireEvent.click(plusButton!);
      expect((screen.getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(
        false,
      );

      await fireEvent.click(screen.getByText('Speichern'));
      expect(onSave).toHaveBeenCalledOnce();
      expect((screen.getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(
        true,
      );
    });

    it('keeps stunt input values stable when removing a sibling row', async () => {
      const item = makeItem({
        stunts: [
          { name: 'First', description: 'A' },
          { name: 'Second', description: 'B' },
        ],
      });
      const { container } = render(ItemSheet, {
        props: { item, mode: 'edit', isNew: false },
        global: { plugins: [createPinia()] },
      });

      const nameInputs = container.querySelectorAll<HTMLInputElement>('.stunt-name-input');
      await fireEvent.update(nameInputs[1]!, 'Second Edited');

      const removeButtons = container.querySelectorAll<HTMLButtonElement>('.stunt-edit-row .fate-btn');
      await fireEvent.click(removeButtons[0]!);

      const remainingInput = container.querySelector<HTMLInputElement>('.stunt-name-input')!;
      expect(remainingInput.value).toBe('Second Edited');
    });

    it('keeps aspect input values stable when removing a sibling aspect row', async () => {
      const item = makeItem({
        aspects: ['First', 'Second'],
      });
      const { container } = render(ItemSheet, {
        props: { item, mode: 'edit', isNew: false },
        global: { plugins: [createPinia()] },
      });

      const aspectInputs = container.querySelectorAll<HTMLInputElement>('.aspect-input');
      await fireEvent.update(aspectInputs[1]!, 'Second Edited');

      const removeButtons = container.querySelectorAll<HTMLButtonElement>('.aspect-row .fate-btn');
      await fireEvent.click(removeButtons[0]!);

      const remainingInput = container.querySelector<HTMLInputElement>('.aspect-input')!;
      expect(remainingInput.value).toBe('Second Edited');
    });

    it('keeps stress track label input stable when removing a sibling track', async () => {
      const item = makeItem({
        stressTracks: [
          { label: 'Track A', boxes: [{ value: 1, checked: false }] },
          { label: 'Track B', boxes: [{ value: 1, checked: false }] },
        ],
      });
      const { container } = render(ItemSheet, {
        props: { item, mode: 'edit', isNew: false },
        global: { plugins: [createPinia()] },
      });

      const labelInputs = container.querySelectorAll<HTMLInputElement>('.stress-label-input');
      await fireEvent.update(labelInputs[1]!, 'Track B Edited');

      const removeButtons = container.querySelectorAll<HTMLButtonElement>(
        '.stress-track-row .stress-ctrl-btn:nth-child(3)',
      );
      await fireEvent.click(removeButtons[0]!);

      const remainingLabelInput = container.querySelector<HTMLInputElement>('.stress-label-input')!;
      expect(remainingLabelInput.value).toBe('Track B Edited');
    });

    it('exposes save() to parent refs', async () => {
      const wrapper = mount(ItemSheet, {
        props: {
          item: makeItem({ id: 'item-expose' }),
          mode: 'edit',
          isNew: false,
        },
        global: {
          plugins: [createPinia()],
        },
      });

      const exposed = wrapper.vm as unknown as { save?: () => void };
      expect(typeof exposed.save).toBe('function');

      await wrapper.find('input[placeholder="Name des Gegenstands"]').setValue('Changed');
      exposed.save?.();
      expect(wrapper.emitted('save')).toBeTruthy();
    });
  });
});

describe('Item comparator policy', () => {
  it('ignores deprecated pureDamage/deflection fields', () => {
    const base = makeItem({ pureDamage: 1, deflection: 2 } as Partial<Item>);
    const changed = makeItem({ pureDamage: 9, deflection: -3 } as Partial<Item>);
    expect(isItemFormEqual(base, changed)).toBe(true);
  });

  it('tracks compared fields (e.g. hidden and gmNotes) as dirty-relevant', () => {
    const base = makeItem({ hidden: false, gmNotes: 'A' });
    expect(isItemFormEqual(base, { ...base, hidden: true })).toBe(false);
    expect(isItemFormEqual(base, { ...base, gmNotes: 'B' })).toBe(false);
  });
});
