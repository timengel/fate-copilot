import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import CharacterSheet from './CharacterSheet.vue';
import { createDefaultCharacter } from '../../composables/useCharacterDefaults';
import { useSkillsStore } from '../../stores/skills';
import type { Character, Consequence } from '../../types';

function renderForm(character?: Character, extraProps: Record<string, unknown> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  return render(CharacterSheet, {
    props: { character: character ?? createDefaultCharacter(), mode: 'edit', isNew: true, ...extraProps },
    global: {
      plugins: [pinia],
      stubs: { SkillPyramid: true },
    },
  });
}

function renderView(character?: Character, extraProps: Record<string, unknown> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
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
    const char = { ...createDefaultCharacter(), stressPhysical: [{ value: 1, checked: false }] };
    const { container } = renderForm(char, { onSave });
    const btns = container.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
    await fireEvent.click(btns[1]!); // physical +
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.stressPhysical).toHaveLength(2);
    expect(saved.stressPhysical[1]!.value).toBe(2);
  });

  it('new stress box gets value = last value + 1', async () => {
    const onSave = vi.fn();
    const char = {
      ...createDefaultCharacter(),
      stressPhysical: [
        { value: 3, checked: false },
        { value: 5, checked: false },
      ],
    };
    const { container } = renderForm(char, { onSave });
    const btns = container.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
    await fireEvent.click(btns[1]!); // physical +
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.stressPhysical[2]!.value).toBe(6);
  });

  it('adds stress box with value 1 when track is empty', async () => {
    const onSave = vi.fn();
    const char = { ...createDefaultCharacter(), stressPhysical: [] };
    const { container } = renderForm(char, { onSave });
    const btns = container.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
    await fireEvent.click(btns[1]!); // physical +
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.stressPhysical).toHaveLength(1);
    expect(saved.stressPhysical[0]!.value).toBe(1);
  });

  it('removes the last physical stress box when − is clicked', async () => {
    const onSave = vi.fn();
    const char = {
      ...createDefaultCharacter(),
      stressPhysical: [
        { value: 1, checked: false },
        { value: 2, checked: false },
      ],
    };
    const { container } = renderForm(char, { onSave });
    const btns = container.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
    await fireEvent.click(btns[0]!); // physical −
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.stressPhysical).toHaveLength(1);
    expect(saved.stressPhysical[0]!.value).toBe(1);
  });

  it('− stress button is disabled when track is empty', () => {
    const char = { ...createDefaultCharacter(), stressPhysical: [] };
    const { container } = renderForm(char);
    const btns = container.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
    expect(btns[0]!.disabled).toBe(true); // physical −
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
    expect(saved.stressPhysical).not.toBe(char.stressPhysical);
    expect(saved.consequences).not.toBe(char.consequences);
  });
});

describe('CharacterSheet (view mode)', () => {
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
      stressPhysical: [{ value: 1, checked: false }],
      consequences: [
        { severity: 2, label: 'mild', value: '' },
        { severity: 4, label: 'moderate', value: '' },
      ],
    };
    const { container } = renderView(char);
    expect(container.querySelector('.stress-section')?.classList.contains('span-full')).toBe(true);
    expect(screen.queryByText('KONSEQUENZEN')).toBeNull();
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
});

// ─── PURER SCHADEN & DEFLEKTION section ──────────────────────────────────────

describe('CharacterSheet – pure damage / deflection section', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('hides the section in view mode when pureDamage and deflection are both absent', () => {
    const char = createDefaultCharacter();
    renderView(char);
    expect(screen.queryByText('PURER SCHADEN')).toBeNull();
    expect(screen.queryByText('DEFLEKTION')).toBeNull();
  });

  it('shows the section in edit mode even when pureDamage and deflection are 0', () => {
    const char = { ...createDefaultCharacter(), pureDamage: 0, deflection: 0 };
    renderForm(char);
    expect(screen.getByText('PURER SCHADEN')).toBeTruthy();
    expect(screen.getByText('DEFLEKTION')).toBeTruthy();
  });

  it('shows the section in view mode when pureDamage is set', () => {
    const char = { ...createDefaultCharacter(), pureDamage: 3 };
    renderView(char);
    expect(screen.getByText('PURER SCHADEN')).toBeTruthy();
  });

  it('shows the section in view mode when deflection is set', () => {
    const char = { ...createDefaultCharacter(), deflection: 2 };
    renderView(char);
    expect(screen.getByText('DEFLEKTION')).toBeTruthy();
  });

  it('only shows deflection counter in view mode when pureDamage is absent', () => {
    const char = { ...createDefaultCharacter(), deflection: 2 };
    renderView(char);
    expect(screen.queryByText('PURER SCHADEN')).toBeNull();
    expect(screen.getByText('DEFLEKTION')).toBeTruthy();
  });

  it('counters are readonly in view mode (no buttons rendered)', () => {
    const char = { ...createDefaultCharacter(), pureDamage: 2, deflection: 1 };
    const { container } = renderView(char);
    const section = container.querySelector('.pure-damage-section')!;
    expect(section.querySelectorAll('button')).toHaveLength(0);
  });

  it('incrementing pureDamage counter and saving preserves the new value', async () => {
    const onSave = vi.fn();
    const char = { ...createDefaultCharacter(), pureDamage: 2, deflection: 0 };
    const { container } = renderForm(char, { onSave });
    const section = container.querySelector('.pure-damage-section')!;
    const btns = section.querySelectorAll<HTMLButtonElement>('button');
    // btns[1] = pureDamage Erhöhen (btns[0] is minus, disabled at 2 > 0 so enabled)
    const pureDamageAdd = [...btns].find((b) => b.getAttribute('aria-label') === 'Erhöhen');
    await fireEvent.click(pureDamageAdd!);
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.pureDamage).toBe(3);
  });

  it('incrementing deflection counter and saving preserves the new value', async () => {
    const onSave = vi.fn();
    const char = { ...createDefaultCharacter(), pureDamage: 0, deflection: 1 };
    const { container } = renderForm(char, { onSave });
    const section = container.querySelector('.pure-damage-section')!;
    // two counters; deflection is the second — get all Erhöhen buttons and pick the last
    const addBtns = section.querySelectorAll<HTMLButtonElement>('[aria-label="Erhöhen"]');
    await fireEvent.click(addBtns[addBtns.length - 1]!);
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0]![0];
    expect(saved.deflection).toBe(2);
  });
});
