import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useGMModeStore } from '../../stores/gmMode';
import { useItemsStore } from '../../stores/items';
import { useCharacterItemsStore } from '../../stores/characterItems';
import CharacterSheet from './CharacterSheet.vue';
import { createDefaultCharacter, createDefaultItem } from '../../composables/useCharacterDefaults';
import { useSkillsStore } from '../../stores/skills';
import type { Character, Consequence } from '../../types';
import { isCharacterFormEqual } from './characterSheetFormState';

const mockPush = vi.fn();

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');

  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
  };
});

function renderForm(character?: Character, extraProps: Record<string, unknown> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  return render(CharacterSheet, {
    props: {
      character: character ?? createDefaultCharacter(),
      mode: 'edit',
      isNew: true,
      ...extraProps,
    },
    global: {
      plugins: [pinia],
      stubs: { SkillPyramid: true },
    },
  });
}

function renderView(
  character?: Character,
  extraProps: Record<string, unknown> = {},
  isGMMode = false,
) {
  const pinia = createPinia();
  setActivePinia(pinia);
  useGMModeStore().isGMMode = isGMMode;
  return render(CharacterSheet, {
    props: { character: character ?? createDefaultCharacter(), mode: 'view', ...extraProps },
    global: {
      plugins: [pinia],
      stubs: { SkillPyramid: true },
    },
  });
}

