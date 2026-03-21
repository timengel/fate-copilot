import { render, fireEvent } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import ItemsView from './ItemsView.vue';
import { useItemsStore } from '../stores/items';
import type { Item } from '../types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    type: 'item',
    name: 'Test Gegenstand',
    description: '',
    aspects: [],
    stunts: [],
    extras: '',
    stressPhysical: [],
    stressMental: [],
    redDice: 0,
    blueDice: 0,
    ...overrides,
  };
}

describe('ItemsView – card interactions', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  function setup() {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useItemsStore();
    const item = makeItem();
    store.addItem(item);

    const result = render(ItemsView, {
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
    return { ...result, itemId: item.id };
  }

  it('clicking the card navigates to the item view page', async () => {
    const { container, itemId } = setup();
    await fireEvent.click(container.querySelector('.fate-card__main--clickable')!);
    expect(mockPush).toHaveBeenCalledWith(`/items/${itemId}`);
  });

  it('clicking the edit button navigates to the edit page without triggering card navigation', async () => {
    const { container, itemId } = setup();
    const [editBtn] = container.querySelectorAll('.fate-card__actions button');
    await fireEvent.click(editBtn!);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(`/items/${itemId}/edit`);
  });

  it('clicking the delete button does not trigger navigation', async () => {
    const { container } = setup();
    const [, deleteBtn] = container.querySelectorAll('.fate-card__actions button');
    await fireEvent.click(deleteBtn!);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows archived items only when the archive filter is enabled', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useItemsStore();
    store.addItem(makeItem({ id: 'item-archived', name: 'Archivierter Gegenstand', archived: true }));

    const view = render(ItemsView, {
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

    expect(view.queryByText('Archivierter Gegenstand')).toBeNull();

    await fireEvent.click(view.getByText('Zeige archivierte Gegenstände'));

    expect(view.getByText('Archivierter Gegenstand')).toBeTruthy();
  });
});
