import { render, fireEvent } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import CharactersView from './CharactersView.vue';
import { useCharactersStore } from '../stores/characters';
import type { Character } from '../types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ query: {} }),
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

describe('CharactersView – card interactions', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  function setup() {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useCharactersStore();
    const char = makeCharacter();
    store.addCharacter(char);

    const result = render(CharactersView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateHeader: { template: '<div><slot /></div>' },
          FateIcon: true,
          ConfirmDialog: true,
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });
    return { ...result, charId: char.id };
  }

  it('clicking the card navigates to the character view page', async () => {
    const { container, charId } = setup();
    await fireEvent.click(container.querySelector('.fate-card__main--clickable')!);
    expect(mockPush).toHaveBeenCalledWith(`/characters/${charId}`);
  });

  it('clicking the edit button navigates to the edit page without triggering card navigation', async () => {
    const { container, charId } = setup();
    const [editBtn] = container.querySelectorAll('.fate-card__actions button');
    await fireEvent.click(editBtn!);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(`/characters/${charId}/edit`);
  });

  it('clicking the delete button does not trigger navigation', async () => {
    const { container } = setup();
    const [, deleteBtn] = container.querySelectorAll('.fate-card__actions button');
    await fireEvent.click(deleteBtn!);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