describe('CharacterSheet (edit mode)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockPush.mockReset();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn();
    renderForm(undefined, { onCancel });
    await fireEvent.click(screen.getByText('Abbrechen'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onSave when the save button is clicked', async () => {
    const onSave = vi.fn();
    renderForm(undefined, { onSave });
    await fireEvent.click(screen.getByText('Speichern'));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('saves the current character data', async () => {
    const onSave = vi.fn();
    const char = { ...createDefaultCharacter(), name: 'Test Hero' };
    renderForm(char, { onSave });
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.name).toBe('Test Hero');
  });

  it('adds a stunt row when "+ Stunt hinzufügen" is clicked', async () => {
    const { container } = renderForm();
    expect(container.querySelectorAll('.stunt-edit-row')).toHaveLength(0);
    await fireEvent.click(screen.getByText('+ Stunt hinzufügen'));
    expect(container.querySelectorAll('.stunt-edit-row')).toHaveLength(1);
  });

  it('removes a stunt row when the stunt ✕ button is clicked', async () => {
    const { container } = renderForm();
    await fireEvent.click(screen.getByText('+ Stunt hinzufügen'));
    await fireEvent.click(screen.getByText('+ Stunt hinzufügen'));
    expect(container.querySelectorAll('.stunt-edit-row')).toHaveLength(2);
    await fireEvent.click(container.querySelector('.stunt-edit-row button')!);
    expect(container.querySelectorAll('.stunt-edit-row')).toHaveLength(1);
  });

  it('updates the name input when the character prop changes', async () => {
    const char = createDefaultCharacter();
    const { rerender, container } = renderForm(char);
    await rerender({ character: { ...char, name: 'Updated Name' }, mode: 'edit' });
    const nameInput = container.querySelector<HTMLInputElement>(
      'input[placeholder="Charaktername"]',
    )!;
    expect(nameInput.value).toBe('Updated Name');
  });

  // ─── Stress-Box-Verwaltung ────────────────────────────────────

  it('adds a physical stress box when + is clicked', async () => {
    const onSave = vi.fn();
    const char = {
      ...createDefaultCharacter(),
      stressTracks: [{ label: 'Körperlich', boxes: [{ value: 1, checked: false }] }],
    };
    const { container } = renderForm(char, { onSave });
    const btns = container.querySelectorAll<HTMLButtonElement>(
      '.stress-track-row .stress-ctrl-btn',
    );
    await fireEvent.click(btns[1]!);
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.stressTracks?.[0]?.boxes).toHaveLength(2);
    expect(saved.stressTracks?.[0]?.boxes[1]!.value).toBe(2);
  });

  it('new stress box gets value = last value + 1', async () => {
    const onSave = vi.fn();
    const char = {
      ...createDefaultCharacter(),
      stressTracks: [
        {
          label: 'Körperlich',
          boxes: [
            { value: 3, checked: false },
            { value: 5, checked: false },
          ],
        },
      ],
    };
    const { container } = renderForm(char, { onSave });
    const btns = container.querySelectorAll<HTMLButtonElement>(
      '.stress-track-row .stress-ctrl-btn',
    );
    await fireEvent.click(btns[1]!);
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.stressTracks?.[0]?.boxes[2]!.value).toBe(6);
  });

  it('adds stress box with value 1 when track is empty', async () => {
    const onSave = vi.fn();
    const char = {
      ...createDefaultCharacter(),
      stressTracks: [{ label: 'Körperlich', boxes: [] }],
    };
    const { container } = renderForm(char, { onSave });
    const btns = container.querySelectorAll<HTMLButtonElement>(
      '.stress-track-row .stress-ctrl-btn',
    );
    await fireEvent.click(btns[1]!);
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.stressTracks?.[0]?.boxes).toHaveLength(1);
    expect(saved.stressTracks?.[0]?.boxes[0]!.value).toBe(1);
  });

  it('removes the last physical stress box when − is clicked', async () => {
    const onSave = vi.fn();
    const char = {
      ...createDefaultCharacter(),
      stressTracks: [
        {
          label: 'Körperlich',
          boxes: [
            { value: 1, checked: false },
            { value: 2, checked: false },
          ],
        },
      ],
    };
    const { container } = renderForm(char, { onSave });
    const btns = container.querySelectorAll<HTMLButtonElement>(
      '.stress-track-row .stress-ctrl-btn',
    );
    await fireEvent.click(btns[0]!);
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.stressTracks?.[0]?.boxes).toHaveLength(1);
    expect(saved.stressTracks?.[0]?.boxes[0]!.value).toBe(1);
  });

  it('− stress button is disabled when track is empty', () => {
    const char = {
      ...createDefaultCharacter(),
      stressTracks: [{ label: 'Körperlich', boxes: [] }],
    };
    const { container } = renderForm(char);
    const btns = container.querySelectorAll<HTMLButtonElement>(
      '.stress-track-row .stress-ctrl-btn',
    );
    expect(btns[0]!.disabled).toBe(true);
  });

  // ─── Konsequenz-Slot-Verwaltung (NSC) ─────────────────────────

  it('NSC: adds a consequence slot of the given severity', async () => {
    const onSave = vi.fn();
    const char = createDefaultCharacter('nsc'); // starts with 1 mild consequence
    const { container } = renderForm(char, { onSave });
    // consequence-config-btn order: Leicht(0), Mittel(1), Schwer(2), Extrem(3)
    const configBtns = container.querySelectorAll<HTMLButtonElement>('.consequence-config-btn');
    await fireEvent.click(configBtns[0]!); // Leicht
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.consequences.filter((c) => c.severity === 2)).toHaveLength(2);
  });

  it('NSC: removes the last consequence slot of the given severity', async () => {
    const onSave = vi.fn();
    const char: Character = {
      ...createDefaultCharacter('nsc'),
      consequences: [
        { severity: 2, label: 'mild', value: '' },
        { severity: 2, label: 'mild', value: '' },
      ] as Consequence[],
    };
    const { container } = renderForm(char, { onSave });
    // remove via the close button on the last consequence row
    const clearBtns = container.querySelectorAll<HTMLButtonElement>('.consequence-clear');
    await fireEvent.click(clearBtns[clearBtns.length - 1]!);
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.consequences.filter((c) => c.severity === 2)).toHaveLength(1);
  });

  it('NSC: new consequence slot is inserted after existing slots of same severity', async () => {
    const onSave = vi.fn();
    const char: Character = {
      ...createDefaultCharacter('nsc'),
      consequences: [
        { severity: 2, label: 'mild', value: 'first mild' },
        { severity: 4, label: 'moderate', value: 'moderate' },
      ] as Consequence[],
    };
    const { container } = renderForm(char, { onSave });
    const configBtns = container.querySelectorAll<HTMLButtonElement>('.consequence-config-btn');
    await fireEvent.click(configBtns[0]!); // Leicht → adds after index 0 (last mild)
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    const mildIdx = saved.consequences.findIndex((c) => c.severity === 2 && c.value === '');
    const modIdx = saved.consequences.findIndex((c) => c.severity === 4);
    // new mild slot should appear before the moderate slot
    expect(mildIdx).toBeLessThan(modIdx);
  });

  // ─── DataCloneError regression ────────────────────────────────
  // When SkillPyramid emits a filtered reactive array, form.skills holds Vue Proxy
  // objects. structuredClone(toRaw()) only unwraps one level and would fail.
  // deepClone() recursively strips all Vue proxies and must be used instead.

  it('save() emits a structuredClone-able character after SkillPyramid emits reactive skills', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useSkillsStore().replaceAll(['Athletik', 'Kämpfen']);

    const onSave = vi.fn();
    const char = {
      ...createDefaultCharacter(),
      skills: [{ skill: 'Athletik', level: 2 }],
      pyramidMaxLevel: 2,
      pyramidMaxCols: 2,
    };
    render(CharacterSheet, {
      // No SkillPyramid stub — we need the real component to emit reactive proxy elements
      props: { character: char, mode: 'edit', onSave },
      global: { plugins: [pinia] },
    });

    // "− Zeile" triggers SkillPyramid.removeRow() which calls props.skills.filter(...)
    // and emits an array whose elements are Vue Proxy objects.
    // CharacterSheet then assigns form.skills = $event (the reactive array elements).
    await fireEvent.click(screen.getByText('− Zeile'));
    await fireEvent.click(screen.getByText('Speichern'));

    expect(onSave).toHaveBeenCalledOnce();
    const saved = onSave.mock.calls[0]![0] as Character;
    // Must not throw DataCloneError (regression for structuredClone on Vue Proxy)
    expect(() => structuredClone(saved)).not.toThrow();
  });

  // ─── Save erzeugt Deep Clone ───────────────────────────────────

  it('emits a deep clone on save (no shared references)', async () => {
    const onSave = vi.fn();
    const char = createDefaultCharacter();
    renderForm(char, { onSave });
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved).not.toBe(char);
    expect(saved.stressTracks).not.toBe(char.stressTracks);
    expect(saved.consequences).not.toBe(char.consequences);
  });
});

