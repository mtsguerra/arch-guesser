import { describe, expect, it } from 'vitest'
import { silhouetteFor, silhouettes } from './silhouettes.js'

describe('silhouettes', () => {
  it('give every stroke a unique path and finish before the name is lettered', () => {
    for (const { strokes } of Object.values(silhouettes)) {
      const paths = strokes.map((s) => s.d)
      expect(new Set(paths).size).toBe(paths.length)
      for (const { delay, duration } of strokes) expect(delay + duration).toBeLessThanOrEqual(2.8 + 1e-9)
    }
  })

  it('falls back to the civic front for an era without its own drawing', () => {
    expect(silhouetteFor('CLASSICAL')).toBe(silhouettes.temple)
    expect(silhouetteFor('NOT_AN_ERA')).toBe(silhouettes.temple)
    expect(silhouetteFor('MEDIEVAL')).toBe(silhouettes.notreDame)
  })
})
