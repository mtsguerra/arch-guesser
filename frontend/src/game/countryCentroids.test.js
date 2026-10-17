import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CENTROIDS } from './countryCentroids.js'

describe('country centroids', () => {
  it('cover every country in the building data', () => {
    const buildings = JSON.parse(readFileSync(new URL('../../../src/main/resources/data/buildings.json', import.meta.url), 'utf8'))
    const missing = [...new Set(buildings.map((b) => b.location.countryCode))].filter((c) => !CENTROIDS[c])
    expect(missing).toEqual([])
  })
})