describe('CharacterSheet (view mode)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockPush.mockReset();
  });

  it('hides empty consequence rows', () => {
    const char: Character = {
      ...createDefaultCharacter(),
      consequences: [
        { severity: 2, label: 'mild', value: '' },
        { severity: 4, label: 'moderate', value: 'Sprained ankle' },
      ],
    };
    const { container } = renderView(char);
    expect(container.querySelectorAll('.consequence-row')).toHaveLength(1);
    expect(screen.getByText('Sprained ankle')).toBeTruthy();
  });

  it('hides the consequences section when all consequences are empty', () => {
    const char: Character = {
      ...createDefaultCharacter(),
      consequences: [
        { severity: 2, label: 'mild', value: '' },
        { severity: 4, label: 'moderate', value: '' },
      ],
    };
    renderView(char);
    expect(screen.queryByText('KONSEQUENZEN')).toBeNull();
  });

  it('lets the stress section span the full row when consequences are hidden', () => {
    const char: Character = {
      ...createDefaultCharacter(),
      stressTracks: [{ label: 'Körperlich', boxes: [{ value: 1, checked: false }] }],
      consequences: [
        { severity: 2, label: 'mild', value: '' },
        { severity: 4, label: 'moderate', value: '' },
      ],
    };
    const { container } = renderView(char);
    expect(container.querySelector('.stress-section')?.classList.contains('span-full')).toBe(true);
    expect(screen.queryByText('KONSEQUENZEN')).toBeNull();
  });

  it('adds, renames, and removes stress tracks in edit mode', async () => {
    const onSave = vi.fn();
    const { container } = renderForm(createDefaultCharacter(), { onSave });

    await fireEvent.click(screen.getByText('+ Stress-Track hinzufügen'));

    const labelInputs = container.querySelectorAll<HTMLInputElement>('.stress-label-input');
    await fireEvent.update(labelInputs[labelInputs.length - 1]!, 'Armor');

    const lastRowButtons = container
      .querySelectorAll('.stress-track-row')
      [labelInputs.length - 1]!.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
    await fireEvent.click(lastRowButtons[1]!);
    await fireEvent.click(screen.getByText('Speichern'));

    const saved: Character = onSave.mock.calls[0]![0];
    const lastTrack = saved.stressTracks?.[saved.stressTracks.length - 1];
    expect(lastTrack?.label).toBe('Armor');
    expect(lastTrack?.boxes[0]!.value).toBe(1);
  });

  it('removes a stress track in edit mode', async () => {
    const onSave = vi.fn();
    const char = {
      ...createDefaultCharacter(),
      stressTracks: [{ label: 'Armor', boxes: [{ value: 1, checked: false }] }],
    };
    const { container } = renderForm(char, { onSave });

    const rowButtons = container
      .querySelector('.stress-track-row')!
      .querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
    await fireEvent.click(rowButtons[2]!);
    await fireEvent.click(screen.getByText('Speichern'));

    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.stressTracks).toEqual([]);
  });

  it('renders assigned items in a new section and opens the item detail on click', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const character = { ...createDefaultCharacter(), id: 'char-1', name: 'Heldin' };
    const item = {
      ...createDefaultItem(),
      id: 'item-1',
      name: 'Runenklinge',
      description: 'Leicht und scharf',
      redDice: 2,
    };

    useItemsStore().addItem(item);
    useCharacterItemsStore().assignItem(character.id, item.id);

    render(CharacterSheet, {
      props: { character, mode: 'view' },
      global: {
        plugins: [pinia],
        stubs: { SkillPyramid: true },
      },
    });

    expect(screen.getByText('GEGENSTÄNDE')).toBeTruthy();
    expect(screen.getByText('Runenklinge')).toBeTruthy();
    expect(screen.getByText('Leicht und scharf')).toBeTruthy();

    await fireEvent.click(screen.getByText('Runenklinge'));
    expect(mockPush).toHaveBeenCalledWith('/items/item-1');
  });

  it('hides assigned hidden items for non-GM users and shows them for GMs', () => {
    let pinia = createPinia();
    setActivePinia(pinia);

    const character = { ...createDefaultCharacter(), id: 'char-1', name: 'Heldin' };
    const hiddenItem = {
      ...createDefaultItem(),
      id: 'item-1',
      name: 'Geheime Klinge',
      hidden: true,
    };

    useItemsStore().addItem(hiddenItem);
    useCharacterItemsStore().assignItem(character.id, hiddenItem.id);

    const hiddenView = render(CharacterSheet, {
      props: { character, mode: 'view' },
      global: {
        plugins: [pinia],
        stubs: { SkillPyramid: true },
      },
    });
    expect(screen.queryByText('GEGENSTÄNDE')).toBeNull();
    expect(screen.queryByText('Geheime Klinge')).toBeNull();
    hiddenView.unmount();

    pinia = createPinia();
    setActivePinia(pinia);
    useItemsStore().addItem(hiddenItem);
    useCharacterItemsStore().assignItem(character.id, hiddenItem.id);
    useGMModeStore().isGMMode = true;
    render(CharacterSheet, {
      props: { character, mode: 'view' },
      global: {
        plugins: [pinia],
        stubs: { SkillPyramid: true },
      },
    });
    expect(screen.getByText('GEGENSTÄNDE')).toBeTruthy();
    expect(screen.getByText('Geheime Klinge')).toBeTruthy();
  });

  it('hides the assigned items section when sections.items is false', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const character = { ...createDefaultCharacter(), id: 'char-1', name: 'Heldin' };
    const item = { ...createDefaultItem(), id: 'item-1', name: 'Runenklinge' };

    useItemsStore().addItem(item);
    useCharacterItemsStore().assignItem(character.id, item.id);

    render(CharacterSheet, {
      props: {
        character,
        mode: 'view',
        sections: { items: false },
      },
      global: {
        plugins: [pinia],
        stubs: { SkillPyramid: true },
      },
    });

    expect(screen.queryByText('GEGENSTÄNDE')).toBeNull();
    expect(screen.queryByText('Runenklinge')).toBeNull();
  });

  it('does not navigate from assigned item cards when navigation is disabled', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const character = { ...createDefaultCharacter(), id: 'char-1', name: 'Heldin' };
    const item = { ...createDefaultItem(), id: 'item-1', name: 'Runenklinge' };

    useItemsStore().addItem(item);
    useCharacterItemsStore().assignItem(character.id, item.id);

    render(CharacterSheet, {
      props: {
        character,
        mode: 'view',
        disableAssignedItemNavigation: true,
      },
      global: {
        plugins: [pinia],
        stubs: { SkillPyramid: true },
      },
    });

    await fireEvent.click(screen.getByText('Runenklinge'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows item assignment controls inside the items section in non-GM edit mode', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useGMModeStore().isGMMode = false;

    render(CharacterSheet, {
      props: {
        character: { ...createDefaultCharacter(), id: 'char-1', name: 'Heldin' },
        mode: 'edit',
        isNew: false,
        availableItemOptions: [{ value: 'item-1', label: 'Runenklinge' }],
      },
      global: {
        plugins: [pinia],
        stubs: { SkillPyramid: true },
      },
    });

    expect(screen.getByText('GEGENSTÄNDE')).toBeTruthy();
    expect(screen.getByRole('combobox')).toBeTruthy();
  });

  it('emits assign-item from the in-sheet dropdown in non-GM edit mode', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useGMModeStore().isGMMode = false;
    const onAssignItem = vi.fn();

    render(CharacterSheet, {
      props: {
        character: { ...createDefaultCharacter(), id: 'char-1', name: 'Heldin' },
        mode: 'edit',
        isNew: false,
        availableItemOptions: [{ value: 'item-1', label: 'Runenklinge' }],
        onAssignItem,
      },
      global: {
        plugins: [pinia],
        stubs: { SkillPyramid: true },
      },
    });

    await fireEvent.update(screen.getByRole('combobox'), 'item-1');
    expect(onAssignItem).toHaveBeenCalledWith('item-1');
  });

  it('shows an unassign button on assigned item cards in non-GM edit mode and does not navigate on unassign', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useGMModeStore().isGMMode = false;
    const onUnassignItem = vi.fn();
    const character = { ...createDefaultCharacter(), id: 'char-1', name: 'Heldin' };
    const item = { ...createDefaultItem(), id: 'item-1', name: 'Runenklinge' };

    useItemsStore().addItem(item);
    useCharacterItemsStore().assignItem(character.id, item.id);

    const { container } = render(CharacterSheet, {
      props: {
        character,
        mode: 'edit',
        isNew: false,
        onUnassignItem,
      },
      global: {
        plugins: [pinia],
        stubs: { SkillPyramid: true },
      },
    });

    await fireEvent.click(container.querySelector('.assigned-item-card__remove')!);
    expect(onUnassignItem).toHaveBeenCalledWith('item-1');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not show hidden items in assignment controls for non-GM edit mode', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useGMModeStore().isGMMode = false;

    render(CharacterSheet, {
      props: {
        character: { ...createDefaultCharacter(), id: 'char-1', name: 'Heldin' },
        mode: 'edit',
        isNew: false,
        availableItemOptions: [],
        assignedItems: [{ ...createDefaultItem(), id: 'item-2', name: 'Versteckt', hidden: true }],
      },
      global: {
        plugins: [pinia],
        stubs: { SkillPyramid: true },
      },
    });

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByText('Versteckt')).toBeNull();
  });
});

