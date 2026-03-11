import { render, fireEvent } from '@testing-library/vue';
import { setActivePinia, createPinia } from 'pinia';
import FateToggle from './FateToggle.vue';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('FateToggle', () => {
  describe('rendering', () => {
    it('renders without label', () => {
      const { container } = render(FateToggle, { props: { modelValue: false } });
      expect(container.querySelector('.toggle-label')).toBeNull();
      expect(container.querySelector('.toggle-track')).not.toBeNull();
    });

    it('renders with label text', () => {
      const { getByText } = render(FateToggle, { props: { modelValue: false, label: 'GM-Modus' } });
      expect(getByText('GM-Modus')).not.toBeNull();
    });
  });

  describe('state', () => {
    it('track has no active class when modelValue is false', () => {
      const { container } = render(FateToggle, { props: { modelValue: false } });
      const track = container.querySelector('.toggle-track')!;
      expect(track.classList.contains('toggle-track--on')).toBe(false);
    });

    it('track has active class when modelValue is true', () => {
      const { container } = render(FateToggle, { props: { modelValue: true } });
      const track = container.querySelector('.toggle-track')!;
      expect(track.classList.contains('toggle-track--on')).toBe(true);
    });
  });

  describe('interaction', () => {
    it('emits update:modelValue with true when clicked while off', async () => {
      const onUpdate = vi.fn();
      const { container } = render(FateToggle, {
        props: { modelValue: false, 'onUpdate:modelValue': onUpdate },
      });
      await fireEvent.click(container.querySelector('.fate-toggle')!);
      expect(onUpdate).toHaveBeenCalledWith(true);
    });

    it('emits update:modelValue with false when clicked while on', async () => {
      const onUpdate = vi.fn();
      const { container } = render(FateToggle, {
        props: { modelValue: true, 'onUpdate:modelValue': onUpdate },
      });
      await fireEvent.click(container.querySelector('.fate-toggle')!);
      expect(onUpdate).toHaveBeenCalledWith(false);
    });
  });
});
