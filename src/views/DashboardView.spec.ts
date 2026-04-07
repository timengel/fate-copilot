import { render, fireEvent } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, defineComponent, h, type PropType } from 'vue';
import DashboardView from './DashboardView.vue';
import { useCampaignsStore } from '../stores/campaigns';
import { useItemsStore } from '../stores/items';
import { useGMModeStore } from '../stores/gmMode';
import { useToastStore } from '../stores/toast';
import { useCharactersStore } from '../stores/characters';
import { useCharacterItemsStore } from '../stores/characterItems';
import { useTimerStore } from '../stores/timer';
import type { Campaign, Item } from '../types';
import type { Character } from '../types';

const mockRouterPush = vi.fn();

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRouter: () => ({
      push: mockRouterPush,
    }),
  };
});

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    ...overrides,
    id: overrides.id ?? 'campaign-1',
    name: overrides.name ?? 'Testkampagne',
    description: overrides.description ?? '',
    status: overrides.status ?? 'active',
    notes: overrides.notes ?? '',
    milestones: overrides.milestones ?? [],
  };
}

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    ...overrides,
    id: overrides.id ?? 'item-1',
    type: 'item',
    archived: overrides.archived ?? false,
    name: overrides.name ?? 'Altes Schwert',
    description: overrides.description ?? '',
    aspects: overrides.aspects ?? [],
    stunts: overrides.stunts ?? [],
    extras: overrides.extras ?? '',
    stressPhysical: overrides.stressPhysical ?? [],
    stressMental: overrides.stressMental ?? [],
    hidden: overrides.hidden ?? false,
    redDice: overrides.redDice ?? 0,
    blueDice: overrides.blueDice ?? 0,
  };
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    ...overrides,
    id: overrides.id ?? 'character-1',
    type: overrides.type ?? 'sc',
    archived: overrides.archived ?? false,
    name: overrides.name ?? 'Alrik',
    description: overrides.description ?? '',
    highConcept: overrides.highConcept ?? '',
    trouble: overrides.trouble ?? '',
    aspects: overrides.aspects ?? [],
    skills: overrides.skills ?? [],
    stunts: overrides.stunts ?? [],
    consequences: overrides.consequences ?? [],
    stressPhysical: overrides.stressPhysical ?? [],
    stressMental: overrides.stressMental ?? [],
    notes: overrides.notes ?? '',
    gmNotes: overrides.gmNotes ?? '',
    extras: overrides.extras ?? '',
    refresh: overrides.refresh ?? 0,
    fatePoints: overrides.fatePoints ?? 0,
    redDice: overrides.redDice ?? 0,
    blueDice: overrides.blueDice ?? 0,
  };
}

const filterStubs = {
  FateButton: { template: '<button><slot /></button>' },
  FateIcon: { template: '<span />' },
  FateCheatSheet: {
    props: ['variant'],
    template:
      '<section aria-label="Fate cheat sheet" :data-variant="variant">Cheat Sheet Popover</section>',
  },
  FateDropdown: {
    props: ['modelValue', 'options', 'placeholder'],
    template: `
      <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
        <option value="">{{ placeholder }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
    `,
  },
  FateRadioButtonGroup: { template: '<div />' },
  CharacterSheet: { template: '<div />' },
  ItemSheet: { template: '<div />' },
};

beforeEach(() => {
  mockRouterPush.mockReset();
});

function setupFilters() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return render(DashboardView, { global: { plugins: [pinia], stubs: filterStubs } });
}

