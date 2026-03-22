import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/vue';
import { setActivePinia, createPinia } from 'pinia';
import AvatarPicker from './AvatarPicker.vue';

describe('AvatarPicker', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  it('emits a simple emoji unchanged', async () => {
    const onUpdate = vi.fn();
    const { container } = render(AvatarPicker, {
      props: { 'onUpdate:modelValue': onUpdate },
    });
    await fireEvent.input(container.querySelector('input')!, { target: { value: '🦊' } });
    expect(onUpdate).toHaveBeenCalledWith('🦊');
  });

  it('preserves ZWJ emoji sequences (e.g. pirate flag 🏴‍☠️)', async () => {
    const onUpdate = vi.fn();
    const { container } = render(AvatarPicker, {
      props: { 'onUpdate:modelValue': onUpdate },
    });
    const pirateFlag = '🏴\u200D☠️'; // 🏴 + ZWJ + ☠️
    await fireEvent.input(container.querySelector('input')!, { target: { value: pirateFlag } });
    expect(onUpdate).toHaveBeenCalledWith(pirateFlag);
  });

  it('keeps only the first grapheme cluster when multiple characters are entered', async () => {
    const onUpdate = vi.fn();
    const { container } = render(AvatarPicker, {
      props: { 'onUpdate:modelValue': onUpdate },
    });
    await fireEvent.input(container.querySelector('input')!, { target: { value: 'AB' } });
    expect(onUpdate).toHaveBeenCalledWith('A');
  });

  it('keeps only the first emoji when multiple emojis are entered', async () => {
    const onUpdate = vi.fn();
    const { container } = render(AvatarPicker, {
      props: { 'onUpdate:modelValue': onUpdate },
    });
    await fireEvent.input(container.querySelector('input')!, { target: { value: '🦊🐉' } });
    expect(onUpdate).toHaveBeenCalledWith('🦊');
  });

  it('emits empty string when input is cleared', async () => {
    const onUpdate = vi.fn();
    const { container } = render(AvatarPicker, {
      props: { 'onUpdate:modelValue': onUpdate },
    });
    await fireEvent.input(container.querySelector('input')!, { target: { value: '' } });
    expect(onUpdate).toHaveBeenCalledWith('');
  });
});
