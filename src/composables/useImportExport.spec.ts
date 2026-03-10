import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useImportExport } from './useImportExport'
import { useCharactersStore } from '../stores/characters'
import { useCampaignsStore } from '../stores/campaigns'
import { useSkillsStore } from '../stores/skills'
import type { AppData, Character, Campaign } from '../types'

const validV11: AppData = {
  formatVersion: '1.1',
  exportDate: '2024-01-01T00:00:00.000Z',
  campaigns: [],
  characters: [],
  campaignCharacterAssignments: [],
  skills: ['Athletik'],
}

const validV10 = {
  formatVersion: '1.0' as const,
  exportDate: '2024-01-01T00:00:00.000Z',
  campaigns: [],
  characters: [],
  campaignCharacterAssignments: [],
}

function makeFile(data: unknown): File {
  return new File([JSON.stringify(data)], 'test.json', { type: 'application/json' })
}

describe('useImportExport', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('importJSON', () => {
    it('resolves with valid v1.1 data', async () => {
      const { importJSON } = useImportExport()
      const result = await importJSON(makeFile(validV11))
      expect(result.formatVersion).toBe('1.1')
    })

    it('resolves with valid v1.0 data', async () => {
      const { importJSON } = useImportExport()
      const result = await importJSON(makeFile(validV10))
      expect(result.formatVersion).toBe('1.0')
    })

    it('rejects on invalid JSON string', async () => {
      const { importJSON } = useImportExport()
      const file = new File(['not{json}at all'], 'bad.json')
      await expect(importJSON(file)).rejects.toThrow()
    })

    it('rejects on unknown formatVersion', async () => {
      const { importJSON } = useImportExport()
      await expect(importJSON(makeFile({ ...validV11, formatVersion: '9.9' }))).rejects.toThrow()
    })

    it('rejects when campaigns array is missing', async () => {
      const { importJSON } = useImportExport()
      const { campaigns: _c, ...noCampaigns } = validV11
      await expect(importJSON(makeFile(noCampaigns))).rejects.toThrow()
    })

    it('rejects when characters array is missing', async () => {
      const { importJSON } = useImportExport()
      const { characters: _c, ...noChars } = validV11
      await expect(importJSON(makeFile(noChars))).rejects.toThrow()
    })

    it('rejects when campaignCharacterAssignments is missing', async () => {
      const { importJSON } = useImportExport()
      const { campaignCharacterAssignments: _a, ...noAssignments } = validV11
      await expect(importJSON(makeFile(noAssignments))).rejects.toThrow()
    })

  })

  describe('applyImport', () => {
    it('replaces characters in the store', () => {
      const { applyImport } = useImportExport()
      const character: Character = {
        id: 'c1', name: 'Alice', description: '', highConcept: '', trouble: '',
        aspects: [], skills: [], stunts: [], extras: '', refresh: 3, fatePoints: 3,
        stressPhysical: [], stressMental: [], consequences: [], notes: '',
      }
      applyImport({ ...validV11, characters: [character] })
      expect(useCharactersStore().characters[0].name).toBe('Alice')
    })

    it('replaces campaigns in the store', () => {
      const { applyImport } = useImportExport()
      const campaign: Campaign = { id: 'camp1', name: 'My Campaign', description: '', status: 'active', notes: '' }
      applyImport({ ...validV11, campaigns: [campaign] })
      expect(useCampaignsStore().campaigns[0].name).toBe('My Campaign')
    })

    it('replaces skills in the store', () => {
      const { applyImport } = useImportExport()
      applyImport({ ...validV11, skills: ['CustomSkill'] })
      expect(useSkillsStore().skills).toEqual(['CustomSkill'])
    })

    it('falls back to SKILL_LIST when skills is undefined (v1.0)', () => {
      const { applyImport } = useImportExport()
      const { skills: _s, ...data } = validV11
      applyImport(data as AppData)
      expect(useSkillsStore().skills.length).toBeGreaterThan(0)
    })
  })
})