describe('DashboardView floating action menu', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setupFab(gmMode: boolean) {
    const pinia = createPinia();
    setActivePinia(pinia);
    useGMModeStore().isGMMode = gmMode;
    return render(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: filterStubs,
      },
    });
  }

  it('shows the floating action menu when GM mode is off', () => {
    const { getByRole } = setupFab(false);
    expect(getByRole('button', { name: 'Schnellaktionen öffnen' })).toBeTruthy();
  });

  it('toggles the floating action menu when GM mode is on', async () => {
    const { getByRole, queryByRole } = setupFab(true);
    const trigger = getByRole('button', { name: 'Schnellaktionen öffnen' });

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(queryByRole('button', { name: 'Cheat Sheet öffnen' })).toBeNull();
    expect(queryByRole('button', { name: 'Timer' })).toBeNull();

    await fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(getByRole('button', { name: 'Cheat Sheet öffnen' })).toBeTruthy();
    expect(getByRole('button', { name: 'Timer' })).toBeTruthy();

    await fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(queryByRole('button', { name: 'Cheat Sheet öffnen' })).toBeNull();
    expect(queryByRole('button', { name: 'Timer' })).toBeNull();
  });

  it('uses popovertarget wiring for the cheat sheet FAB action', async () => {
    const { container, getByRole, queryByRole } = setupFab(true);
    const trigger = getByRole('button', { name: 'Schnellaktionen öffnen' });

    await fireEvent.click(trigger);
    const actionButton = getByRole('button', { name: 'Cheat Sheet öffnen' });
    await fireEvent.click(actionButton);

    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(queryByRole('button', { name: 'Cheat Sheet öffnen' })).toBeNull();
    expect(actionButton.getAttribute('popovertarget')).toBe('dashboard-cheat-sheet-popover');
    expect(actionButton.getAttribute('popovertargetaction')).toBe('toggle');
    expect(container.querySelector('#dashboard-cheat-sheet-popover')?.getAttribute('popover')).toBe(
      'auto',
    );
  });

  it('uses Popover API auto mode for light-dismiss behavior', () => {
    const { container } = setupFab(true);
    expect(container.querySelector('.cheat-sheet-popover')?.getAttribute('popover')).toBe('auto');
  });

  it('timer FAB action toggles global timer popover state and closes the menu', async () => {
    const { getByRole, queryByRole } = setupFab(true);
    const timerStore = useTimerStore();
    const trigger = getByRole('button', { name: 'Schnellaktionen öffnen' });

    expect(timerStore.isPopoverOpen).toBe(false);

    await fireEvent.click(trigger);
    const timerButton = getByRole('button', { name: 'Timer' });
    await fireEvent.click(timerButton);

    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(timerStore.isPopoverOpen).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(queryByRole('button', { name: 'Timer' })).toBeNull();
    expect(timerButton.getAttribute('popovertarget')).toBeNull();
    expect(timerButton.getAttribute('popovertargetaction')).toBeNull();
  });

  it('renders the basic cheat sheet variant in non-GM mode', () => {
    const { container } = setupFab(false);
    expect(container.querySelector('[aria-label="Fate cheat sheet"]')?.getAttribute('data-variant')).toBe(
      'basic',
    );
  });
});

describe('DashboardView inline filter collapsing', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('hides the filters body by default', () => {
    const { container } = setupFilters();
    expect(container.querySelector('.filters-body')).toBeNull();
  });

  it('shows the filters body when the Filter toggle is clicked', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector<HTMLElement>('.filters-toggle')!);
    expect(container.querySelector('.filters-body')).toBeTruthy();
  });

  it('hides the filters body again when the Filter toggle is clicked twice', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector<HTMLElement>('.filters-toggle')!);
    await fireEvent.click(container.querySelector<HTMLElement>('.filters-toggle')!);
    expect(container.querySelector('.filters-body')).toBeNull();
  });

  it('all sections are collapsed by default when filters are opened', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector<HTMLElement>('.filters-toggle')!);
    expect(container.querySelectorAll('.filters-section-body').length).toBe(0);
  });

  it('clicking a section toggle expands only that section', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector<HTMLElement>('.filters-toggle')!);
    const sectionToggles = container.querySelectorAll<HTMLElement>('.filters-section-toggle');
    await fireEvent.click(sectionToggles[1]!); // Karaktere section
    expect(container.querySelectorAll('.filters-section-body').length).toBe(1);
  });

  it('clicking an expanded section toggle collapses it', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector<HTMLElement>('.filters-toggle')!);
    const toggle = container.querySelectorAll<HTMLElement>('.filters-section-toggle')[0]!;
    await fireEvent.click(toggle);
    expect(container.querySelectorAll('.filters-section-body').length).toBe(1);
    await fireEvent.click(toggle);
    expect(container.querySelectorAll('.filters-section-body').length).toBe(0);
  });

  it('expand-all button opens the filters panel and expands all sections', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector<HTMLElement>('.filters-expand-all')!);
    expect(container.querySelector('.filters-body')).toBeTruthy();
    expect(container.querySelectorAll('.filters-section-body').length).toBe(5);
  });

  it('expand-all button becomes collapse-all when at least one section is expanded', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector<HTMLElement>('.filters-toggle')!);
    await fireEvent.click(container.querySelectorAll<HTMLElement>('.filters-section-toggle')[0]!);
    expect(container.querySelector<HTMLElement>('.filters-expand-all')!.title).toBe(
      'Alle zuklappen',
    );
  });

  it('collapse-all button collapses all sections', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector<HTMLElement>('.filters-expand-all')!); // expand all
    await fireEvent.click(container.querySelector<HTMLElement>('.filters-expand-all')!); // collapse all
    expect(container.querySelectorAll('.filters-section-body').length).toBe(0);
  });
});

