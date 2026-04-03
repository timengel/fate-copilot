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
            props: ['variant'],
            template:
              '<section aria-label="Fate cheat sheet" :data-variant="variant">stubbed cheat sheet</section>',
          },
        },
      },
    });
  };

  it('renders basic cheat sheet when GM mode is disabled', () => {
    renderView(false);

    expect(screen.getByRole('heading', { level: 1, name: 'Cheat Sheet' })).toBeTruthy();
    const cheatSheet = screen.getByLabelText('Fate cheat sheet');
    expect(cheatSheet).toBeTruthy();
    expect(cheatSheet.getAttribute('data-variant')).toBe('basic');
  });

  it('renders GM cheat sheet when GM mode is enabled', () => {
    renderView(true);

    expect(screen.getByRole('heading', { level: 1, name: 'Cheat Sheet' })).toBeTruthy();
    const cheatSheet = screen.getByLabelText('Fate cheat sheet');
    expect(cheatSheet).toBeTruthy();
    expect(cheatSheet.getAttribute('data-variant')).toBe('gm');
  });
});
