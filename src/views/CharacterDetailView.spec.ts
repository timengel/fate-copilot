import { render } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CharacterDetailView from './CharacterDetailView.vue';
import { useCampaignsStore } from '../stores/campaigns';
import { useCharactersStore } from '../stores/characters';
import { useItemsStore } from '../stores/items';
import { createDefaultCharacter, createDefaultItem, createDefaultCampaign } from '../composables/useCharacterDefaults';

const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockPush }),
  useRoute: () => ({ params: { id: 'char-1' }, query: {} }),
}));

describe('CharacterDetailView item assignments', () => {
  beforeEach(() => {
    mockPush.mockReset();
    setActivePinia(createPinia());
  });

  it('only shows assignable items from the same campaign as the character', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();

    const sharedCampaign = { ...createDefaultCampaign(), id: 'camp-1', name: 'Gemeinsam' };
    const otherCampaign = { ...createDefaultCampaign(), id: 'camp-2', name: 'Fremd' };
    const character = { ...createDefaultCharacter(), id: 'char-1', name: 'Iris' };
    const sharedItem = { ...createDefaultItem(), id: 'item-1', name: 'Passender Gegenstand' };
    const otherItem = { ...createDefaultItem(), id: 'item-2', name: 'Falscher Gegenstand' };

    campaignsStore.addCampaign(sharedCampaign);
    campaignsStore.addCampaign(otherCampaign);
    charactersStore.addCharacter(character);
    itemsStore.addItem(sharedItem);
    itemsStore.addItem(otherItem);
    campaignsStore.assignCharacter(sharedCampaign.id, character.id);
    campaignsStore.assignItem(sharedCampaign.id, sharedItem.id);
    campaignsStore.assignItem(otherCampaign.id, otherItem.id);

    const { container } = render(CharacterDetailView, {
      global: {
        plugins: [pinia],
        stubs: {
          CharacterSheet: { template: '<div />' },
          FateCampaignSection: { template: '<div />' },
          ConfirmDialog: true,
        },
      },
    });

    const itemSection = container.querySelector('.entity-assignment-section');
    expect(itemSection).toBeTruthy();

    const optionTexts = [...itemSection!.querySelectorAll('option')].map((option) => option.textContent?.trim());
    expect(optionTexts).toContain('Passender Gegenstand');
    expect(optionTexts).not.toContain('Falscher Gegenstand');
  });
});
