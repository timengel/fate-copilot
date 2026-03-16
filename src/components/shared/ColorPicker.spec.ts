import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/vue';
import ColorPicker from './ColorPicker.vue';
import { CHARACTER_COLORS } from '../../types';

describe('ColorPicker', () => {
  it('renders one button per color in CHARACTER_COLORS', () => {
    const { container } = render(ColorPicker);
    expect(container.querySelectorAll('button.color-swatch').length).toBe(CHARACTER_COLORS.length);
  });

  it('marks pfau as active by default when modelValue is undefined', () => {
    const { container } = render(ColorPicker);
    const swatches = container.querySelectorAll('button.color-swatch');
    const pfauIndex = CHARACTER_COLORS.findIndex((c) => c.id === 'pfau');
    expect(swatches[pfauIndex]!.classList.contains('active')).toBe(true);
  });

  it('marks only the given color swatch as active', () => {
    const { container } = render(ColorPicker, { props: { modelValue: 'tomate' } });
    const swatches = container.querySelectorAll('button.color-swatch');
    const tomateIndex = CHARACTER_COLORS.findIndex((c) => c.id === 'tomate');
    expect(swatches[tomateIndex]!.classList.contains('active')).toBe(true);
    // others must not be active
    swatches.forEach((swatch, i) => {
      if (i !== tomateIndex) {
        expect(swatch.classList.contains('active')).toBe(false);
      }
    });
  });

  it('emits update:modelValue with the color id when a swatch is clicked', async () => {
    const onUpdate = vi.fn();
    const { container } = render(ColorPicker, {
      props: { modelValue: 'pfau', 'onUpdate:modelValue': onUpdate },
    });
    const basilikumIndex = CHARACTER_COLORS.findIndex((c) => c.id === 'basilikum');
    await fireEvent.click(container.querySelectorAll('button.color-swatch')[basilikumIndex]!);
    expect(onUpdate).toHaveBeenCalledWith('basilikum');
  });
});
