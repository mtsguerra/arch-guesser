import { describe, expect, it } from 'vitest'
import { centuryOf, decadeOf, erasIn, fieldsFor, judgeCentury, judgeDecade, themePool, themesOf } from './themed.js'
import { evaluateGuess } from './matchGuess.js'

const entry = (id, themes, extra = {}) => ({ id, themes, era: 'MEDIEVAL', architects: ['Unknown masons'], yearCompleted: 1250, ...extra })

describe('centuries', () => {
  it('numbers CE and BCE centuries', () => {
    expect([centuryOf(1), centuryOf(100), centuryOf(101), centuryOf(1893), centuryOf(2015)]).toEqual([1, 1, 2, 19, 21])
    expect([centuryOf(-447), centuryOf(-1), centuryOf(0), centuryOf(-100), centuryOf(-101)]).toEqual([-5, -1, -1, -1, -2])
  })

  it('judges exact, near miss and wrong', () => {
    expect(judgeCentury(19, 1893)).toBe(true)
    expect(judgeCentury(20, 1893)).toBe('close') // 8 years before the 20th century
    expect(judgeCentury(18, 1893)).toBe(false) // 93 years after the 18th
    expect(judgeCentury(18, 1805)).toBe('close')
    expect(judgeCentury(-5, -447)).toBe(true)
    expect(judgeCentury(-4, -401)).toBe('close') // 401 BCE is the 5th century, one year before the 4th starts
    expect(judgeCentury(-3, -401)).toBe(false)
  })

  it('rejects junk', () => {
    expect(judgeCentury(0, 1893)).toBe(false)
    expect(judgeCentury('x', 1893)).toBe(false)
  })
})

describe('decades', () => {
  it('judges the decade and its neighbours', () => {
    expect(decadeOf(1893)).toBe(1890)
    expect(judgeDecade(1890, 1893)).toBe(true)
    expect(judgeDecade(1880, 1893)).toBe('close')
    expect(judgeDecade(1900, 1893)).toBe('close')
    expect(judgeDecade(1870, 1893)).toBe(false)
  })
})

describe('evaluateGuess with date fields', () => {
  const b = { name: 'Tower', aliases: [], architects: [], location: { countryCode: 'FR' }, era: 'MEDIEVAL', yearCompleted: 1893 }
  it('adds century and decade only when asked', () => {
    expect(Object.keys(evaluateGuess(b, { name: 'Tower', architect: '', country: '', era: '' }))).not.toContain('century')
    const r = evaluateGuess(b, { name: 'Tower', era: 'MEDIEVAL', century: 20, decade: 1890 })
    expect(r).toMatchObject({ century: 'close', decade: true })
  })
})

describe('theme pools', () => {
  const catalogue = [
    ...Array.from({ length: 10 }, (_, i) => entry(`c${i}`, ['castles'])),
    ...Array.from({ length: 9 }, (_, i) => entry(`m${i}`, ['museums'])),
  ]
  it('lists only themes with enough buildings', () => {
    expect(themesOf(catalogue)).toEqual([{ id: 'castles', count: 10 }])
    expect(themePool(catalogue, 'museums')).toHaveLength(9)
    expect(erasIn(catalogue)).toEqual(['MEDIEVAL'])
  })
})

describe('fieldsFor', () => {
  const named = Array.from({ length: 4 }, (_, i) => entry(`n${i}`, ['t'], { architects: ['Wren'] }))
  const anon = Array.from({ length: 4 }, (_, i) => entry(`a${i}`, ['t']))
  it('asks the level fields', () => {
    expect(fieldsFor(1, named, named[0])).toEqual(['name', 'era'])
    expect(fieldsFor(2, named, named[0])).toEqual(['name', 'era', 'century'])
    expect(fieldsFor(3, named, named[0])).toEqual(['name', 'era', 'century', 'decade', 'architect'])
  })
  it('hides the architect when the theme mostly has none', () => {
    expect(fieldsFor(3, anon, anon[0])).toEqual(['name', 'era', 'century', 'decade'])
  })
  it('skips dates that are unknown or BCE', () => {
    const undated = entry('u', ['t'], { architects: ['Wren'], yearCompleted: null })
    const bce = entry('b', ['t'], { architects: ['Wren'], yearCompleted: -447 })
    expect(fieldsFor(3, named, undated)).toEqual(['name', 'era', 'architect'])
    expect(fieldsFor(3, named, bce)).toEqual(['name', 'era', 'century', 'architect'])
  })
})
