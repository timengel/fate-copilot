import { describe, it, expect } from 'vitest'
import { createDefaultCharacter, useCharacterDefaults } from './useCharacterDefaults'

describe('createDefaultCharacter', () => {
  it('returns a non-empty id', () => {
    expect(createDefaultCharacter().id).toBeTruthy()
  })

  it('each call returns a unique id', () => {
    expect(createDefaultCharacter().id).not.toBe(createDefaultCharacter().id)
  })

  it('returns refresh=3 and fatePoints=3', () => {
    const char = createDefaultCharacter()
    expect(char.refresh).toBe(3)
    expect(char.fatePoints).toBe(3)
  })

  it('returns 4 physical stress boxes with values 1–4, all unchecked', () => {
    const { stressPhysical } = createDefaultCharacter()
    expect(stressPhysical).toHaveLength(4)
    expect(stressPhysical.map(b => b.value)).toEqual([1, 2, 3, 4])
    expect(stressPhysical.every(b => !b.checked)).toBe(true)
  })

  it('returns 4 mental stress boxes with values 1–4, all unchecked', () => {
    const { stressMental } = createDefaultCharacter()
    expect(stressMental).toHaveLength(4)
    expect(stressMental.map(b => b.value)).toEqual([1, 2, 3, 4])
    expect(stressMental.every(b => !b.checked)).toBe(true)
  })

  it('returns 4 consequence slots with severities 2/4/6/8', () => {
    const { consequences } = createDefaultCharacter()
    expect(consequences).toHaveLength(4)
    expect(consequences.map(c => c.severity)).toEqual([2, 4, 6, 8])
    expect(consequences.every(c => c.value === '')).toBe(true)
  })

  it('returns empty strings for name, highConcept, trouble, notes', () => {
    const char = createDefaultCharacter()
    expect(char.name).toBe('')
    expect(char.highConcept).toBe('')
    expect(char.trouble).toBe('')
    expect(char.notes).toBe('')
  })

  it('returns 3 empty aspect slots', () => {
    expect(createDefaultCharacter().aspects).toEqual(['', '', ''])
  })
})

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const { generateId } = useCharacterDefaults()
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('returns unique values on successive calls', () => {
    const { generateId } = useCharacterDefaults()
    expect(generateId()).not.toBe(generateId())
  })
})