describe('DashboardView character sheet item navigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('disables assigned item navigation on dashboard character sheets', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    const charactersStore = useCharactersStore();

    campaignsStore.addCampaign(makeCampaign());
    charactersStore.addCharacter(makeCharacter({ id: 'character-1', name: 'Alrik' }));
    campaignsStore.assignCharacter('campaign-1', 'character-1');

    const view = render(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateButton: { template: '<button><slot /></button>' },
          FateDropdown: {
            props: ['modelValue', 'options', 'placeholder'],
            template: `
              <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
                <option value="">{{ placeholder }}</option>
                <option v-for="option in options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            `,
          },
          FateRadioButtonGroup: { template: '<div />' },
          CharacterSheet: {
            props: ['disableAssignedItemNavigation'],
            template:
              '<div class="character-sheet-stub">{{ disableAssignedItemNavigation ? "disabled" : "enabled" }}</div>',
          },
          ItemSheet: { template: '<div />' },
        },
      },
    });

    expect(view.getByText('disabled')).toBeTruthy();
  });

  it('stages dashboard character item unassignments until save', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    const charactersStore = useCharactersStore();
    const itemsStore = useItemsStore();
    const characterItemsStore = useCharacterItemsStore();
    const gmModeStore = useGMModeStore();

    gmModeStore.isGMMode = true;

    const campaign = makeCampaign();
    const character = makeCharacter({ id: 'character-1', name: 'Alrik' });
    const item = makeItem({ id: 'item-1', name: 'Schwert' });

    campaignsStore.addCampaign(campaign);
    charactersStore.addCharacter(character);
    itemsStore.addItem(item);
    campaignsStore.assignCharacter(campaign.id, character.id);
    campaignsStore.assignItem(campaign.id, item.id);
    characterItemsStore.assignItem(character.id, item.id);

    const view = render(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateButton: { template: '<button><slot /></button>' },
          FateDropdown: {
            props: ['modelValue', 'options', 'placeholder'],
            template: `
              <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
                <option value="">{{ placeholder }}</option>
                <option v-for="option in options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            `,
          },
          FateRadioButtonGroup: { template: '<div />' },
          CharacterSheet: {
            props: ['character', 'mode', 'assignedItems', 'externalDirty'],
            emits: ['save', 'cancel', 'assign-item', 'unassign-item'],
            template: `
              <div>
                <span class="character-name">{{ character.name }}</span>
                <slot v-if="mode !== 'edit'" name="name-bar-actions" />
                <span class="assigned">{{ (assignedItems || []).map((entry) => entry.name).join(',') }}</span>
                <span class="dirty">{{ externalDirty ? 'dirty' : 'clean' }}</span>
                <button v-if="mode === 'edit'" class="save" @click="$emit('save', character)">save-now</button>
                <button v-if="mode === 'edit'" class="unassign" @click="$emit('unassign-item', 'item-1')">unassign</button>
              </div>
            `,
          },
          ItemSheet: { template: '<div />' },
        },
      },
    });

    await fireEvent.click(view.container.querySelector<HTMLButtonElement>('.dashboard-entry button')!);
    expect(view.container.querySelector('.assigned')?.textContent).toContain('Schwert');

    await fireEvent.click(view.container.querySelector<HTMLButtonElement>('.unassign')!);
    expect(view.container.querySelector('.assigned')?.textContent).toBe('');
    expect(view.container.querySelector('.dirty')?.textContent).toBe('dirty');
    expect(
      characterItemsStore.getItemsForCharacter(character.id).map((entry) => entry.name),
    ).toEqual(['Schwert']);

    await fireEvent.click(view.container.querySelector<HTMLButtonElement>('.save')!);
    expect(characterItemsStore.getItemsForCharacter(character.id)).toHaveLength(0);
  });
});

