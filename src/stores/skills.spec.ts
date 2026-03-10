import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSkillsStore } from './skills'
import { useCharactersStore } from './characters'
import { SKILL_LIST } from '../types'
import type { Character } from '../types'

function makeChar(overrides: Partial<Character> = {}): Character {
  return {
    id: 'c1',
    name: 'Test',
    description: '',
    highConcept: '',
    trouble: '',
    aspects: ['', '', ''],
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
  }
}

describe('useSkillsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with the default SKILL_LIST', () => {
    expect(useSkillsStore().skills).toEqual(SKILL_LIST)
  })

  it('adds a new skill', () => {
    const store = useSkillsStore()
    store.addSkill('Mystik')
    expect(store.skills).toContain('Mystik')
  })

  it('trims whitespace when adding a skill', () => {
    const store = useSkillsStore()
    store.addSkill('  Mystik  ')
    expect(store.skills).toContain('Mystik')
    expect(store.skills).not.toContain('  Mystik  ')
  })

  it('does not add a duplicate skill', () => {
    const store = useSkillsStore()
    const count = store.skills.length
    store.addSkill('Athletik') // already in SKILL_LIST
    expect(store.skills).toHaveLength(count)
  })

  it('does not add an empty string', () => {
    const store = useSkillsStore()
    const count = store.skills.length
    store.addSkill('')
    expect(store.skills).toHaveLength(count)
  })

  it('does not add a whitespace-only string', () => {
    const store = useSkillsStore()
    const count = store.skills.length
    store.addSkill('   ')
    expect(store.skills).toHaveLength(count)
  })

  it('removes a skill', () => {
    const store = useSkillsStore()
    store.removeSkill('Athletik')
    expect(store.skills).not.toContain('Athletik')
  })

  it('removes the skill from all characters when deleted', () => {
    const skillsStore = useSkillsStore()
    const charactersStore = useCharactersStore()
    charactersStore.addCharacter(
      makeChar({ id: 'c1', skills: [{ skill: 'Athletik', level: 2 }, { skill: 'Kämpfen', level: 3 }] }),
    )
    skillsStore.removeSkill('Athletik')
    const character = charactersStore.getById('c1')!
    expect(character.skills.find(e => e.skill === 'Athletik')).toBeUndefined()
    expect(character.skills.find(e => e.skill === 'Kämpfen')).toBeDefined()
  })

  it('does not modify characters that do not have the deleted skill', () => {
    const skillsStore = useSkillsStore()
    const charactersStore = useCharactersStore()
    charactersStore.addCharacter(
      makeChar({ id: 'c1', skills: [{ skill: 'Kämpfen', level: 3 }] }),
    )
    skillsStore.removeSkill('Athletik')
    expect(charactersStore.getById('c1')!.skills).toHaveLength(1)
  })

  it('replaceAll replaces all skills', () => {
    const store = useSkillsStore()
    store.replaceAll(['Custom1', 'Custom2'])
    expect(store.skills).toEqual(['Custom1', 'Custom2'])
  })

  it('resetToDefaults restores SKILL_LIST', () => {
    const store = useSkillsStore()
    store.replaceAll(['Custom'])
    store.resetToDefaults()
    expect(store.skills).toEqual(SKILL_LIST)
  })

  it('replaceAll with empty array clears all skills', () => {
    const store = useSkillsStore()
    store.replaceAll([])
    expect(store.skills).toHaveLength(0)
  })

  it('removeSkill with non-existent name does nothing', () => {
    const store = useSkillsStore()
    const before = [...store.skills]
    store.removeSkill('DoesNotExist')
    expect(store.skills).toEqual(before)
  })
})
