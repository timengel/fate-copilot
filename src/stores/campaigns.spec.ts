import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCampaignsStore } from './campaigns';
import { useCharactersStore } from './characters';
import type { Campaign, Character, Milestone } from '../types';

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp1',
    name: 'Test Campaign',
    description: '',
    status: 'active',
    notes: '',
    milestones: [],
    ...overrides,
  };
}

function makeChar(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char1',
    name: 'Alice',
    description: '',
    highConcept: '',
    trouble: '',
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

describe('useCampaignsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts empty', () => {
    const store = useCampaignsStore();
    expect(store.campaigns).toHaveLength(0);
    expect(store.assignments).toHaveLength(0);
  });

  it('adds a campaign', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign());
    expect(store.campaigns).toHaveLength(1);
  });

  it('getById returns the correct campaign', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign({ id: 'x', name: 'X' }));
    expect(store.getById('x')?.name).toBe('X');
  });

  it('getById returns undefined for unknown id', () => {
    expect(useCampaignsStore().getById('nope')).toBeUndefined();
  });

  it('updates a campaign', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign({ id: 'c1', name: 'Old' }));
    store.updateCampaign(makeCampaign({ id: 'c1', name: 'New' }));
    expect(store.getById('c1')?.name).toBe('New');
  });

  it('deletes a campaign', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign({ id: 'c1' }));
    store.deleteCampaign('c1');
    expect(store.campaigns).toHaveLength(0);
  });

  it('deleteCampaign also removes associated assignments', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign({ id: 'c1' }));
    store.assignCharacter('c1', 'char1');
    store.deleteCampaign('c1');
    expect(store.assignments).toHaveLength(0);
  });

  it('activeCampaigns only includes active status', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign({ id: 'a', status: 'active' }));
    store.addCampaign(makeCampaign({ id: 'b', status: 'inactive' }));
    store.addCampaign(makeCampaign({ id: 'c', status: 'completed' }));
    expect(store.activeCampaigns).toHaveLength(1);
    expect(store.activeCampaigns[0]!.id).toBe('a');
  });

  it('assignCharacter adds an assignment', () => {
    const store = useCampaignsStore();
    store.assignCharacter('c1', 'char1');
    expect(store.assignments).toHaveLength(1);
  });

  it('assignCharacter does not add duplicate', () => {
    const store = useCampaignsStore();
    store.assignCharacter('c1', 'char1');
    store.assignCharacter('c1', 'char1');
    expect(store.assignments).toHaveLength(1);
  });

  it('unassignCharacter removes the assignment', () => {
    const store = useCampaignsStore();
    store.assignCharacter('c1', 'char1');
    store.unassignCharacter('c1', 'char1');
    expect(store.assignments).toHaveLength(0);
  });

  it('getCharactersForCampaign returns assigned characters', () => {
    const store = useCampaignsStore();
    const charsStore = useCharactersStore();
    charsStore.addCharacter(makeChar({ id: 'char1', name: 'Alice' }));
    charsStore.addCharacter(makeChar({ id: 'char2', name: 'Bob' }));
    store.assignCharacter('c1', 'char1');
    const result = store.getCharactersForCampaign('c1');
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Alice');
  });

  it('getCampaignsForCharacter returns assigned campaigns', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign({ id: 'c1', name: 'Campaign 1' }));
    store.addCampaign(makeCampaign({ id: 'c2', name: 'Campaign 2' }));
    store.assignCharacter('c1', 'char1');
    const result = store.getCampaignsForCharacter('char1');
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Campaign 1');
  });

  it('addMilestone adds to the campaign', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign({ id: 'c1' }));
    const milestone: Milestone = { id: 'm1', type: 'small', description: 'First' };
    store.addMilestone('c1', milestone);
    expect(store.getById('c1')?.milestones).toHaveLength(1);
    expect(store.getById('c1')?.milestones?.[0]!.description).toBe('First');
  });

  it('removeMilestone removes from the campaign', () => {
    const store = useCampaignsStore();
    store.addCampaign(
      makeCampaign({ id: 'c1', milestones: [{ id: 'm1', type: 'small', description: 'First' }] }),
    );
    store.removeMilestone('c1', 'm1');
    expect(store.getById('c1')?.milestones).toHaveLength(0);
  });

  it('updateMilestone updates the correct milestone', () => {
    const store = useCampaignsStore();
    store.addCampaign(
      makeCampaign({ id: 'c1', milestones: [{ id: 'm1', type: 'small', description: 'Old' }] }),
    );
    store.updateMilestone('c1', { id: 'm1', type: 'major', description: 'New' });
    const milestone = store.getById('c1')?.milestones?.[0];
    expect(milestone?.description).toBe('New');
    expect(milestone?.type).toBe('major');
  });

  it('updateMilestone leaves other milestones untouched', () => {
    const store = useCampaignsStore();
    store.addCampaign(
      makeCampaign({
        id: 'c1',
        milestones: [
          { id: 'm1', type: 'small', description: 'First' },
          { id: 'm2', type: 'significant', description: 'Second' },
        ],
      }),
    );
    store.updateMilestone('c1', { id: 'm1', type: 'major', description: 'Updated' });
    expect(store.getById('c1')?.milestones?.[1]!.description).toBe('Second');
  });

  it('replaceAll replaces campaigns and assignments', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign({ id: 'old' }));
    store.assignCharacter('old', 'char1');
    store.replaceAll([makeCampaign({ id: 'new' })], [{ campaignId: 'new', characterId: 'c1' }]);
    expect(store.campaigns[0]!.id).toBe('new');
    expect(store.assignments[0]!.campaignId).toBe('new');
  });

  it('addMilestone with non-existent campaignId does nothing', () => {
    const store = useCampaignsStore();
    const milestone: Milestone = { id: 'm1', type: 'small', description: 'Ghost' };
    expect(() => store.addMilestone('ghost', milestone)).not.toThrow();
    expect(store.campaigns).toHaveLength(0);
  });

  it('removeMilestone with non-existent campaignId does nothing', () => {
    const store = useCampaignsStore();
    expect(() => store.removeMilestone('ghost', 'm1')).not.toThrow();
  });

  it('unassignCharacter when assignment does not exist does nothing', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign({ id: 'c1' }));
    expect(() => store.unassignCharacter('c1', 'nobody')).not.toThrow();
    expect(store.assignments).toHaveLength(0);
  });

  it('reset clears campaigns, assignments, and itemAssignments', () => {
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign({ id: 'c1' }));
    store.assignCharacter('c1', 'char1');
    store.assignItem('c1', 'item1');
    store.reset();
    expect(store.campaigns).toHaveLength(0);
    expect(store.assignments).toHaveLength(0);
    expect(store.itemAssignments).toHaveLength(0);
  });
});