describe('DashboardView archived item filter', () => {
  function getItemArchivedFilter(container: HTMLElement) {
    return container.querySelectorAll<HTMLLabelElement>('.sidebar-group .fate-checkbox')[3];
  }

  function getItemEditButton(container: HTMLElement) {
    return container.querySelector<HTMLButtonElement>('.item-name-bar-end button');
  }

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setup(itemOverrides: Partial<Item> = {}, isGMMode = false, stubItemSheet = true) {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    const itemsStore = useItemsStore();
    const gmModeStore = useGMModeStore();

    gmModeStore.isGMMode = isGMMode;

    const campaign = makeCampaign();
    const item = makeItem(itemOverrides);

    campaignsStore.addCampaign(campaign);
    itemsStore.addItem(item);
    campaignsStore.assignItem(campaign.id, item.id);

    return render(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateButton: { template: '<button><slot /></button>' },
          FateDropdown: {
            props: ['modelValue', 'options', 'placeholder'],
            template: `
              <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
                <option value="">{{ placeholder }}</option>
                <option v-for="option in options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            `,
          },
          FateRadioButtonGroup: { template: '<div />' },
          CharacterSheet: { template: '<div class="character-sheet-stub" />' },
          ItemSheet: stubItemSheet
            ? {
                props: ['item'],
                template: '<div class="item-sheet-stub">{{ item.name }}</div>',
              }
            : false,
        },
      },
    });
  }

  it('hides archived items by default and shows them when the archived filter is enabled', async () => {
    const view = setup({ archived: true });

    expect(view.queryByText('Altes Schwert')).toBeNull();

    await fireEvent.click(getItemArchivedFilter(view.container as HTMLElement)!);

    expect(view.getByText('Altes Schwert')).toBeTruthy();
  });

  it('still hides hidden archived items for non-GM users even when the archived filter is enabled', async () => {
    const view = setup({ archived: true, hidden: true });

    await fireEvent.click(getItemArchivedFilter(view.container as HTMLElement)!);

    expect(view.queryByText('Altes Schwert')).toBeNull();
  });

  it('shows an edit button for visible items when editing is enabled', () => {
    const view = setup({}, false, false);
    expect(getItemEditButton(view.container as HTMLElement)).toBeTruthy();
  });

  it('switches an item into edit mode and cancels without saving', async () => {
    const view = setup({}, false, false);
    await fireEvent.click(getItemEditButton(view.container as HTMLElement)!);
    expect(view.getByText('Abbrechen')).toBeTruthy();
    expect(view.getByText('Speichern')).toBeTruthy();

    await fireEvent.click(view.getByText('Abbrechen').closest('button') as HTMLButtonElement);
    expect(getItemEditButton(view.container as HTMLElement)).toBeTruthy();
  });

  it('saves an edited item inline and shows a success toast', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    const itemsStore = useItemsStore();
    const toastStore = useToastStore();
    const gmModeStore = useGMModeStore();

    gmModeStore.isGMMode = true;

    const campaign = makeCampaign();
    const item = makeItem();

    campaignsStore.addCampaign(campaign);
    itemsStore.addItem(item);
    campaignsStore.assignItem(campaign.id, item.id);

    const updateSpy = vi.spyOn(itemsStore, 'updateItem');

    const view = render(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateDropdown: {
            props: ['modelValue', 'options', 'placeholder'],
            template: `
              <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
                <option value="">{{ placeholder }}</option>
                <option v-for="option in options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            `,
          },
          FateRadioButtonGroup: { template: '<div />' },
          CharacterSheet: { template: '<div class="character-sheet-stub" />' },
        },
      },
    });

    await fireEvent.click(getItemEditButton(view.container as HTMLElement)!);
    await fireEvent.update(view.getByPlaceholderText('Name des Gegenstands'), 'Neues Schwert');
    await fireEvent.click(view.getByText('Speichern').closest('button') as HTMLButtonElement);

    expect(updateSpy).toHaveBeenCalledOnce();
    expect(updateSpy.mock.calls[0]?.[0].name).toBe('Neues Schwert');
    expect(toastStore.message).toBe('Gegenstand gespeichert');
  });
});

