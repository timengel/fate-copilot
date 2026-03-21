import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/vue';
import FateDropdown from './FateDropdown.vue';

describe('FateDropdown', () => {
  it('renders the placeholder', () => {
    render(FateDropdown, { props: { placeholder: 'Wählen…' } });
    expect(screen.getByRole('combobox')).toBeTruthy();
    expect(screen.getByText('Wählen…')).toBeTruthy();
  });

  it('renders flat options', () => {
    render(FateDropdown, {
      props: {
        options: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
      },
    });
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Beta')).toBeTruthy();
  });

  it('renders grouped options', () => {
    const { container } = render(FateDropdown, {
      props: {
        groups: [
          {
            label: 'Gruppe',
            options: [{ value: 'x', label: 'X' }],
          },
        ],
      },
    });
    expect(container.querySelector('optgroup')?.getAttribute('label')).toBe('Gruppe');
    expect(screen.getByText('X')).toBeTruthy();
  });

  it('emits update:modelValue and change on selection', async () => {
    const onUpdate = vi.fn();
    const onChange = vi.fn();
    render(FateDropdown, {
      props: {
        options: [{ value: 'a', label: 'Alpha' }],
        'onUpdate:modelValue': onUpdate,
        onChange,
      },
    });

    await fireEvent.update(screen.getByRole('combobox'), 'a');
    expect(onUpdate).toHaveBeenCalledWith('a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('respects disabled', () => {
    render(FateDropdown, { props: { disabled: true } });
    expect((screen.getByRole('combobox') as HTMLSelectElement).disabled).toBe(true);
  });
});
