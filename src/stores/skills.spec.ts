import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSkillsStore } from './skills'
import { SKILL_LIST } from '../types'

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
})
