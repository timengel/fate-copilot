import { render, fireEvent } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import ItemsView from './ItemsView.vue';
import { useItemsStore } from '../stores/items';
import { useGMModeStore } from '../stores/gmMode';
import { useToastStore } from '../stores/toast';
import type { Item } from '../types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

  function setupGM(overrides: Partial<Item> = {}) {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useItemsStore();
    const gmStore = useGMModeStore();
    gmStore.isGMMode = true;
    const item = makeItem(overrides);
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
    return { ...result, store, itemId: item.id };
  }

  it('clicking the card navigates to the item view page', async () => {
    const { container, itemId } = setup();
    await fireEvent.click(container.querySelector('.fate-card__main--clickable')!);
    expect(mockPush).toHaveBeenCalledWith(`/items/${itemId}`);
  });

  it('clicking the edit button navigates to the edit page without triggering card navigation', async () => {
    const { container, itemId } = setup();
    const [, editBtn] = container.querySelectorAll('.fate-card__actions button');
    await fireEvent.click(editBtn!);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(`/items/${itemId}/edit`);
  });

  it('clicking the delete button does not trigger navigation', async () => {
    const { container } = setup();
    const [, , deleteBtn] = container.querySelectorAll('.fate-card__actions button');
    await fireEvent.click(deleteBtn!);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows a quick archive button in GM mode', () => {
    const { getByLabelText } = setupGM();
    expect(getByLabelText('Gegenstand archivieren')).toBeTruthy();
  });

  it('quick archive toggles the archived flag without navigation', async () => {
    const { getByLabelText, store, itemId } = setupGM();
    const toastStore = useToastStore();
    await fireEvent.click(getByLabelText('Gegenstand archivieren'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(store.getById(itemId)?.archived).toBe(true);
    expect(toastStore.message).toBe('Gegenstand "Test Gegenstand" archiviert');
  });

  it('shows an unarchive button for archived items in GM mode when archived entries are shown', async () => {
    const { getByLabelText, getByText } = setupGM({ archived: true });
    await fireEvent.click(getByText('Zeige archivierte Gegenstände'));
    expect(getByLabelText('Gegenstand entarchivieren')).toBeTruthy();
  });

  describe('copy button', () => {
    let writeText: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('copy button is the first action button on a card', () => {
      const { container } = setup();
      const [copyBtn] = container.querySelectorAll('.fate-card__actions button');
      expect(copyBtn).toBeTruthy();
    });

    it('clicking the copy button calls clipboard.writeText', async () => {
      const { container } = setup();
      const [copyBtn] = container.querySelectorAll('.fate-card__actions button');
      await fireEvent.click(copyBtn!);
      expect(writeText).toHaveBeenCalledOnce();
    });

    it('clipboard JSON contains the item name', async () => {
      const { container } = setup();
      const [copyBtn] = container.querySelectorAll('.fate-card__actions button');
      await fireEvent.click(copyBtn!);
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.name).toBe('Test Gegenstand');
    });

    it('clipboard JSON has type "item"', async () => {
      const { container } = setup();
      const [copyBtn] = container.querySelectorAll('.fate-card__actions button');
      await fireEvent.click(copyBtn!);
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.type).toBe('item');
    });

    it('clicking the copy button does not trigger navigation', async () => {
      const { container } = setup();
      const [copyBtn] = container.querySelectorAll('.fate-card__actions button');
      await fireEvent.click(copyBtn!);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('meta display', () => {
    function setupWithItem(overrides: Partial<Item> = {}) {
      const pinia = createPinia();
      setActivePinia(pinia);
      const store = useItemsStore();
      store.addItem(makeItem(overrides));
      return render(ItemsView, {
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
    }

    it('shows pureDamage count with ⚔️ when pureDamage > 0', () => {
      const { getByText } = setupWithItem({ pureDamage: 2 });
      expect(getByText('2 ⚔️')).toBeTruthy();
    });

    it('shows deflection count with 🛡️ when deflection > 0', () => {
      const { getByText } = setupWithItem({ deflection: 3 });
      expect(getByText('3 🛡️')).toBeTruthy();
    });

    it('shows both pureDamage and deflection when both are set', () => {
      const { getByText } = setupWithItem({ pureDamage: 1, deflection: 2 });
      expect(getByText('1 ⚔️')).toBeTruthy();
      expect(getByText('2 🛡️')).toBeTruthy();
    });

    it('does not show meta when all dice and pure damage values are 0', () => {
      const { container } = setupWithItem({ redDice: 0, blueDice: 0, pureDamage: 0, deflection: 0 });
      expect(container.querySelector('.fate-card__meta')).toBeNull();
    });
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
