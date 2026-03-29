import { render, fireEvent, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, it, expect } from 'vitest';
import SkillsView from './SkillsView.vue';
import { useSkillsStore } from '../stores/skills';
import { useToastStore } from '../stores/toast';
import { useGMModeStore } from '../stores/gmMode';
import { SKILL_LIST, SkillAction } from '../types';
import type { SkillInfo } from '../types';

describe('SkillsView', () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  function setup() {
    const gmModeStore = useGMModeStore();
    gmModeStore.isGMMode = true;
    return render(SkillsView, {
      global: {
        plugins: [pinia],
        stubs: { FateHeader: { template: '<div><slot /></div>' } },
      },
    });
  }

  describe('"Auf Standard zurücksetzen" button', () => {
    it('is present', () => {
      setup();
      expect(screen.getByText('Auf Standard zurücksetzen')).toBeTruthy();
    });

    it('has the danger variant', () => {
      setup();
      const btn = screen.getByText('Auf Standard zurücksetzen').closest('button');
      expect(btn?.classList.contains('fate-btn--danger')).toBe(true);
    });

    it('does not show confirm dialog initially', () => {
      setup();
      expect(screen.queryByText('Fertigkeiten zurücksetzen')).toBeNull();
    });

    it('clicking the button shows the confirm dialog', async () => {
      setup();
      await fireEvent.click(screen.getByText('Auf Standard zurücksetzen'));
      expect(screen.getByText('Fertigkeiten zurücksetzen')).toBeTruthy();
    });

    it('confirm dialog shows the correct message', async () => {
      setup();
      await fireEvent.click(screen.getByText('Auf Standard zurücksetzen'));
      expect(
        screen.getByText(
          'Die Fertigkeitsliste wird auf die Fate-Core-Standardfertigkeiten zurückgesetzt. Eigene Anpassungen gehen verloren.',
        ),
      ).toBeTruthy();
    });

    it('clicking "Abbrechen" closes the dialog without resetting', async () => {
      const store = useSkillsStore();
      store.addSkill('Zauberei');

      setup();
      await fireEvent.click(screen.getByText('Auf Standard zurücksetzen'));
      await fireEvent.click(screen.getByText('Abbrechen'));

      expect(screen.queryByText('Fertigkeiten zurücksetzen')).toBeNull();
      expect(store.skills).toContain('Zauberei');
    });

    it('clicking "Bestätigen" resets skills to defaults', async () => {
      const store = useSkillsStore();
      store.addSkill('Zauberei');
      expect(store.skills).toContain('Zauberei');

      setup();
      await fireEvent.click(screen.getByText('Auf Standard zurücksetzen'));
      await fireEvent.click(screen.getByText('Bestätigen'));

      expect(store.skills).not.toContain('Zauberei');
      expect(store.skills).toEqual(expect.arrayContaining(SKILL_LIST));
    });

    it('clicking "Bestätigen" restores the Fate default actions for a modified default skill', async () => {
      const store = useSkillsStore();
      store.setSkillInfo('Empathie', {
        description: 'Benutzerdefiniert',
        actions: [
          {
            name: SkillAction.Overcome,
            examples: 'Eigene Aktion',
          },
        ],
      });

      setup();
      await fireEvent.click(screen.getByText('Auf Standard zurücksetzen'));
      await fireEvent.click(screen.getByText('Bestätigen'));

      expect(store.skillInfo.Empathie?.description).toContain('Emotionale Zustände');
      expect(store.skillInfo.Empathie?.actions.map((action) => action.name)).toEqual([
        SkillAction.CreateAdvantage,
        SkillAction.Defend,
      ]);
      expect(
        store.skillInfo.Empathie?.actions.some((action) => action.name === SkillAction.Overcome),
      ).toBe(false);
    });

    it('clicking "Bestätigen" closes the dialog', async () => {
      setup();
      await fireEvent.click(screen.getByText('Auf Standard zurücksetzen'));
      await fireEvent.click(screen.getByText('Bestätigen'));
      expect(screen.queryByText('Fertigkeiten zurücksetzen')).toBeNull();
    });
  });

  describe('"Hinzufügen" button', () => {
    it('is disabled when the input is empty', () => {
      setup();
      const btn = screen.getByText('Hinzufügen').closest('button');
      expect(btn?.disabled).toBe(true);
    });

    it('is enabled when the input has text', async () => {
      setup();
      await fireEvent.update(screen.getByPlaceholderText('Neue Fertigkeit...'), 'Zauberei');
      const btn = screen.getByText('Hinzufügen').closest('button');
      expect(btn?.disabled).toBe(false);
    });

    it('adds the skill and clears the input on click', async () => {
      const store = useSkillsStore();
      setup();
      const input = screen.getByPlaceholderText('Neue Fertigkeit...');
      await fireEvent.update(input, 'Zauberei');
      await fireEvent.click(screen.getByText('Hinzufügen'));
      expect(store.skills).toContain('Zauberei');
      expect((input as HTMLInputElement).value).toBe('');
    });

    it('adds the skill and clears the input on Enter', async () => {
      const store = useSkillsStore();
      setup();
      const input = screen.getByPlaceholderText('Neue Fertigkeit...');
      await fireEvent.update(input, 'Zauberei');
      await fireEvent.keyDown(input, { key: 'Enter' });
      expect(store.skills).toContain('Zauberei');
      expect((input as HTMLInputElement).value).toBe('');
    });

    it('shows a toast after adding a skill', async () => {
      const toastStore = useToastStore();
      setup();
      await fireEvent.update(screen.getByPlaceholderText('Neue Fertigkeit...'), 'Zauberei');
      await fireEvent.click(screen.getByText('Hinzufügen'));
      expect(toastStore.message).toContain('Zauberei');
      expect(toastStore.visible).toBe(true);
    });

    it('does not add a skill when input is only whitespace', async () => {
      const store = useSkillsStore();
      const initialCount = store.skills.length;
      setup();
      await fireEvent.update(screen.getByPlaceholderText('Neue Fertigkeit...'), '   ');
      const btn = screen.getByText('Hinzufügen').closest('button');
      expect(btn?.disabled).toBe(true);
      expect(store.skills).toHaveLength(initialCount);
    });
  });

  describe('skill detail dialog', () => {
    it('persists a newly added action after saving and reopening the dialog', async () => {
      const { container } = setup();

      await fireEvent.click(screen.getByText('Empathie'));
      await fireEvent.click(screen.getByText('Bearbeiten'));
      const addActionDropdown = screen.getAllByRole('combobox').at(-1);
      const examplesInputs = screen.getAllByPlaceholderText('Einsatzbeispiele');

      await fireEvent.update(addActionDropdown!, SkillAction.Overcome);
      await fireEvent.update(examplesInputs.at(-1)!, 'Luegen durchschauen');
      await fireEvent.click(screen.getByText('+'));
      await fireEvent.click(screen.getByText('Speichern'));

      expect(screen.getByText(/Luegen durchschauen/)).toBeTruthy();

      const overlay = container.ownerDocument.querySelector('.skill-info-overlay');
      await fireEvent.click(overlay!);
      await fireEvent.click(screen.getByText('Empathie'));

      expect(screen.getByText(/Luegen durchschauen/)).toBeTruthy();
    });

    it('shows legacy action notes from persisted skill info', async () => {
      const store = useSkillsStore();
      const legacyAction: SkillInfo['actions'][number] = {
        name: SkillAction.Overcome,
      };
      Object.assign(legacyAction, { note: 'Alte Notiz aus persistiertem Zustand' });

      store.skillInfo.Athletik = {
        description: 'Bewegung und Koordination',
        actions: [legacyAction],
      };

      setup();
      await fireEvent.click(screen.getByText('Athletik'));

      expect(screen.getByText('Bewegung und Koordination')).toBeTruthy();
      expect(screen.getByText(/Alte Notiz aus persistiertem Zustand/)).toBeTruthy();
    });
  });
});
