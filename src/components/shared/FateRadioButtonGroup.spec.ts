import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/vue';
import FateRadioButtonGroup from './FateRadioButtonGroup.vue';

const options = [
  { value: 'list', label: 'Liste' },
  { value: 'grid', label: 'Grid' },
];

describe('FateRadioButtonGroup', () => {
  it('renders all options', () => {
    render(FateRadioButtonGroup, { props: { modelValue: 'list', options } });
    expect(screen.getByText('Liste')).toBeTruthy();
    expect(screen.getByText('Grid')).toBeTruthy();
  });

  it('clicking an option emits its value', async () => {
    const onUpdate = vi.fn();
    render(FateRadioButtonGroup, {
      props: { modelValue: 'list', options, 'onUpdate:modelValue': onUpdate },
    });
    await fireEvent.click(screen.getByText('Grid'));
    expect(onUpdate).toHaveBeenCalledWith('grid');
  });

  it('checked visual state follows modelValue', () => {
    const { container } = render(FateRadioButtonGroup, {
      props: { modelValue: 'grid', options },
    });
    expect(container.querySelectorAll('.radio-ring--checked')).toHaveLength(1);
    expect(container.querySelectorAll('.radio-dot')).toHaveLength(1);
  });
});
