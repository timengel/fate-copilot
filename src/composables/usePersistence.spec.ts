import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import { initPersistence } from './usePersistence'
import { useCharactersStore } from '../stores/characters'
import { useCampaignsStore } from '../stores/campaigns'
import { SKILL_LIST } from '../types'
import type { Character } from '../types'

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
})