// ─── Dirty-state: save/cancel button visibility ───────────────────────────

describe('CharacterSheet dirty-state', () => {
  function renderExisting(character: Character, extraProps: Record<string, unknown> = {}) {
    const pinia = createPinia();
    setActivePinia(pinia);
    return render(CharacterSheet, {
      props: { character, mode: 'edit', isNew: false, ...extraProps },
      global: { plugins: [pinia], stubs: { SkillPyramid: true } },
    });
  }

  it('shows cancel and disables save when form is unchanged (existing character)', () => {
    const char = { ...createDefaultCharacter(), name: 'Existing Hero' };
    const { getByText } = renderExisting(char);
    expect(getByText('Abbrechen')).toBeTruthy();
    expect((getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables save after a field is changed', async () => {
    const char = { ...createDefaultCharacter(), name: 'Existing Hero' };
    const { container } = renderExisting(char);
    const nameInput = container.querySelector<HTMLInputElement>('input[placeholder]')!;
    await fireEvent.update(nameInput, 'Changed Name');
    expect((screen.getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(
      false,
    );
    expect(screen.getByText('Abbrechen')).toBeTruthy();
  });

  it('shows save/cancel buttons immediately when isNew=true', () => {
    const char = createDefaultCharacter();
    const pinia = createPinia();
    setActivePinia(pinia);
    const { getByText } = render(CharacterSheet, {
      props: { character: char, mode: 'edit', isNew: true },
      global: { plugins: [pinia], stubs: { SkillPyramid: true } },
    });
    expect(getByText('Speichern')).toBeTruthy();
    expect(getByText('Abbrechen')).toBeTruthy();
  });

  it('enables save when external dirty state is set', () => {
    const char = { ...createDefaultCharacter(), name: 'Existing Hero' };
    const { getByText } = renderExisting(char, { externalDirty: true });
    expect((getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(false);
  });

  it('disables save again after saving', async () => {
    const char = { ...createDefaultCharacter(), name: 'Existing Hero' };
    const onSave = vi.fn();
    const { container, getByText } = renderExisting(char, { onSave });
    const nameInput = container.querySelector<HTMLInputElement>('input[placeholder]')!;
    await fireEvent.update(nameInput, 'Changed Name');
    await fireEvent.click(screen.getByText('Speichern'));
    expect((getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(true);
    expect(getByText('Abbrechen')).toBeTruthy();
  });

  it('resets local edits and dirty state when character prop reference changes', async () => {
    const char = { ...createDefaultCharacter(), id: 'c1', name: 'Existing Hero' };
    const { container, rerender, getByText } = renderExisting(char);
    const nameInput = container.querySelector<HTMLInputElement>('input[placeholder]')!;

    await fireEvent.update(nameInput, 'Unsaved Name');
    expect((getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(false);

    await rerender({
      character: { ...char, id: 'c2', name: 'Fresh Character' },
      mode: 'edit',
      isNew: false,
    });

    const updatedInput = container.querySelector<HTMLInputElement>('input[placeholder]')!;
    expect(updatedInput.value).toBe('Fresh Character');
    expect((getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('resets nested local edits when character prop reference changes', async () => {
    const char = {
      ...createDefaultCharacter(),
      id: 'c1',
      name: 'Existing Hero',
      stunts: [{ name: 'Old Stunt', description: 'Old Desc' }],
    };
    const { container, rerender } = renderExisting(char);

    await fireEvent.update(
      container.querySelector<HTMLInputElement>('.stunt-name-input')!,
      'Unsaved Stunt',
    );

    await rerender({
      character: {
        ...char,
        id: 'c2',
        stunts: [{ name: 'Fresh Stunt', description: 'Fresh Desc' }],
      },
      mode: 'edit',
      isNew: false,
    });

    expect(container.querySelector<HTMLInputElement>('.stunt-name-input')!.value).toBe(
      'Fresh Stunt',
    );
  });
});

// ─── MODIFIERS section ───────────────────────────────────────────────────────

describe('CharacterSheet – modifiers section', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('hides the section in view mode when all modifier values are 0', () => {
    const char = { ...createDefaultCharacter(), modifiers: [{ label: 'Test', value: 0 }] };
    renderView(char);
    expect(screen.queryByText('MODIFIERS')).toBeNull();
  });

  it('shows the section in edit mode even when all modifier values are 0', () => {
    const char = {
      ...createDefaultCharacter(),
      modifiers: [
        { label: 'Purer Schaden', value: 0 },
        { label: 'Deflektion', value: 0 },
      ],
    };
    renderForm(char);
    expect(screen.getByText('MODIFIERS')).toBeTruthy();
  });

  it('shows the section in view mode when a modifier has a non-zero value', () => {
    const char = { ...createDefaultCharacter(), modifiers: [{ label: 'Purer Schaden', value: 3 }] };
    renderView(char);
    expect(screen.getByText('MODIFIERS')).toBeTruthy();
  });

  it('counters are readonly in view mode (no +/- buttons rendered)', () => {
    const char = { ...createDefaultCharacter(), modifiers: [{ label: 'Purer Schaden', value: 2 }] };
    const { container } = renderView(char);
    const section = container.querySelector('.modifiers-section')!;
    expect(section.querySelectorAll('button')).toHaveLength(0);
  });

  it('incrementing a modifier counter and saving preserves the new value', async () => {
    const onSave = vi.fn();
    const char = {
      ...createDefaultCharacter(),
      modifiers: [{ label: 'Purer Schaden', value: 2 }],
    };
    const { container } = renderForm(char, { onSave });
    const section = container.querySelector('.modifiers-section')!;
    const addBtn = section.querySelector<HTMLButtonElement>('[aria-label="Erhöhen"]');
    await fireEvent.click(addBtn!);
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.modifiers![0]!.value).toBe(3);
  });

  it('lets the dice section span the full row when modifiers are hidden', () => {
    const char = {
      ...createDefaultCharacter(),
      redDice: 2,
      blueDice: 1,
      modifiers: [{ label: 'Test', value: 0 }],
    };
    const { container } = renderView(char);
    expect(container.querySelector('.dice-section')?.classList.contains('span-full')).toBe(true);
    expect(container.querySelector('.modifiers-section')).toBeNull();
  });

  it('lets the modifiers section span the full row when dice are hidden', () => {
    const char = { ...createDefaultCharacter(), modifiers: [{ label: 'Purer Schaden', value: 2 }] };
    const { container } = renderView(char);
    expect(container.querySelector('.dice-section')).toBeNull();
    expect(container.querySelector('.modifiers-section')?.classList.contains('span-full')).toBe(
      true,
    );
  });

  it('keeps dice and modifiers split when both sections are visible', () => {
    const char = {
      ...createDefaultCharacter(),
      redDice: 1,
      modifiers: [{ label: 'Purer Schaden', value: 2 }],
    };
    const { container } = renderView(char);
    expect(container.querySelector('.dice-section')?.classList.contains('span-full')).toBe(false);
    expect(container.querySelector('.modifiers-section')?.classList.contains('span-full')).toBe(
      false,
    );
  });
});

describe('Character comparator policy', () => {
  it('ignores deprecated pureDamage/deflection fields', () => {
    const base = { ...createDefaultCharacter(), pureDamage: 1, deflection: 2 } as Character;
    const changed = { ...base, pureDamage: 99, deflection: -4 } as Character;
    expect(isCharacterFormEqual(base, changed)).toBe(true);
  });

  it('tracks compared fields (e.g. gmNotes and archived) as dirty-relevant', () => {
    const base = { ...createDefaultCharacter(), gmNotes: 'A', archived: false } as Character;
    expect(isCharacterFormEqual(base, { ...base, gmNotes: 'B' })).toBe(false);
    expect(isCharacterFormEqual(base, { ...base, archived: true })).toBe(false);
  });
});

describe('CharacterSheet integration contract', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('exposes save() and isDirty to parent refs', async () => {
    const wrapper = mount(CharacterSheet, {
      props: {
        character: createDefaultCharacter(),
        mode: 'edit',
        isNew: false,
      },
      global: {
        plugins: [createPinia()],
        stubs: { SkillPyramid: true },
      },
    });

    const exposed = wrapper.vm as unknown as { save?: () => void; isDirty?: boolean };
    expect(typeof exposed.save).toBe('function');
    expect(exposed.isDirty).toBe(false);

    await wrapper.find('input[placeholder="Charaktername"]').setValue('Changed');
    expect((wrapper.vm as unknown as { isDirty?: boolean }).isDirty).toBe(true);
  });

  it('keeps stunt input values stable when removing a sibling row', async () => {
    const char = {
      ...createDefaultCharacter(),
      stunts: [
        { name: 'First', description: 'A' },
        { name: 'Second', description: 'B' },
      ],
    };
    const { container } = renderForm(char, { isNew: false });

    const nameInputs = container.querySelectorAll<HTMLInputElement>('.stunt-name-input');
    await fireEvent.update(nameInputs[1]!, 'Second Edited');

    const removeButtons = container.querySelectorAll<HTMLButtonElement>('.stunt-edit-row .fate-btn');
    await fireEvent.click(removeButtons[0]!);

    const remainingInput = container.querySelector<HTMLInputElement>('.stunt-name-input')!;
    expect(remainingInput.value).toBe('Second Edited');
  });

  it('keeps stress track label input stable when removing a sibling track', async () => {
    const char = {
      ...createDefaultCharacter(),
      stressTracks: [
        { label: 'Track A', boxes: [{ value: 1, checked: false }] },
        { label: 'Track B', boxes: [{ value: 1, checked: false }] },
      ],
    };
    const { container } = renderForm(char, { isNew: false });

    const labelInputs = container.querySelectorAll<HTMLInputElement>('.stress-label-input');
    await fireEvent.update(labelInputs[1]!, 'Track B Edited');

    const removeButtons = container.querySelectorAll<HTMLButtonElement>(
      '.stress-track-row .stress-ctrl-btn:nth-child(3)',
    );
    await fireEvent.click(removeButtons[0]!);

    const remainingLabelInput = container.querySelector<HTMLInputElement>('.stress-label-input')!;
    expect(remainingLabelInput.value).toBe('Track B Edited');
  });
});
