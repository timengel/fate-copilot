import { render } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import HomeView from './HomeView.vue';
import { useCharactersStore } from '../stores/characters';
import { useCampaignsStore } from '../stores/campaigns';
import { CHARACTER_COLORS, type Character } from '../types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-1',
    type: 'sc',
    name: 'Test Charakter',
    description: '',
    highConcept: 'Ein tapferer Held',
    trouble: 'Stets in Gefahr',
    aspects: [],
    skills: [],
    stunts: [],
    extras: '',
    refresh: 3,
    fatePoints: 3,
    stressPhysical: [],
    stressMental: [],
    consequences: [],
    notes: '',
    ...overrides,
  };
}

function setup(characterOverrides: Partial<Character> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  useCampaignsStore();
  useCharactersStore().addCharacter(makeCharacter(characterOverrides));

  return render(HomeView, {
    global: {
      plugins: [pinia],
      stubs: {
        FateButton: { template: '<button><slot /></button>' },
        FateIcon: true,
        FatePlusLogo: true,
        FateTag: { template: '<span><slot /></span>' },
      },
    },
  });
}

describe('HomeView', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the character color dot using the palette primary color for known color ids', () => {
    const pfau = CHARACTER_COLORS.find((color) => color.id === 'pfau')!;
    const { container } = setup({ color: 'pfau' });
    const dot = container.querySelector<HTMLElement>('.char-color-dot');

    expect(dot?.style.backgroundColor).toBe(pfau.primary);
    expect(dot?.getAttribute('style')).toContain(pfau.primary);
  });

  it('falls back to the default theme color when the character color id is unknown', () => {
    const { container } = setup({ color: 'not-a-real-color' });
    const dot = container.querySelector<HTMLElement>('.char-color-dot');

    expect(dot?.style.backgroundColor).toBe('var(--fate-blue)');
    expect(dot?.getAttribute('style')).toContain('var(--fate-blue)');
  });
});
