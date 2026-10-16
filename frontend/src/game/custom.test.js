import { describe, expect, it } from 'vitest'
import { advanceSession, emptyConfig, facets, filterPool, readSession, sanitizeConfig, shuffle } from './custom.js'

const catalogue = [
  { id: 'a', architects: ['Wright'], era: 'MODERNISM', countryCode: 'US' },
  { id: 'b', architects: ['Wright', 'Sullivan'], era: 'ART_NOUVEAU', countryCode: 'US' },
  { id: 'c', architects: ['Gaudí'], era: 'ART_NOUVEAU', countryCode: 'ES' },
  { id: 'd', architects: ['Siza'], era: 'MODERNISM', countryCode: 'PT' },
]
const ids = (config) => filterPool(catalogue, { ...emptyConfig, ...config }).map((b) => b.id)

describe('filterPool', () => {
  it('matches any picked architect, including co-architects', () => {
    expect(ids({ mode: 'architect', architects: ['Sullivan', 'Siza'] })).toEqual(['b', 'd'])
  })

  it('matches by era or by country alone', () => {
    expect(ids({ mode: 'era', eras: ['ART_NOUVEAU'] })).toEqual(['b', 'c'])
    expect(ids({ mode: 'country', countries: ['US', 'PT'] })).toEqual(['a', 'b', 'd'])
  })

  it('needs both a country and an era in countries + eras', () => {
    expect(ids({ mode: 'countryEra', countries: ['US'], eras: ['ART_NOUVEAU'] })).toEqual(['b'])
    expect(ids({ mode: 'countryEra', countries: ['US'] })).toEqual(['a', 'b'])
    expect(ids({ mode: 'countryEra' })).toEqual([])
  })

  it('ignores picks that belong to another mode', () => {
    expect(ids({ mode: 'era', architects: ['Wright'] })).toEqual([])
  })
})

describe('facets', () => {
  it('counts each architect once per building, most first', () => {
    const rows = facets(catalogue, (b) => b.architects, (k) => k)
    expect(rows[0]).toEqual({ key: 'Wright', label: 'Wright', count: 2 })
    expect(rows).toHaveLength(4)
  })
})

describe('session', () => {
  it('shuffles without losing or repeating an item', () => {
    expect(shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('records the building played and moves on', () => {
    const next = advanceSession({ ids: ['a', 'b'], index: 0, played: [] }, { id: 'a', name: 'A', wikipedia: 'u' })
    expect(next).toMatchObject({ index: 1, played: [{ id: 'a', name: 'A', wikipedia: 'u' }] })
  })
})

describe('stored data is not trusted', () => {
  it('rebuilds a damaged config from known-good parts', () => {
    expect(sanitizeConfig({ mode: 'nope', architects: 'x', eras: [1, 'MODERNISM'], rounds: 99 })).toEqual({
      ...emptyConfig,
      eras: ['MODERNISM'],
    })
    expect(sanitizeConfig(null)).toEqual(emptyConfig)
  })
})

describe('a stored session is not trusted', () => {
  const store = {}
  globalThis.sessionStorage = {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => (store[k] = v),
    removeItem: (k) => delete store[k],
  }
  const key = 'arch-guesser:custom-session'
  const session = (extra) => JSON.stringify({ config: emptyConfig, ids: ['a', 'b'], index: 0, played: [], ...extra })

  it('keeps only recap entries with a kebab-case id and an https link', () => {
    store[key] = session({
      played: [
        { id: 'villa-rotonda', name: 'Villa Rotonda', wikipedia: 'https://en.wikipedia.org/wiki/Villa_Rotonda' },
        { id: 'x', name: 'Bad link', wikipedia: 'javascript:alert(1)' },
        { id: '../etc', name: 'Bad id', wikipedia: 'https://example.com' },
      ],
    })
    expect(readSession().played.map((p) => p.id)).toEqual(['villa-rotonda'])
  })

  it('rejects a session whose ids are not plain ids or whose index is not a number', () => {
    store[key] = session({ ids: ['ok', '../../secret'] })
    expect(readSession()).toBeNull()
    store[key] = session({ index: 'one' })
    expect(readSession()).toBeNull()
  })
})
