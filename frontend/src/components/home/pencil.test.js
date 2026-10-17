import { describe, expect, it } from 'vitest'
import { DRAWINGS, DRAWING_ERAS, length, order } from './pencil.js'
import { bundles } from '../../strings/index.js'

describe('the home page drawings', () => {
  it('has a drawing for every family of styles, each with strokes and no dash-pattern lines', () => {
    expect(DRAWINGS.length).toBeGreaterThanOrEqual(20)
    for (const strokes of DRAWINGS) {
      expect(strokes.length).toBeGreaterThan(3)
      expect(strokes.some((s) => s.tone === 'dimension')).toBe(false)
      expect(length(strokes)).toBeGreaterThan(1)
    }
  })

  it('names an era for every drawing, in both languages', () => {
    expect(DRAWING_ERAS).toHaveLength(DRAWINGS.length)
    for (const era of DRAWING_ERAS) for (const b of Object.values(bundles)) expect(b.eras[era]).toBeTruthy()
  })

  it('orders every drawing exactly once and never opens with the one that just played', () => {
    for (let i = 0; i < 50; i++) {
      const next = order(3)
      expect([...next].sort((a, b) => a - b)).toEqual(DRAWINGS.map((_, k) => k))
      expect(next[0]).not.toBe(3)
    }
  })
})
