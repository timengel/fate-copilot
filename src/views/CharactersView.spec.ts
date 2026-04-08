import { render, fireEvent } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import CharactersView from './CharactersView.vue';
import { useCharactersStore } from '../stores/characters';
import { useCampaignsStore } from '../stores/campaigns';
import { useGMModeStore } from '../stores/gmMode';
import { useToastStore } from '../stores/toast';
import type { Character } from '../types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
let mockRouteQuery: Record<string, string> = {};
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ query: mockRouteQuery }),
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
    mockRouteQuery = {};
  });

  function setup() {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useCharactersStore();
    useGMModeStore().isGMMode = false;
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

  function setupGM(overrides: Partial<Character> = {}) {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useCharactersStore();
    const gmStore = useGMModeStore();
    gmStore.isGMMode = true;
    const char = makeCharacter(overrides);
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
    return { ...result, store, charId: char.id };
  }

  it('clicking the card navigates to the character view page', async () => {
    const { getByRole, charId } = setup();
    await fireEvent.click(getByRole('button', { name: /Test Charakter/ }));
    expect(mockPush).toHaveBeenCalledWith(`/characters/${charId}`);
  });

  it('clicking the edit button navigates to the edit page without triggering card navigation', async () => {
    const { getByLabelText, charId } = setup();
    await fireEvent.click(getByLabelText('Charakter bearbeiten'));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(`/characters/${charId}/edit`);
  });

  it('clicking quick archive does not trigger navigation', async () => {
    const { getByLabelText } = setup();
    await fireEvent.click(getByLabelText('Charakter archivieren'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows a quick archive button in GM mode', () => {
    const { getByLabelText } = setupGM();
    expect(getByLabelText('Charakter archivieren')).toBeTruthy();
  });

  it('does not show a delete button in non-GM mode', () => {
    const { container } = setup();
    expect(container.querySelector('.fate-btn--danger')).toBeNull();
  });

  it('hides the character tab selector when GM mode is off', () => {
    const { queryByRole } = setup();
    expect(queryByRole('tablist', { name: 'Charaktertyp' })).toBeNull();
  });

  it('shows the character tab selector when GM mode is on', () => {
    const { getByRole } = setupGM();
    expect(getByRole('tablist', { name: 'Charaktertyp' })).toBeTruthy();
  });

  it('quick archive toggles the archived flag without navigation', async () => {
    const { getByLabelText, store, charId } = setupGM();
    const toastStore = useToastStore();
    await fireEvent.click(getByLabelText('Charakter archivieren'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(store.getById(charId)?.archived).toBe(true);
    expect(toastStore.message).toBe('Charakter "Test Charakter" archiviert');
  });

  it('shows an unarchive button for archived characters in GM mode when archived entries are shown', async () => {
    const { getByLabelText, getByText } = setupGM({ archived: true });
    await fireEvent.click(getByText('Zeige archivierte Charaktere'));
    expect(getByLabelText('Charakter entarchivieren')).toBeTruthy();
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
      await fireEvent.click(getByLabelText('Charakter kopieren'));
      expect(writeText).toHaveBeenCalledOnce();
    });

    it('clipboard JSON contains the character name', async () => {
      const { getByLabelText } = setup();
      await fireEvent.click(getByLabelText('Charakter kopieren'));
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.name).toBe('Test Charakter');
    });

    it('clipboard JSON contains the correct character type', async () => {
      const { getByLabelText } = setup();
      await fireEvent.click(getByLabelText('Charakter kopieren'));
      const parsed = JSON.parse(writeText.mock.calls[0]![0] as string);
      expect(parsed.type).toBe('sc');
    });

    it('clicking the copy button does not trigger navigation', async () => {
      const { getByLabelText } = setup();
      await fireEvent.click(getByLabelText('Charakter kopieren'));
      expect(mockPush).not.toHaveBeenCalled();
    });
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

    const view = render(CharactersView, {
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

  it('filters characters by assigned campaign', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const charactersStore = useCharactersStore();
    const campaignsStore = useCampaignsStore();

    charactersStore.addCharacter(makeCharacter({ id: 'char-1', name: 'Alpha-Held' }));
    charactersStore.addCharacter(makeCharacter({ id: 'char-2', name: 'Beta-Held' }));
    campaignsStore.addCampaign({
      id: 'camp-1',
      name: 'Alpha',
      description: '',
      status: 'active',
      notes: '',
      milestones: [],
    });
    campaignsStore.assignCharacter('camp-1', 'char-1');

    const view = render(CharactersView, {
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

    expect(view.getByText('Alpha-Held')).toBeTruthy();
    expect(view.queryByText('Beta-Held')).toBeNull();
  });

  it('shows only characters assigned to active campaigns by default when active campaigns exist', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const charactersStore = useCharactersStore();
    const campaignsStore = useCampaignsStore();

    charactersStore.addCharacter(makeCharacter({ id: 'char-1', name: 'Aktiv-Zugewiesen' }));
    charactersStore.addCharacter(makeCharacter({ id: 'char-2', name: 'Inaktiv-Zugewiesen' }));
    charactersStore.addCharacter(makeCharacter({ id: 'char-3', name: 'Ohne Kampagne' }));
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
    campaignsStore.assignCharacter('camp-active', 'char-1');
    campaignsStore.assignCharacter('camp-inactive', 'char-2');

    const view = render(CharactersView, {
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

  it('filters characters by unassigned status', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const charactersStore = useCharactersStore();
    const campaignsStore = useCampaignsStore();

    charactersStore.addCharacter(makeCharacter({ id: 'char-1', name: 'Zugewiesen' }));
    charactersStore.addCharacter(makeCharacter({ id: 'char-2', name: 'Frei' }));
    campaignsStore.addCampaign({
      id: 'camp-1',
      name: 'Alpha',
      description: '',
      status: 'active',
      notes: '',
      milestones: [],
    });
    campaignsStore.assignCharacter('camp-1', 'char-1');

    const view = render(CharactersView, {
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

  it('shows the first two normal aspects for NSC cards instead of legacy highConcept and trouble', () => {
    mockRouteQuery = { tab: 'nsc' };
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useCharactersStore();
    const gmStore = useGMModeStore();
    gmStore.isGMMode = true;

    store.addCharacter(
      makeCharacter({
        id: 'nsc-1',
        type: 'nsc',
        name: 'Wache',
        highConcept: 'Altes Konzept',
        trouble: 'Altes Dilemma',
        aspects: ['Misstrauisch', 'Unter Druck'],
      }),
    );

    const view = render(CharactersView, {
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

    expect(view.getByText('Misstrauisch')).toBeTruthy();
    expect(view.getByText('Unter Druck')).toBeTruthy();
    expect(view.queryByText('Altes Konzept')).toBeNull();
    expect(view.queryByText('Altes Dilemma')).toBeNull();
  });

  it('resets all local filters to their defaults without changing the tab', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const charactersStore = useCharactersStore();
    const campaignsStore = useCampaignsStore();
    const gmStore = useGMModeStore();
    gmStore.isGMMode = true;

    charactersStore.addCharacter(makeCharacter({ id: 'char-1', name: 'Zugewiesen', type: 'sc', archived: true }));
    charactersStore.addCharacter(makeCharacter({ id: 'char-2', name: 'Frei', type: 'sc' }));
    campaignsStore.addCampaign({
      id: 'camp-1',
      name: 'Alpha',
      description: '',
      status: 'active',
      notes: '',
      milestones: [],
    });
    campaignsStore.assignCharacter('camp-1', 'char-1');

    const view = render(CharactersView, {
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
    const searchInput = view.getByPlaceholderText('Charakter suchen...') as HTMLInputElement;
    const selects = view.getAllByRole('combobox') as HTMLSelectElement[];
    const campaignSelect = selects.find((select) => select.textContent?.includes('Aktive Kampagnen'));
    const sortSelect = selects.find((select) => select.textContent?.includes('Name (A–Z)'));

    await fireEvent.update(searchInput, 'frei');
    await fireEvent.update(campaignSelect!, 'unassigned');
    await fireEvent.update(sortSelect!, 'name-desc');
    await fireEvent.click(view.getByText('Zeige archivierte Charaktere'));

    expect(resetButton.disabled).toBe(false);

    await fireEvent.click(resetButton);

    expect(searchInput.value).toBe('');
    expect(campaignSelect?.value).toBe('active');
    expect(sortSelect?.value).toBe('name-asc');
    expect(view.getByRole('button', { name: 'Spieler (SC)' }).getAttribute('aria-selected')).toBe(
      'true',
    );
    expect(view.queryByText('Zugewiesen')).toBeNull();
    expect(resetButton.disabled).toBe(true);
  });
});
