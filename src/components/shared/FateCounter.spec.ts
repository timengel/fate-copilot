import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/vue';
import FateCounter from './FateCounter.vue';

function renderCounter(modelValue: number, extraProps: Record<string, unknown> = {}) {
  return render(FateCounter, {
    props: { modelValue, ...extraProps },
  });
}

describe('FateCounter', () => {
  it('decrements by 1 when − is clicked', async () => {
    const onUpdate = vi.fn();
    const { container } = renderCounter(5, { 'onUpdate:modelValue': onUpdate });
    await fireEvent.click(container.querySelectorAll('button')[0]!); // −
    expect(onUpdate).toHaveBeenCalledWith(4);
  });

  it('increments by 1 when + is clicked', async () => {
    const onUpdate = vi.fn();
    const { container } = renderCounter(5, { 'onUpdate:modelValue': onUpdate });
    await fireEvent.click(container.querySelectorAll('button')[1]!); // +
    expect(onUpdate).toHaveBeenCalledWith(6);
  });

  it('does not go below the minimum (default min=0)', async () => {
    const onUpdate = vi.fn();
    const { container } = renderCounter(0, { 'onUpdate:modelValue': onUpdate });
    await fireEvent.click(container.querySelectorAll('button')[0]!); // −
    expect(onUpdate).toHaveBeenCalledWith(0); // clamped at 0
  });

  it('does not go below a custom minimum', async () => {
    const onUpdate = vi.fn();
    const { container } = renderCounter(2, { min: 2, 'onUpdate:modelValue': onUpdate });
    await fireEvent.click(container.querySelectorAll('button')[0]!); // −
    expect(onUpdate).toHaveBeenCalledWith(2); // stays at min
  });

  it('does not go above the maximum when max is defined', async () => {
    const onUpdate = vi.fn();
    const { container } = renderCounter(10, { max: 10, 'onUpdate:modelValue': onUpdate });
    await fireEvent.click(container.querySelectorAll('button')[1]!); // +
    expect(onUpdate).toHaveBeenCalledWith(10); // clamped at max
  });

  it('has no upper limit when max is not defined', async () => {
    const onUpdate = vi.fn();
    const { container } = renderCounter(999, { 'onUpdate:modelValue': onUpdate });
    await fireEvent.click(container.querySelectorAll('button')[1]!); // +
    expect(onUpdate).toHaveBeenCalledWith(1000);
  });

  it('allows custom min below 0', async () => {
    const onUpdate = vi.fn();
    const { container } = renderCounter(-1, { min: -2, 'onUpdate:modelValue': onUpdate });
    await fireEvent.click(container.querySelectorAll('button')[0]!); // −
    expect(onUpdate).toHaveBeenCalledWith(-2);
  });
});
