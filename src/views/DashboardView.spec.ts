import { render, fireEvent } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardView from './DashboardView.vue';
import { useCampaignsStore } from '../stores/campaigns';
import { useItemsStore } from '../stores/items';
import { useGMModeStore } from '../stores/gmMode';
import { useToastStore } from '../stores/toast';
import { useCharactersStore } from '../stores/characters';
import { useCharacterItemsStore } from '../stores/characterItems';
import type { Campaign, Item } from '../types';
import type { Character } from '../types';

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'campaign-1',
    name: 'Testkampagne',
    description: '',
    status: 'active',
    notes: '',
    milestones: [],
    ...overrides,
  };
}

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    type: 'item',
    archived: false,
    name: 'Altes Schwert',
    description: '',
    aspects: [],
    stunts: [],
    extras: '',
    stressPhysical: [],
    stressMental: [],
    hidden: false,
    redDice: 0,
    blueDice: 0,
    ...overrides,
  };
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'character-1',
    type: 'sc',
    archived: false,
    name: 'Alrik',
    highConcept: '',
    trouble: '',
    aspects: [],
    skills: [],
    stunts: [],
    consequences: [],
    stressPhysical: [],
    stressMental: [],
    notes: '',
    gmNotes: '',
    extras: '',
    redDice: 0,
    blueDice: 0,
    ...overrides,
  };
}

const filterStubs = {
  FateButton: { template: '<button><slot /></button>' },
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

function setupFilters() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return render(DashboardView, { global: { plugins: [pinia], stubs: filterStubs } });
}

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
    await fireEvent.click(container.querySelector('.filters-toggle')!);
    expect(container.querySelector('.filters-body')).toBeTruthy();
  });

  it('hides the filters body again when the Filter toggle is clicked twice', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector('.filters-toggle')!);
    await fireEvent.click(container.querySelector('.filters-toggle')!);
    expect(container.querySelector('.filters-body')).toBeNull();
  });

  it('all sections are collapsed by default when filters are opened', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector('.filters-toggle')!);
    expect(container.querySelectorAll('.filters-section-body').length).toBe(0);
  });

  it('clicking a section toggle expands only that section', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector('.filters-toggle')!);
    const sectionToggles = container.querySelectorAll<HTMLElement>('.filters-section-toggle');
    await fireEvent.click(sectionToggles[1]!); // Karaktere section
    expect(container.querySelectorAll('.filters-section-body').length).toBe(1);
  });

  it('clicking an expanded section toggle collapses it', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector('.filters-toggle')!);
    const toggle = container.querySelectorAll<HTMLElement>('.filters-section-toggle')[0]!;
    await fireEvent.click(toggle);
    expect(container.querySelectorAll('.filters-section-body').length).toBe(1);
    await fireEvent.click(toggle);
    expect(container.querySelectorAll('.filters-section-body').length).toBe(0);
  });

  it('expand-all button opens the filters panel and expands all sections', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector('.filters-expand-all')!);
    expect(container.querySelector('.filters-body')).toBeTruthy();
    expect(container.querySelectorAll('.filters-section-body').length).toBe(5);
  });

  it('expand-all button becomes collapse-all when at least one section is expanded', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector('.filters-toggle')!);
    await fireEvent.click(container.querySelectorAll<HTMLElement>('.filters-section-toggle')[0]!);
    expect(container.querySelector<HTMLElement>('.filters-expand-all')!.title).toBe('Alle zuklappen');
  });

  it('collapse-all button collapses all sections', async () => {
    const { container } = setupFilters();
    await fireEvent.click(container.querySelector('.filters-expand-all')!); // expand all
    await fireEvent.click(container.querySelector('.filters-expand-all')!); // collapse all
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
            template: '<div class="character-sheet-stub">{{ disableAssignedItemNavigation ? "disabled" : "enabled" }}</div>',
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

    await fireEvent.click(view.container.querySelector('.dashboard-entry button')!);
    expect(view.container.querySelector('.assigned')?.textContent).toContain('Schwert');

    await fireEvent.click(view.container.querySelector('.unassign')!);
    expect(view.container.querySelector('.assigned')?.textContent).toBe('');
    expect(view.container.querySelector('.dirty')?.textContent).toBe('dirty');
    expect(characterItemsStore.getItemsForCharacter(character.id).map((entry) => entry.name)).toEqual(['Schwert']);

    await fireEvent.click(view.container.querySelector('.save')!);
    expect(characterItemsStore.getItemsForCharacter(character.id)).toHaveLength(0);
  });
});

describe('DashboardView archived item filter', () => {
  function getItemArchivedFilter(container: HTMLElement) {
    return container.querySelectorAll<HTMLElement>('.sidebar-group .fate-checkbox')[3];
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

    await fireEvent.click(getItemArchivedFilter(view.container)!);

    expect(view.getByText('Altes Schwert')).toBeTruthy();
  });

  it('still hides hidden archived items for non-GM users even when the archived filter is enabled', async () => {
    const view = setup({ archived: true, hidden: true });

    await fireEvent.click(getItemArchivedFilter(view.container)!);

    expect(view.queryByText('Altes Schwert')).toBeNull();
  });

  it('shows an edit button for visible items when editing is enabled', () => {
    const view = setup({}, false, false);
    expect(getItemEditButton(view.container)).toBeTruthy();
  });

  it('switches an item into edit mode and cancels without saving', async () => {
    const view = setup({}, false, false);
    await fireEvent.click(getItemEditButton(view.container)!);
    expect(view.getByText('Abbrechen')).toBeTruthy();
    expect(view.getByText('Speichern')).toBeTruthy();

    await fireEvent.click(view.getByText('Abbrechen'));
    expect(getItemEditButton(view.container)).toBeTruthy();
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

    await fireEvent.click(getItemEditButton(view.container)!);
    await fireEvent.update(view.getByPlaceholderText('Name des Gegenstands'), 'Neues Schwert');
    await fireEvent.click(view.getByText('Speichern'));

    expect(updateSpy).toHaveBeenCalledOnce();
    expect(updateSpy.mock.calls[0]?.[0].name).toBe('Neues Schwert');
    expect(toastStore.message).toBe('Gegenstand gespeichert');
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
    const dropdown = [...view.container.querySelectorAll<HTMLSelectElement>('select')]
      .find((select) => [...select.options].some((option) => option.value === 'active'));

    expect(dropdown).toBeTruthy();
    expect(dropdown?.value).toBe('active');
  });

  it('shows only entries assigned to active campaigns by default', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    const charactersStore = useCharactersStore();

    const activeCampaign = makeCampaign({ id: 'campaign-active', name: 'Aktiv', status: 'active' });
    const inactiveCampaign = makeCampaign({ id: 'campaign-inactive', name: 'Inaktiv', status: 'inactive' });
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
