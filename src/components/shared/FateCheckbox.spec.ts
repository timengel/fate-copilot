import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/vue';
import FateCheckbox from './FateCheckbox.vue';

describe('FateCheckbox', () => {
  it('toggles via update:modelValue when clicked', async () => {
    const onUpdate = vi.fn();
    render(FateCheckbox, {
      props: { modelValue: false, label: 'Aktiv', 'onUpdate:modelValue': onUpdate },
    });
    await fireEvent.click(screen.getByText('Aktiv'));
    expect(onUpdate).toHaveBeenCalledWith(true);
  });

  it('reflects checked visual state from modelValue', () => {
    const { container } = render(FateCheckbox, { props: { modelValue: true } });
    expect(container.querySelector('.checkbox-box--checked')).toBeTruthy();
  });

  it('works without a label', () => {
    const { container } = render(FateCheckbox, { props: { modelValue: false } });
    expect(container.querySelector('.checkbox-label')).toBeNull();
    expect(container.querySelector('.fate-checkbox')).toBeTruthy();
  });
});
