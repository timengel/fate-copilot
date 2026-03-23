import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import AspectFields from './AspectFields.vue';

const defaultProps = {
  highConcept: 'Hero',
  trouble: 'A dark past',
  aspects: ['Brave', 'Quick', 'Cunning'],
  readonly: false,
};

describe('AspectFields', () => {
  describe('edit mode (readonly=false)', () => {
    it('renders an input for highConcept', () => {
      const { container } = render(AspectFields, { props: defaultProps });
      const inputs = container.querySelectorAll<HTMLInputElement>('input.aspect-input');
      expect(inputs[0].value).toBe('Hero');
    });

    it('renders an input for trouble', () => {
      const { container } = render(AspectFields, { props: defaultProps });
      const inputs = container.querySelectorAll<HTMLInputElement>('input.aspect-input');
      expect(inputs[1].value).toBe('A dark past');
    });

    it('calls onUpdateHighConcept when highConcept input changes', async () => {
      const onUpdateHighConcept = vi.fn();
      const { container } = render(AspectFields, {
        props: { ...defaultProps, 'onUpdate:highConcept': onUpdateHighConcept },
      });
      const input = container.querySelectorAll<HTMLInputElement>('input.aspect-input')[0];
      await fireEvent.update(input, 'New Concept');
      expect(onUpdateHighConcept).toHaveBeenCalledWith('New Concept');
    });

    it('calls onUpdateTrouble when trouble input changes', async () => {
      const onUpdateTrouble = vi.fn();
      const { container } = render(AspectFields, {
        props: { ...defaultProps, 'onUpdate:trouble': onUpdateTrouble },
      });
      const input = container.querySelectorAll<HTMLInputElement>('input.aspect-input')[1];
      await fireEvent.update(input, 'New Trouble');
      expect(onUpdateTrouble).toHaveBeenCalledWith('New Trouble');
    });

    it('calls onUpdateAspects when an aspect input changes', async () => {
      const onUpdateAspects = vi.fn();
      const { container } = render(AspectFields, {
        props: { ...defaultProps, 'onUpdate:aspects': onUpdateAspects },
      });
      const input = container.querySelectorAll<HTMLInputElement>('input.aspect-input')[2];
      await fireEvent.update(input, 'New Aspect');
      expect(onUpdateAspects).toHaveBeenCalledOnce();
      const updated: string[] = onUpdateAspects.mock.calls[0][0];
      expect(updated[0]).toBe('New Aspect');
    });

    it('renders a remove button for each normal aspect', () => {
      const { container } = render(AspectFields, { props: defaultProps });
      const removeBtns = container.querySelectorAll('button[aria-label="Schließen"], button[title="Schließen"]');
      // one remove button per aspect
      expect(container.querySelectorAll('.aspect-row button')).toHaveLength(3);
    });

    it('clicking remove emits update:aspects with that item removed', async () => {
      const onUpdateAspects = vi.fn();
      const { container } = render(AspectFields, {
        props: { ...defaultProps, 'onUpdate:aspects': onUpdateAspects },
      });
      const removeBtn = container.querySelectorAll('.aspect-row button')[0] as HTMLButtonElement;
      await fireEvent.click(removeBtn);
      expect(onUpdateAspects).toHaveBeenCalledOnce();
      const updated: string[] = onUpdateAspects.mock.calls[0][0];
      expect(updated).toEqual(['Quick', 'Cunning']);
    });

    it('shows an add button', () => {
      render(AspectFields, { props: defaultProps });
      expect(screen.getByText('+ Aspekt')).toBeTruthy();
    });

    it('clicking add emits update:aspects with an empty string appended', async () => {
      const onUpdateAspects = vi.fn();
      render(AspectFields, {
        props: { ...defaultProps, 'onUpdate:aspects': onUpdateAspects },
      });
      await fireEvent.click(screen.getByText('+ Aspekt'));
      expect(onUpdateAspects).toHaveBeenCalledOnce();
      const updated: string[] = onUpdateAspects.mock.calls[0][0];
      expect(updated).toEqual(['Brave', 'Quick', 'Cunning', '']);
    });
  });

  describe('withHighConcept prop', () => {
    it('hides highConcept and trouble rows when withHighConcept=false', () => {
      const { container } = render(AspectFields, {
        props: { ...defaultProps, withHighConcept: false },
      });
      const inputs = container.querySelectorAll<HTMLInputElement>('input.aspect-input');
      // only the 3 normal aspect inputs, no highConcept/trouble
      expect(inputs).toHaveLength(3);
      expect(Array.from(inputs).map(i => i.value)).toEqual(['Brave', 'Quick', 'Cunning']);
    });

    it('shows highConcept and trouble when withHighConcept=true (default)', () => {
      const { container } = render(AspectFields, { props: defaultProps });
      const inputs = container.querySelectorAll<HTMLInputElement>('input.aspect-input');
      expect(inputs[0].value).toBe('Hero');
      expect(inputs[1].value).toBe('A dark past');
    });
  });

  describe('readonly mode', () => {
    it('shows text instead of inputs', () => {
      render(AspectFields, { props: { ...defaultProps, readonly: true } });
      expect(screen.getByText('Hero')).toBeTruthy();
      expect(screen.getByText('A dark past')).toBeTruthy();
    });

    it('does not render any aspect inputs', () => {
      const { container } = render(AspectFields, { props: { ...defaultProps, readonly: true } });
      expect(container.querySelectorAll('input.aspect-input')).toHaveLength(0);
    });

    it('does not show add or remove buttons', () => {
      const { container } = render(AspectFields, { props: { ...defaultProps, readonly: true } });
      expect(container.querySelectorAll('button')).toHaveLength(0);
    });
  });
});
