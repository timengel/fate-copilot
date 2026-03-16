import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import { setActivePinia, createPinia } from 'pinia';
import FateToast from './FateToast.vue';
import { useToastStore } from '../../stores/toast';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('FateToast', () => {
  it('does not render the toast element when not visible', () => {
    const { container } = render(FateToast);
    expect(container.querySelector('.fate-toast')).toBeNull();
  });

  it('renders the toast with the correct message when visible', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const { container } = render(FateToast, { global: { plugins: [pinia] } });

    const toastStore = useToastStore();
    toastStore.message = 'Gespeichert!';
    toastStore.visible = true;

    await new Promise((r) => setTimeout(r, 0)); // flush reactivity

    expect(container.querySelector('.fate-toast')).toBeTruthy();
    expect(container.querySelector('.fate-toast')?.textContent?.trim()).toBe('Gespeichert!');
  });
});
