import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDashboardPreferencesStore } from './dashboardPreferences';

describe('useDashboardPreferencesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('has correct default values', () => {
    const store = useDashboardPreferencesStore();
    expect(store.selectedCampaignFilter).toBe('active');
    expect(store.showSC).toBe(true);
    expect(store.showNSC).toBe(true);
    expect(store.showArchivedCharacters).toBe(false);
    expect(store.showItems).toBe(true);
    expect(store.showArchivedItems).toBe(false);
    expect(store.showEditButton).toBe(true);
    expect(store.layout).toBe('list');
  });

  it('has all visibleSections enabled by default', () => {
    const store = useDashboardPreferencesStore();
    const sections = store.visibleSections;
    expect(sections.general).toBe(true);
    expect(sections.aspects).toBe(true);
    expect(sections.skills).toBe(true);
    expect(sections.extras).toBe(true);
    expect(sections.stunts).toBe(true);
    expect(sections.stress).toBe(true);
    expect(sections.consequences).toBe(true);
    expect(sections.gmNotes).toBe(true);
    expect(sections.dice).toBe(true);
    expect(sections.modifiers).toBe(true);
    expect(sections.items).toBe(true);
  });

  it('selectedCampaignFilter can be set', () => {
    const store = useDashboardPreferencesStore();
    store.selectedCampaignFilter = 'camp-1';
    expect(store.selectedCampaignFilter).toBe('camp-1');
  });

  it('layout can be switched to grid', () => {
    const store = useDashboardPreferencesStore();
    store.layout = 'grid';
    expect(store.layout).toBe('grid');
  });

  it('visibility flags can be toggled', () => {
    const store = useDashboardPreferencesStore();
    store.showSC = false;
    store.showNSC = false;
    store.showArchivedCharacters = true;
    store.showItems = false;
    store.showArchivedItems = true;
    store.showEditButton = false;
    expect(store.showSC).toBe(false);
    expect(store.showNSC).toBe(false);
    expect(store.showArchivedCharacters).toBe(true);
    expect(store.showItems).toBe(false);
    expect(store.showArchivedItems).toBe(true);
    expect(store.showEditButton).toBe(false);
  });

  it('individual visibleSections can be disabled', () => {
    const store = useDashboardPreferencesStore();
    store.visibleSections.skills = false;
    store.visibleSections.stress = false;
    store.visibleSections.items = false;
    expect(store.visibleSections.skills).toBe(false);
    expect(store.visibleSections.stress).toBe(false);
    expect(store.visibleSections.items).toBe(false);
    expect(store.visibleSections.aspects).toBe(true);
  });

  it('store id is dashboardPreferences', () => {
    const store = useDashboardPreferencesStore();
    expect(store.$id).toBe('dashboardPreferences');
  });

  it('reset restores all default values', () => {
    const store = useDashboardPreferencesStore();
    store.selectedCampaignFilter = 'camp-1';
    store.showSC = false;
    store.showNSC = false;
    store.showArchivedCharacters = true;
    store.showItems = false;
    store.showArchivedItems = true;
    store.showEditButton = false;
    store.layout = 'grid';
    store.visibleSections.skills = false;
    store.visibleSections.stress = false;
    store.visibleSections.modifiers = false;
    store.visibleSections.items = false;
    store.reset();
    expect(store.selectedCampaignFilter).toBe('active');
    expect(store.showSC).toBe(true);
    expect(store.showNSC).toBe(true);
    expect(store.showArchivedCharacters).toBe(false);
    expect(store.showItems).toBe(true);
    expect(store.showArchivedItems).toBe(false);
    expect(store.showEditButton).toBe(true);
    expect(store.layout).toBe('list');
    expect(store.visibleSections.skills).toBe(true);
    expect(store.visibleSections.stress).toBe(true);
    expect(store.visibleSections.modifiers).toBe(true);
    expect(store.visibleSections.items).toBe(true);
  });
});
