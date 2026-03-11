import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import ConsequenceSlots from './ConsequenceSlots.vue';
import type { Consequence } from '../../types';

const consequences: Consequence[] = [
  { severity: 2, label: 'mild', value: '' },
  { severity: 4, label: 'moderate', value: '' },
  { severity: 6, label: 'severe', value: '' },
  { severity: 8, label: 'extreme', value: 'Broken leg' },
];

describe('ConsequenceSlots', () => {
  it('renders all 4 consequence rows', () => {
    const { container } = render(ConsequenceSlots, { props: { consequences, readonly: false } });
    expect(container.querySelectorAll('.consequence-row')).toHaveLength(4);
  });

  it('shows the German severity labels', () => {
    render(ConsequenceSlots, { props: { consequences, readonly: false } });
    expect(screen.getByText('Leicht')).toBeTruthy();
    expect(screen.getByText('Mittel')).toBeTruthy();
    expect(screen.getByText('Schwer')).toBeTruthy();
    expect(screen.getByText('Extrem')).toBeTruthy();
  });

  it('shows the severity numbers', () => {
    render(ConsequenceSlots, { props: { consequences, readonly: false } });
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
  });

  it('calls onUpdate with updated array on input', async () => {
    const onUpdate = vi.fn();
    const { container } = render(ConsequenceSlots, {
      props: { consequences, readonly: false, onUpdate },
    });
    const input = container.querySelectorAll<HTMLInputElement>('input.consequence-input')[0];
    await fireEvent.update(input, 'Broken arm');
    expect(onUpdate).toHaveBeenCalledOnce();
    const updated: Consequence[] = onUpdate.mock.calls[0][0];
    expect(updated[0].value).toBe('Broken arm');
    expect(updated[1].value).toBe(''); // others untouched
  });

  it('shows existing values in inputs', () => {
    const { container } = render(ConsequenceSlots, { props: { consequences, readonly: false } });
    const inputs = container.querySelectorAll<HTMLInputElement>('input.consequence-input');
    expect(inputs[3].value).toBe('Broken leg');
  });

  describe('readonly mode', () => {
    it('does not render inputs', () => {
      const { container } = render(ConsequenceSlots, { props: { consequences, readonly: true } });
      expect(container.querySelectorAll('input.consequence-input')).toHaveLength(0);
    });

    it('shows existing values as text', () => {
      render(ConsequenceSlots, { props: { consequences, readonly: true } });
      expect(screen.getByText('Broken leg')).toBeTruthy();
    });
  });

  it('emits a new array (immutable pattern) leaving other values unchanged', async () => {
    const onUpdate = vi.fn();
    const { container } = render(ConsequenceSlots, {
      props: { consequences, readonly: false, onUpdate },
    });
    const input = container.querySelectorAll<HTMLInputElement>('input.consequence-input')[0];
    await fireEvent.update(input, 'Sprained ankle');
    const updated: Consequence[] = onUpdate.mock.calls[0][0];
    expect(updated[0].value).toBe('Sprained ankle');
    expect(updated[1].value).toBe('');
    expect(updated[2].value).toBe('');
    expect(updated[3].value).toBe('Broken leg'); // unchanged
  });
});