describe('DashboardView character edit switching', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setupCharacterSwitching(options: { dirtyCharacterIds?: string[] } = {}) {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    const charactersStore = useCharactersStore();

    const campaign = makeCampaign();
    const firstCharacter = makeCharacter({ id: 'character-1', name: 'Alrik' });
    const secondCharacter = makeCharacter({ id: 'character-2', name: 'Bea' });

    campaignsStore.addCampaign(campaign);
    charactersStore.addCharacter(firstCharacter);
    charactersStore.addCharacter(secondCharacter);
    campaignsStore.assignCharacter(campaign.id, firstCharacter.id);
    campaignsStore.assignCharacter(campaign.id, secondCharacter.id);

    const dirtyIds = new Set(options.dirtyCharacterIds ?? []);

    const CharacterSheetStub = defineComponent({
      props: {
        character: {
          type: Object as PropType<Character>,
          required: true,
        },
        mode: {
          type: String as PropType<string | undefined>,
          required: false,
        },
      },
      emits: ['save', 'cancel', 'assign-item', 'unassign-item'],
      setup(props, { emit, slots, expose }) {
        const isDirty = computed(() => props.mode === 'edit' && dirtyIds.has(props.character.id));

        function save() {
          emit('save', {
            ...props.character,
            name: `${props.character.name} gespeichert`,
          });
        }

        expose({ save, isDirty });

        return () =>
          h('div', { class: 'character-sheet-switch-stub' }, [
            h('span', { class: 'character-name' }, props.character.name),
            props.mode === 'edit'
              ? h('span', { class: 'editing-indicator' }, `editing-${props.character.id}`)
              : null,
            props.mode === 'edit'
              ? slots['edit-bar-actions']?.({ isDirty: isDirty.value })
              : slots['name-bar-actions']?.(),
          ]);
      },
    });

    const view = render(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateDropdown: {
            props: ['modelValue', 'options', 'placeholder'],
            template: `
              <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
                <option value="">{{ placeholder }}</option>
                <option v-for="option in options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            `,
          },
          FateRadioButtonGroup: { template: '<div />' },
          CharacterSheet: CharacterSheetStub,
          ItemSheet: { template: '<div />' },
        },
      },
    });

    return { view, charactersStore };
  }

  function getEditButtons(view: ReturnType<typeof render>): HTMLButtonElement[] {
    return view
      .getAllByText('Bearbeiten')
      .map((element) => element.closest('button'))
      .filter((button): button is HTMLButtonElement => button instanceof HTMLButtonElement);
  }

  it('disables the inline character save button until there are changes', async () => {
    const { view } = setupCharacterSwitching();
    const editButtons = getEditButtons(view);

    await fireEvent.click(editButtons[0]!);

    const saveButton = view.getByText('Speichern').closest('button') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  it('prompts before switching away from a dirty character edit session', async () => {
    const { view } = setupCharacterSwitching({ dirtyCharacterIds: ['character-1'] });
    const editButtons = getEditButtons(view);

    await fireEvent.click(editButtons[0]!);
    expect(view.getByText('editing-character-1')).toBeTruthy();

    await fireEvent.click(editButtons[1]!);

    expect(view.getByText('Ungespeicherte Aenderungen')).toBeTruthy();
    expect(view.getByText(/Du bearbeitest gerade „Alrik“\./)).toBeTruthy();
    expect(view.getByText(/bevor „Bea“ geoeffnet wird\?/)).toBeTruthy();
    expect(view.getByText('editing-character-1')).toBeTruthy();
  });

  it('saves the current character before switching when the user chooses Speichern', async () => {
    const { view, charactersStore } = setupCharacterSwitching({
      dirtyCharacterIds: ['character-1'],
    });
    const editButtons = getEditButtons(view);

    await fireEvent.click(editButtons[0]!);
    await fireEvent.click(editButtons[1]!);
    await fireEvent.click(
      view.container.querySelector<HTMLButtonElement>('.dialog-overlay .fate-btn--primary')!,
    );

    expect(charactersStore.getById('character-1')?.name).toBe('Alrik gespeichert');
    expect(view.getByText('editing-character-2')).toBeTruthy();
  });

  it('discards the current character changes before switching when the user chooses Verwerfen', async () => {
    const { view, charactersStore } = setupCharacterSwitching({
      dirtyCharacterIds: ['character-1'],
    });
    const editButtons = getEditButtons(view);

    await fireEvent.click(editButtons[0]!);
    await fireEvent.click(editButtons[1]!);
    await fireEvent.click(
      view.container.querySelector<HTMLButtonElement>(
        '.dialog-overlay .fate-btn--danger-outline',
      )!,
    );

    expect(charactersStore.getById('character-1')?.name).toBe('Alrik');
    expect(view.getByText('editing-character-2')).toBeTruthy();
  });

  it('keeps the current character in edit mode when the user cancels the switch', async () => {
    const { view } = setupCharacterSwitching({ dirtyCharacterIds: ['character-1'] });
    const editButtons = getEditButtons(view);

    await fireEvent.click(editButtons[0]!);
    await fireEvent.click(editButtons[1]!);
    await fireEvent.click(
      view.container.querySelector<HTMLButtonElement>('.dialog-overlay .fate-btn--secondary')!,
    );

    expect(view.queryByText('Ungespeicherte Aenderungen')).toBeNull();
    expect(view.getByText('editing-character-1')).toBeTruthy();
    expect(view.queryByText('editing-character-2')).toBeNull();
  });
});

