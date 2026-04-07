import { fireEvent, render } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CharacterDetailView from './CharacterDetailView.vue';
import { useCampaignsStore } from '../stores/campaigns';
import { useCharactersStore } from '../stores/characters';
import { useItemsStore } from '../stores/items';
import { useCharacterItemsStore } from '../stores/characterItems';
import { useGMModeStore } from '../stores/gmMode';
import {
  createDefaultCharacter,
  createDefaultItem,
  createDefaultCampaign,
} from '../composables/useCharacterDefaults';

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

  it('passes only same-campaign assignable items into the sheet and removes the extra assignment section', () => {
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
      props: { editMode: true },
      global: {
        plugins: [pinia],
        stubs: {
          CharacterSheet: {
            props: ['availableItemOptions'],
            template: `
              <div>
                <span v-for="option in availableItemOptions" :key="option.value">{{ option.label }}</span>
              </div>
            `,
          },
          FateCampaignSection: { template: '<div />' },
          ConfirmDialog: true,
        },
      },
    });

    expect(container.querySelector('.entity-assignment-section')).toBeNull();
    expect(container.textContent).toContain('Passender Gegenstand');
    expect(container.textContent).not.toContain('Falscher Gegenstand');
  });

  it('hides hidden assignable items for non-GM users', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useGMModeStore().isGMMode = false;

    const campaignsStore = useCampaignsStore();
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();

    const sharedCampaign = { ...createDefaultCampaign(), id: 'camp-1', name: 'Gemeinsam' };
    const character = { ...createDefaultCharacter(), id: 'char-1', name: 'Iris' };
    const visibleItem = { ...createDefaultItem(), id: 'item-1', name: 'Sichtbar' };
    const hiddenItem = { ...createDefaultItem(), id: 'item-2', name: 'Versteckt', hidden: true };

    campaignsStore.addCampaign(sharedCampaign);
    charactersStore.addCharacter(character);
    itemsStore.addItem(visibleItem);
    itemsStore.addItem(hiddenItem);
    campaignsStore.assignCharacter(sharedCampaign.id, character.id);
    campaignsStore.assignItem(sharedCampaign.id, visibleItem.id);
    campaignsStore.assignItem(sharedCampaign.id, hiddenItem.id);

    const { container } = render(CharacterDetailView, {
      props: { editMode: true },
      global: {
        plugins: [pinia],
        stubs: {
          CharacterSheet: {
            props: ['availableItemOptions'],
            template: `
              <div>
                <span v-for="option in availableItemOptions" :key="option.value">{{ option.label }}</span>
              </div>
            `,
          },
          FateCampaignSection: { template: '<div />' },
          ConfirmDialog: true,
        },
      },
    });

    expect(container.textContent).toContain('Sichtbar');
    expect(container.textContent).not.toContain('Versteckt');
  });

  it('stages item assignment changes until save and restores them on cancel', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();
    const characterItemsStore = useCharacterItemsStore();

    const sharedCampaign = { ...createDefaultCampaign(), id: 'camp-1', name: 'Gemeinsam' };
    const character = { ...createDefaultCharacter(), id: 'char-1', name: 'Iris' };
    const assignedItem = { ...createDefaultItem(), id: 'item-1', name: 'Vorhanden' };
    const extraItem = { ...createDefaultItem(), id: 'item-2', name: 'Neu' };

    campaignsStore.addCampaign(sharedCampaign);
    charactersStore.addCharacter(character);
    itemsStore.addItem(assignedItem);
    itemsStore.addItem(extraItem);
    campaignsStore.assignCharacter(sharedCampaign.id, character.id);
    campaignsStore.assignItem(sharedCampaign.id, assignedItem.id);
    campaignsStore.assignItem(sharedCampaign.id, extraItem.id);
    characterItemsStore.assignItem(character.id, assignedItem.id);

    const renderView = () =>
      render(CharacterDetailView, {
        props: { editMode: true },
        global: {
          plugins: [pinia],
          stubs: {
            CharacterSheet: {
              props: ['character', 'availableItemOptions', 'assignedItems', 'externalDirty'],
              emits: ['assign-item', 'unassign-item', 'save', 'cancel'],
              template: `
                <div>
                  <span class="assigned">{{ (assignedItems || []).map((item) => item.name).join(',') }}</span>
                  <span class="options">{{ (availableItemOptions || []).map((option) => option.label).join(',') }}</span>
                  <span class="dirty">{{ externalDirty ? 'dirty' : 'clean' }}</span>
                  <button class="assign" @click="$emit('assign-item', 'item-2')">assign</button>
                  <button class="unassign" @click="$emit('unassign-item', 'item-1')">unassign</button>
                  <button class="save" @click="$emit('save', character)">save</button>
                  <button class="cancel" @click="$emit('cancel')">cancel</button>
                </div>
              `,
            },
            FateCampaignSection: { template: '<div />' },
            ConfirmDialog: true,
            FateButton: { template: '<button><slot /></button>' },
          },
        },
      });

    const cancelView = renderView();
    expect(cancelView.container.querySelector('.assigned')?.textContent).toContain('Vorhanden');
    expect(cancelView.container.querySelector('.dirty')?.textContent).toBe('clean');

    await fireEvent.click(cancelView.container.querySelector('.unassign')!);
    expect(characterItemsStore.getItemsForCharacter(character.id).map((item) => item.name)).toEqual(
      ['Vorhanden'],
    );
    expect(cancelView.container.querySelector('.assigned')?.textContent).not.toContain('Vorhanden');
    expect(cancelView.container.querySelector('.dirty')?.textContent).toBe('dirty');

    await fireEvent.click(cancelView.container.querySelector('.cancel')!);
    expect(characterItemsStore.getItemsForCharacter(character.id).map((item) => item.name)).toEqual(
      ['Vorhanden'],
    );
    cancelView.unmount();

    const saveView = renderView();
    await fireEvent.click(saveView.container.querySelector('.assign')!);
    expect(characterItemsStore.getItemsForCharacter(character.id).map((item) => item.name)).toEqual(
      ['Vorhanden'],
    );
    expect(saveView.container.querySelector('.dirty')?.textContent).toBe('dirty');

    await fireEvent.click(saveView.container.querySelector('.save')!);
    expect(characterItemsStore.getItemsForCharacter(character.id).map((item) => item.name)).toEqual(
      ['Vorhanden', 'Neu'],
    );
  });

  it('shows archive action but no delete action for non-GM users', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    useGMModeStore().isGMMode = false;

    const charactersStore = useCharactersStore();
    charactersStore.addCharacter({ ...createDefaultCharacter(), id: 'char-1', name: 'Iris' });

    const { container } = render(CharacterDetailView, {
      global: {
        plugins: [pinia],
        stubs: {
          CharacterSheet: {
            template: '<div><slot name="name-bar-actions" /></div>',
          },
          FateCampaignSection: { template: '<div />' },
          ConfirmDialog: true,
          FateButton: {
            props: ['icon'],
            template: '<button :data-icon="icon"><slot /></button>',
          },
        },
      },
    });

    expect(container.querySelector('[data-icon="archive"]')).toBeTruthy();
    expect(container.querySelector('[data-icon="delete"]')).toBeNull();
  });
});
