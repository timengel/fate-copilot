import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import CharacterSheet from './CharacterSheet.vue';
import { createDefaultCharacter } from '../../composables/useCharacterDefaults';
import type { Character, Consequence } from '../../types';

function renderForm(character?: Character, extraProps: Record<string, unknown> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  return render(CharacterSheet, {
    props: { character: character ?? createDefaultCharacter(), mode: 'edit', ...extraProps },
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
    const saved: Character = onSave.mock.calls[0][0];
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
    await fireEvent.click(btns[1]); // physical +
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0][0];
    expect(saved.stressPhysical).toHaveLength(2);
    expect(saved.stressPhysical[1].value).toBe(2);
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
    await fireEvent.click(btns[1]); // physical +
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0][0];
    expect(saved.stressPhysical[2].value).toBe(6);
  });

  it('adds stress box with value 1 when track is empty', async () => {
    const onSave = vi.fn();
    const char = { ...createDefaultCharacter(), stressPhysical: [] };
    const { container } = renderForm(char, { onSave });
    const btns = container.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
    await fireEvent.click(btns[1]); // physical +
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0][0];
    expect(saved.stressPhysical).toHaveLength(1);
    expect(saved.stressPhysical[0].value).toBe(1);
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
    await fireEvent.click(btns[0]); // physical −
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0][0];
    expect(saved.stressPhysical).toHaveLength(1);
    expect(saved.stressPhysical[0].value).toBe(1);
  });

  it('− stress button is disabled when track is empty', () => {
    const char = { ...createDefaultCharacter(), stressPhysical: [] };
    const { container } = renderForm(char);
    const btns = container.querySelectorAll<HTMLButtonElement>('.stress-ctrl-btn');
    expect(btns[0].disabled).toBe(true); // physical −
  });

  // ─── Konsequenz-Slot-Verwaltung (NSC) ─────────────────────────

  it('NSC: adds a consequence slot of the given severity', async () => {
    const onSave = vi.fn();
    const char = createDefaultCharacter('nsc'); // starts with 1 mild consequence
    const { container } = renderForm(char, { onSave });
    // consequence-config-btn order: Leicht−(0), Leicht+(1), Mittel−(2), Mittel+(3), ...
    const configBtns = container.querySelectorAll<HTMLButtonElement>('.consequence-config-btn');
    await fireEvent.click(configBtns[1]); // Leicht +
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0][0];
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
    const configBtns = container.querySelectorAll<HTMLButtonElement>('.consequence-config-btn');
    await fireEvent.click(configBtns[0]); // Leicht −
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0][0];
    expect(saved.consequences.filter((c) => c.severity === 2)).toHaveLength(1);
  });

  it('NSC: − consequence button is disabled when count for severity is 0', () => {
    const char = createDefaultCharacter('nsc'); // only 1 mild; moderate/severe/extreme = 0
    const { container } = renderForm(char);
    const configBtns = container.querySelectorAll<HTMLButtonElement>('.consequence-config-btn');
    expect(configBtns[2].disabled).toBe(true); // Mittel −
    expect(configBtns[4].disabled).toBe(true); // Schwer −
    expect(configBtns[6].disabled).toBe(true); // Extrem −
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
    await fireEvent.click(configBtns[1]); // Leicht + → adds after index 0 (last mild)
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0][0];
    const mildIdx = saved.consequences.findIndex((c) => c.severity === 2 && c.value === '');
    const modIdx = saved.consequences.findIndex((c) => c.severity === 4);
    // new mild slot should appear before the moderate slot
    expect(mildIdx).toBeLessThan(modIdx);
  });

  // ─── Save erzeugt Deep Clone ───────────────────────────────────

  it('emits a deep clone on save (no shared references)', async () => {
    const onSave = vi.fn();
    const char = createDefaultCharacter();
    renderForm(char, { onSave });
    await fireEvent.click(screen.getByText('Speichern'));
    const saved: Character = onSave.mock.calls[0][0];
    expect(saved).not.toBe(char);
    expect(saved.stressPhysical).not.toBe(char.stressPhysical);
    expect(saved.consequences).not.toBe(char.consequences);
  });
});
