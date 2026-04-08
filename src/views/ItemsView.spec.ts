import { render, fireEvent } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import ItemsView from './ItemsView.vue';
import { useItemsStore } from '../stores/items';
import { useCampaignsStore } from '../stores/campaigns';
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
    const { getByRole, itemId } = setup();
    await fireEvent.click(getByRole('button', { name: 'Test Gegenstand' }));
    expect(mockPush).toHaveBeenCalledWith(`/items/${itemId}`);
  });

  it('clicking the edit button navigates to the edit page without triggering card navigation', async () => {
    const { getByLabelText, itemId } = setup();
    await fireEvent.click(getByLabelText('Gegenstand bearbeiten'));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(`/items/${itemId}/edit`);
  });

  it('clicking quick archive does not trigger navigation', async () => {
    const { getByLabelText } = setup();
    await fireEvent.click(getByLabelText('Gegenstand archivieren'));
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

    it('clicking the copy button calls clipboard.writeText', async () => {
      const { getByLabelText } = setup();
      await fireEvent.click(getByLabelText('Gegenstand kopieren'));
      expect(writeText).toHaveBeenCalledOnce();
    });

    it('clipboard JSON contains the item name', async () => {
      const { getByLabelText } = setup();
      await fireEvent.click(getByLabelText('Gegenstand kopieren'));
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.name).toBe('Test Gegenstand');
    });

    it('clipboard JSON has type "item"', async () => {
      const { getByLabelText } = setup();
      await fireEvent.click(getByLabelText('Gegenstand kopieren'));
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.type).toBe('item');
    });

    it('clicking the copy button does not trigger navigation', async () => {
      const { getByLabelText } = setup();
      await fireEvent.click(getByLabelText('Gegenstand kopieren'));
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

    it('shows modifier count with label when value > 0', () => {
      const { getByText } = setupWithItem({ modifiers: [{ label: 'Purer Schaden', value: 2 }] });
      expect(getByText('+2 Purer Schaden')).toBeTruthy();
    });

    it('shows second modifier with label when value > 0', () => {
      const { getByText } = setupWithItem({ modifiers: [{ label: 'Deflektion', value: 3 }] });
      expect(getByText('+3 Deflektion')).toBeTruthy();
    });

    it('shows multiple modifiers when both have non-zero values', () => {
      const { getByText } = setupWithItem({ modifiers: [{ label: 'Purer Schaden', value: 1 }, { label: 'Deflektion', value: 2 }] });
      expect(getByText('+1 Purer Schaden')).toBeTruthy();
      expect(getByText('+2 Deflektion')).toBeTruthy();
    });

    it('shows negative modifier value with - prefix', () => {
      const { getByText } = setupWithItem({ modifiers: [{ label: 'Purer Schaden', value: -3 }] });
      expect(getByText('-3 Purer Schaden')).toBeTruthy();
    });

    it('does not show meta when all dice and modifier values are 0', () => {
      const { queryByText } = setupWithItem({
        redDice: 0,
        blueDice: 0,
        modifiers: [{ label: 'NurModifier', value: 0 }],
      });
      expect(queryByText('NurModifier')).toBeNull();
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

  it('shows a campaign filter dropdown with the unassigned option', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const campaignsStore = useCampaignsStore();
    campaignsStore.addCampaign({
      id: 'camp-1',
      name: 'Alpha',
      description: '',
      status: 'active',
      notes: '',
      milestones: [],
    });

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

    const campaignSelect = view
      .getAllByRole('combobox')
      .find((select) => select.textContent?.includes('Aktive Kampagnen'));
    expect(campaignSelect?.textContent).toContain('Aktive Kampagnen');
    expect(campaignSelect?.textContent).toContain('Alle Kampagnen');
    expect(campaignSelect?.textContent).toContain('Nicht zugewiesen');
    expect(campaignSelect?.textContent).toContain('Alpha');
  });

  it('defaults the campaign filter to Aktiv', () => {
    const view = setup();
    const campaignSelect = view
      .getAllByRole('combobox')
      .find((select) => select.textContent?.includes('Aktive Kampagnen'));
    expect((campaignSelect as HTMLSelectElement | undefined)?.value).toBe('active');
  });

  it('shows a reset filters button', () => {
    const view = setup();
    expect(view.getByLabelText('Filter zurücksetzen')).toBeTruthy();
  });

  it('keeps the reset filters button disabled when filters are at their defaults', () => {
    const view = setup();
    expect((view.getByLabelText('Filter zurücksetzen') as HTMLButtonElement).disabled).toBe(true);
  });

  it('filters items by assigned campaign', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const itemsStore = useItemsStore();
    const campaignsStore = useCampaignsStore();

    itemsStore.addItem(makeItem({ id: 'item-1', name: 'Alpha-Schwert' }));
    itemsStore.addItem(makeItem({ id: 'item-2', name: 'Beta-Schild' }));
    campaignsStore.addCampaign({
      id: 'camp-1',
      name: 'Alpha',
      description: '',
      status: 'active',
      notes: '',
      milestones: [],
    });
    campaignsStore.assignItem('camp-1', 'item-1');

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

    const campaignSelect = view
      .getAllByRole('combobox')
      .find((select) => select.textContent?.includes('Aktive Kampagnen'));
    await fireEvent.update(campaignSelect!, 'camp-1');

    expect(view.getByText('Alpha-Schwert')).toBeTruthy();
    expect(view.queryByText('Beta-Schild')).toBeNull();
  });

  it('shows only items assigned to active campaigns by default when active campaigns exist', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const itemsStore = useItemsStore();
    const campaignsStore = useCampaignsStore();

    itemsStore.addItem(makeItem({ id: 'item-1', name: 'Aktiv-Zugewiesen' }));
    itemsStore.addItem(makeItem({ id: 'item-2', name: 'Inaktiv-Zugewiesen' }));
    itemsStore.addItem(makeItem({ id: 'item-3', name: 'Ohne Kampagne' }));
    campaignsStore.addCampaign({
      id: 'camp-active',
      name: 'Alpha',
      description: '',
      status: 'active',
      notes: '',
      milestones: [],
    });
    campaignsStore.addCampaign({
      id: 'camp-inactive',
      name: 'Beta',
      description: '',
      status: 'inactive',
      notes: '',
      milestones: [],
    });
    campaignsStore.assignItem('camp-active', 'item-1');
    campaignsStore.assignItem('camp-inactive', 'item-2');

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

    expect(view.getByText('Aktiv-Zugewiesen')).toBeTruthy();
    expect(view.queryByText('Inaktiv-Zugewiesen')).toBeNull();
    expect(view.queryByText('Ohne Kampagne')).toBeNull();
  });

  it('filters items by unassigned status', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const itemsStore = useItemsStore();
    const campaignsStore = useCampaignsStore();

    itemsStore.addItem(makeItem({ id: 'item-1', name: 'Zugewiesen' }));
    itemsStore.addItem(makeItem({ id: 'item-2', name: 'Frei' }));
    campaignsStore.addCampaign({
      id: 'camp-1',
      name: 'Alpha',
      description: '',
      status: 'active',
      notes: '',
      milestones: [],
    });
    campaignsStore.assignItem('camp-1', 'item-1');

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

    const campaignSelect = view
      .getAllByRole('combobox')
      .find((select) => select.textContent?.includes('Aktive Kampagnen'));
    await fireEvent.update(campaignSelect!, 'unassigned');

    expect(view.queryByText('Zugewiesen')).toBeNull();
    expect(view.getByText('Frei')).toBeTruthy();
  });

  it('resets all local filters to their defaults', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const itemsStore = useItemsStore();
    const campaignsStore = useCampaignsStore();

    itemsStore.addItem(makeItem({ id: 'item-1', name: 'Zugewiesen', archived: true }));
    itemsStore.addItem(makeItem({ id: 'item-2', name: 'Frei' }));
    campaignsStore.addCampaign({
      id: 'camp-1',
      name: 'Alpha',
      description: '',
      status: 'active',
      notes: '',
      milestones: [],
    });
    campaignsStore.assignItem('camp-1', 'item-1');

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

    const resetButton = view.getByLabelText('Filter zurücksetzen') as HTMLButtonElement;
    const searchInput = view.getByPlaceholderText('Gegenstand suchen...') as HTMLInputElement;
    const selects = view.getAllByRole('combobox') as HTMLSelectElement[];
    const campaignSelect = selects.find((select) => select.textContent?.includes('Aktive Kampagnen'));
    const sortSelect = selects.find((select) => select.textContent?.includes('Name (A–Z)'));

    await fireEvent.update(searchInput, 'frei');
    await fireEvent.update(campaignSelect!, 'unassigned');
    await fireEvent.update(sortSelect!, 'name-desc');
    await fireEvent.click(view.getByText('Zeige archivierte Gegenstände'));

    expect(resetButton.disabled).toBe(false);

    await fireEvent.click(resetButton);

    expect(searchInput.value).toBe('');
    expect(campaignSelect?.value).toBe('active');
    expect(sortSelect?.value).toBe('name-asc');
    expect(view.queryByText('Zugewiesen')).toBeNull();
    expect(resetButton.disabled).toBe(true);
  });

  describe('hidden items section', () => {
    it('shows hidden items in a dedicated Versteckt section in GM mode', () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const itemsStore = useItemsStore();
      const gmStore = useGMModeStore();
      gmStore.isGMMode = true;

      itemsStore.addItem(makeItem({ id: 'item-1', name: 'Normaler Gegenstand', hidden: false }));
      itemsStore.addItem(makeItem({ id: 'item-2', name: 'Versteckter Gegenstand', hidden: true }));

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

      expect(view.getByText('Normaler Gegenstand')).toBeTruthy();
      expect(view.getByText('Versteckt')).toBeTruthy();
      expect(view.getByText('Versteckter Gegenstand')).toBeTruthy();
      const content = view.container.textContent ?? '';
      expect(content.indexOf('Normaler Gegenstand')).toBeLessThan(
        content.indexOf('Versteckter Gegenstand'),
      );
    });

    it('does not render the Versteckt section when GM mode is off', () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const itemsStore = useItemsStore();
      const gmStore = useGMModeStore();
      gmStore.isGMMode = false;
      itemsStore.addItem(makeItem({ id: 'item-hidden', name: 'Hidden Item', hidden: true }));

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

      expect(view.queryByText('Versteckt')).toBeNull();
      expect(view.queryByText('Hidden Item')).toBeNull();
    });

    it('renders hidden item cards only once (no duplicate between top list and section)', () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const itemsStore = useItemsStore();
      const gmStore = useGMModeStore();
      gmStore.isGMMode = true;

      itemsStore.addItem(makeItem({ id: 'item-hidden', name: 'Einmal', hidden: true }));

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

      expect(view.queryAllByText('Einmal')).toHaveLength(1);
    });

    it('does not show an empty state when only hidden items are visible in GM mode', () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const itemsStore = useItemsStore();
      const gmStore = useGMModeStore();
      gmStore.isGMMode = true;

      itemsStore.addItem(makeItem({ id: 'item-hidden', name: 'Nur Versteckt', hidden: true }));

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

      expect(view.queryByText('Keine Treffer gefunden.')).toBeNull();
      expect(view.getByText('Versteckt')).toBeTruthy();
      expect(view.getByText('Nur Versteckt')).toBeTruthy();
    });

    it('removes the GM badge from hidden items', () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const itemsStore = useItemsStore();
      const gmStore = useGMModeStore();
      gmStore.isGMMode = true;

      itemsStore.addItem(makeItem({ id: 'item-hidden', name: 'Badge Test', hidden: true }));

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

      expect(view.queryByText('GM')).toBeNull();
    });
  });
});
