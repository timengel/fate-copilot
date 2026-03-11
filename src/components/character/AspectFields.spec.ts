import { describe, it, expect } from 'vitest';
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
  });
});
