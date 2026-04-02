import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import SkillPyramid from './SkillPyramid.vue';
import { useSkillsStore } from '../../stores/skills';
import { POSITIVE_CHECK_LADDER_LABELS } from '../../types';
import type { SkillEntry } from '../../types';

function renderPyramid(skills: SkillEntry[], extraProps: Record<string, unknown> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  useSkillsStore().replaceAll(['Athletik', 'Kämpfen', 'Schießen', 'Heimlichkeit']);
  return render(SkillPyramid, {
    props: { skills, maxLevel: 2, maxCols: 2, ...extraProps },
    global: { plugins: [pinia] },
  });
}

describe('SkillPyramid', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders official german ladder labels from the shared check ladder', () => {
    renderPyramid([], { maxLevel: 8, maxCols: 1 });

    expect(screen.getByText(`+8`)).toBeTruthy();
    expect(screen.getByText(POSITIVE_CHECK_LADDER_LABELS[8])).toBeTruthy();
    expect(screen.getByText(POSITIVE_CHECK_LADDER_LABELS[2])).toBeTruthy();
    expect(screen.getByText(POSITIVE_CHECK_LADDER_LABELS[1])).toBeTruthy();
  });

  // ─── updateSlot ────────────────────────────────────────────────

  describe('updateSlot', () => {
    it('emits new skill entry when an empty slot is filled', async () => {
      const onUpdate = vi.fn();
      const { container } = renderPyramid([], { onUpdate });
      // maxLevel=2, maxCols=2 → top row is level 2, first select is slot 0
      const selects = container.querySelectorAll<HTMLSelectElement>('.skill-select');
      await fireEvent.change(selects[0]!, { target: { value: 'Athletik' } });
      expect(onUpdate).toHaveBeenCalledOnce();
      const emitted: SkillEntry[] = onUpdate.mock.calls[0]![0];
      expect(emitted).toContainEqual({ skill: 'Athletik', level: 2 });
    });

    it('removes skill entry when slot is cleared (empty value)', async () => {
      const onUpdate = vi.fn();
      const skills: SkillEntry[] = [{ skill: 'Athletik', level: 2 }];
      const { container } = renderPyramid(skills, { onUpdate });
      const selects = container.querySelectorAll<HTMLSelectElement>('.skill-select');
      await fireEvent.change(selects[0]!, { target: { value: '' } });
      expect(onUpdate).toHaveBeenCalledOnce();
      const emitted: SkillEntry[] = onUpdate.mock.calls[0]![0];
      expect(emitted.find((e) => e.skill === 'Athletik')).toBeUndefined();
    });

    it('replaces existing skill when slot value is changed', async () => {
      const onUpdate = vi.fn();
      const skills: SkillEntry[] = [{ skill: 'Athletik', level: 2 }];
      const { container } = renderPyramid(skills, { onUpdate });
      const selects = container.querySelectorAll<HTMLSelectElement>('.skill-select');
      await fireEvent.change(selects[0]!, { target: { value: 'Kämpfen' } });
      const emitted: SkillEntry[] = onUpdate.mock.calls[0]![0];
      expect(emitted).toContainEqual({ skill: 'Kämpfen', level: 2 });
      expect(emitted.find((e) => e.skill === 'Athletik')).toBeUndefined();
    });

    it('leaves skills at other levels untouched', async () => {
      const onUpdate = vi.fn();
      const skills: SkillEntry[] = [{ skill: 'Kämpfen', level: 1 }];
      const { container } = renderPyramid(skills, { onUpdate });
      // selects[0] is level 2, slot 0
      const selects = container.querySelectorAll<HTMLSelectElement>('.skill-select');
      await fireEvent.change(selects[0]!, { target: { value: 'Athletik' } });
      const emitted: SkillEntry[] = onUpdate.mock.calls[0]![0];
      expect(emitted).toContainEqual({ skill: 'Athletik', level: 2 });
      expect(emitted).toContainEqual({ skill: 'Kämpfen', level: 1 });
    });
  });

  // ─── addRow / removeRow ────────────────────────────────────────

  describe('addRow / removeRow', () => {
    it('emits updateLayout with maxLevel + 1 when adding a row', async () => {
      const onUpdateLayout = vi.fn();
      renderPyramid([], { onUpdateLayout });
      await fireEvent.click(screen.getByText('+ Zeile'));
      expect(onUpdateLayout).toHaveBeenCalledWith({ maxLevel: 3, maxCols: 2 });
    });

    it('emits updateLayout with maxLevel − 1 when removing a row', async () => {
      const onUpdateLayout = vi.fn();
      renderPyramid([], { onUpdateLayout });
      await fireEvent.click(screen.getByText('− Zeile'));
      expect(onUpdateLayout).toHaveBeenCalledWith({ maxLevel: 1, maxCols: 2 });
    });

    it('removes skills above the new maxLevel when a row is removed', async () => {
      const onUpdate = vi.fn();
      const skills: SkillEntry[] = [
        { skill: 'Athletik', level: 2 },
        { skill: 'Kämpfen', level: 1 },
      ];
      renderPyramid(skills, { onUpdate });
      await fireEvent.click(screen.getByText('− Zeile'));
      const emitted: SkillEntry[] = onUpdate.mock.calls[0]![0];
      expect(emitted.find((e) => e.level === 2)).toBeUndefined();
      expect(emitted).toContainEqual({ skill: 'Kämpfen', level: 1 });
    });

    it('disables the + Zeile button when maxLevel is 8', () => {
      renderPyramid([], { maxLevel: 8 });
      const btn = screen.getByText('+ Zeile').closest('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('does not disable the + Zeile button when maxLevel is 7', () => {
      renderPyramid([], { maxLevel: 7 });
      const btn = screen.getByText('+ Zeile').closest('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });
  });

  // ─── addCol / removeCol ────────────────────────────────────────

  describe('addCol / removeCol', () => {
    it('emits updateLayout with maxCols + 1 when adding a column', async () => {
      const onUpdateLayout = vi.fn();
      renderPyramid([], { onUpdateLayout });
      await fireEvent.click(screen.getByText('+ Spalte'));
      expect(onUpdateLayout).toHaveBeenCalledWith({ maxLevel: 2, maxCols: 3 });
    });

    it('emits updateLayout with maxCols − 1 when removing a column', async () => {
      const onUpdateLayout = vi.fn();
      renderPyramid([], { onUpdateLayout });
      await fireEvent.click(screen.getByText('− Spalte'));
      expect(onUpdateLayout).toHaveBeenCalledWith({ maxLevel: 2, maxCols: 1 });
    });

    it('removes skills beyond the new column count', async () => {
      const onUpdate = vi.fn();
      // With maxCols=2, two skills at level 2: Athletik at position 0, Kämpfen at position 1.
      // After removeCol → maxCols=1, only position 0 survives.
      const skills: SkillEntry[] = [
        { skill: 'Athletik', level: 2 },
        { skill: 'Kämpfen', level: 2 },
      ];
      renderPyramid(skills, { onUpdate });
      await fireEvent.click(screen.getByText('− Spalte'));
      const emitted: SkillEntry[] = onUpdate.mock.calls[0]![0];
      expect(emitted).toContainEqual({ skill: 'Athletik', level: 2 });
      expect(emitted.find((e) => e.skill === 'Kämpfen')).toBeUndefined();
    });

    it('keeps all skills that are within the new column count', async () => {
      const onUpdate = vi.fn();
      const skills: SkillEntry[] = [
        { skill: 'Athletik', level: 2 }, // pos 0 → survives
        { skill: 'Kämpfen', level: 1 }, // pos 0 → survives
      ];
      renderPyramid(skills, { onUpdate });
      await fireEvent.click(screen.getByText('− Spalte'));
      const emitted: SkillEntry[] = onUpdate.mock.calls[0]![0];
      expect(emitted).toContainEqual({ skill: 'Athletik', level: 2 });
      expect(emitted).toContainEqual({ skill: 'Kämpfen', level: 1 });
    });
  });
});