describe('DashboardView campaign filter', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('defaults the campaign dropdown to active campaigns', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    campaignsStore.addCampaign(makeCampaign({ id: 'campaign-1', name: 'Aktiv' }));

    const view = render(DashboardView, {
      global: { plugins: [pinia], stubs: filterStubs },
    });
    const dropdown = [...view.container.querySelectorAll<HTMLSelectElement>('select')].find(
      (select) => [...select.options].some((option) => option.value === 'active'),
    );

    expect(dropdown).toBeTruthy();
    expect(dropdown?.value).toBe('active');
  });

  it('shows only entries assigned to active campaigns by default', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    const charactersStore = useCharactersStore();

    const activeCampaign = makeCampaign({ id: 'campaign-active', name: 'Aktiv', status: 'active' });
    const inactiveCampaign = makeCampaign({
      id: 'campaign-inactive',
      name: 'Inaktiv',
      status: 'inactive',
    });
    const activeCharacter = makeCharacter({ id: 'character-active', name: 'Aktive Figur' });
    const inactiveCharacter = makeCharacter({ id: 'character-inactive', name: 'Inaktive Figur' });

    campaignsStore.addCampaign(activeCampaign);
    campaignsStore.addCampaign(inactiveCampaign);
    charactersStore.addCharacter(activeCharacter);
    charactersStore.addCharacter(inactiveCharacter);
    campaignsStore.assignCharacter(activeCampaign.id, activeCharacter.id);
    campaignsStore.assignCharacter(inactiveCampaign.id, inactiveCharacter.id);

    const view = render(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateButton: { template: '<button><slot /></button>' },
          FateDropdown: {
            props: ['modelValue', 'options', 'placeholder'],
            template: `
              <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
                <option value="">{{ placeholder }}</option>
                <option v-for="option in options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            `,
          },
          FateRadioButtonGroup: { template: '<div />' },
          CharacterSheet: {
            props: ['character'],
            template: '<div>{{ character.name }}</div>',
          },
          ItemSheet: { template: '<div />' },
        },
      },
    });

    expect(view.getByText('Aktive Figur')).toBeTruthy();
    expect(view.queryByText('Inaktive Figur')).toBeNull();
  });
});
