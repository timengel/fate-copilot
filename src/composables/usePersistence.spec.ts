import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import { initPersistence } from './usePersistence'
import { useCharactersStore } from '../stores/characters'
import { useCampaignsStore } from '../stores/campaigns'
import { SKILL_LIST } from '../types'
import type { Character } from '../types'
import { useSkillsStore } from '../stores/skills'

const STORAGE_KEY = 'fate-copilot-data'

const baseChar: Character = {
  id: 'c1', name: 'Alice', description: '', highConcept: '', trouble: '',
  aspects: [], skills: [], stunts: [], extras: '', refresh: 3, fatePoints: 3,
  stressPhysical: [], stressMental: [], consequences: [], notes: '',
}

function setStorage(data: unknown) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

describe('initPersistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('loads characters from localStorage on init', () => {
    setStorage({
      formatVersion: '1.1',
      exportDate: '',
      characters: [baseChar],
      campaigns: [],
      campaignCharacterAssignments: [],
      skills: [...SKILL_LIST],
    })
    initPersistence()
    expect(useCharactersStore().characters[0].name).toBe('Alice')
  })

  it('does not throw with empty localStorage', () => {
    expect(() => initPersistence()).not.toThrow()
    expect(useCharactersStore().characters).toHaveLength(0)
  })

  it('silently ignores corrupted localStorage data', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json {{{')
    expect(() => initPersistence()).not.toThrow()
    expect(useCharactersStore().characters).toHaveLength(0)
  })

  it('migrates v1.0 campaign without milestones field', () => {
    setStorage({
      formatVersion: '1.0',
      exportDate: '',
      characters: [],
      campaigns: [{ id: 'c1', name: 'Camp', description: '', status: 'active', notes: '' }],
      campaignCharacterAssignments: [],
    })
    initPersistence()
    expect(useCampaignsStore().campaigns[0].milestones).toEqual([])
  })

  it('saves to localStorage when a store changes', async () => {
    initPersistence()
    useCharactersStore().addCharacter(baseChar)
    await nextTick()
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.characters).toHaveLength(1)
    expect(saved.characters[0].name).toBe('Alice')
  })

  it('persists correct formatVersion on save', async () => {
    initPersistence()
    useCharactersStore().addCharacter(baseChar)
    await nextTick()
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.formatVersion).toBe('1.1')
  })

  it('persists character color through save/load cycle', async () => {
    initPersistence()
    useCharactersStore().addCharacter({ ...baseChar, id: 'c2', color: 'tomate' })
    await nextTick()
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.characters[0].color).toBe('tomate')
  })

  it('loads character color from localStorage correctly', () => {
    setStorage({
      formatVersion: '1.1',
      exportDate: '',
      characters: [{ ...baseChar, color: 'salbei' }],
      campaigns: [],
      campaignCharacterAssignments: [],
      skills: [...SKILL_LIST],
    })
    initPersistence()
    expect(useCharactersStore().characters[0].color).toBe('salbei')
  })

  it('character without color field does not corrupt other characters color on reload', () => {
    setStorage({
      formatVersion: '1.1',
      exportDate: '',
      characters: [
        { ...baseChar, id: 'c1', color: 'mandarine' },
        { ...baseChar, id: 'c2' },
      ],
      campaigns: [],
      campaignCharacterAssignments: [],
      skills: [...SKILL_LIST],
    })
    initPersistence()
    const store = useCharactersStore()
    expect(store.getById('c1')?.color).toBe('mandarine')
    expect(store.getById('c2')?.color).toBeUndefined()
  })

  it('loads skills from localStorage on init', () => {
    setStorage({
      formatVersion: '1.1',
      exportDate: '',
      characters: [],
      campaigns: [],
      campaignCharacterAssignments: [],
      skills: ['Magie', 'Kampf'],
    })
    initPersistence()
    expect(useSkillsStore().skills).toEqual(['Magie', 'Kampf'])
  })

  it('loads campaign-character assignments from localStorage on init', () => {
    setStorage({
      formatVersion: '1.1',
      exportDate: '',
      characters: [],
      campaigns: [{ id: 'camp1', name: 'Kampagne', description: '', status: 'active', notes: '', milestones: [] }],
      campaignCharacterAssignments: [{ campaignId: 'camp1', characterId: 'c1' }],
      skills: [...SKILL_LIST],
    })
    initPersistence()
    expect(useCampaignsStore().assignments).toEqual([{ campaignId: 'camp1', characterId: 'c1' }])
  })

  it('persists character type field through save/load cycle', async () => {
    initPersistence()
    useCharactersStore().addCharacter({ ...baseChar, id: 'n1', type: 'nsc' })
    await nextTick()
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.characters[0].type).toBe('nsc')
  })

  it('loads character type field from localStorage on init', () => {
    setStorage({
      formatVersion: '1.1',
      exportDate: '',
      characters: [{ ...baseChar, id: 'n1', type: 'nsc' }],
      campaigns: [],
      campaignCharacterAssignments: [],
      skills: [...SKILL_LIST],
    })
    initPersistence()
    expect(useCharactersStore().getById('n1')?.type).toBe('nsc')
  })

  it('v1.0 data without skills field falls back to SKILL_LIST on init', () => {
    setStorage({
      formatVersion: '1.0',
      exportDate: '',
      characters: [],
      campaigns: [],
      campaignCharacterAssignments: [],
    })
    initPersistence()
    expect(useSkillsStore().skills).toEqual([...SKILL_LIST])
  })
})
