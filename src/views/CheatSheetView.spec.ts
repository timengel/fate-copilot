import { render, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { describe, it, expect } from 'vitest';
import CheatSheetView from './CheatSheetView.vue';
import { useGMModeStore } from '../stores/gmMode';

describe('CheatSheetView', () => {
  const renderView = (gmMode = true) => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useGMModeStore().isGMMode = gmMode;

    return render(CheatSheetView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateHeader: {
            props: ['title'],
            template: '<div><h1>{{ title }}</h1></div>',
          },
          FateCheatSheet: {
            template: '<section aria-label="Fate cheat sheet">stubbed cheat sheet</section>',
          },
        },
      },
    });
  };

  it('hides cheat sheet content when GM mode is disabled', () => {
    renderView(false);

    expect(screen.getByRole('heading', { level: 1, name: 'Cheat Sheet' })).toBeTruthy();
    expect(screen.getByText('Cheat Sheet ist nur im GM-Modus sichtbar.')).toBeTruthy();
    expect(screen.queryByLabelText('Fate cheat sheet')).toBeNull();
  });

  it('renders FateCheatSheet when GM mode is enabled', () => {
    renderView(true);

    expect(screen.getByRole('heading', { level: 1, name: 'Cheat Sheet' })).toBeTruthy();
    expect(screen.getByLabelText('Fate cheat sheet')).toBeTruthy();
    expect(screen.queryByText('Cheat Sheet ist nur im GM-Modus sichtbar.')).toBeNull();
  });
});
