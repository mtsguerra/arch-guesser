import { describe, expect, it } from 'vitest'
import { VIEW_W, colonnade } from './colonnade.js'

describe('colonnade', () => {
  it('stays centred and inside the drawing for every round count', () => {
    for (let n = 3; n <= 50; n++) {
      const { start, span } = colonnade(n)
      expect(start).toBeGreaterThanOrEqual(0)
      expect(start + span).toBeLessThanOrEqual(VIEW_W)
      expect(start).toBeCloseTo(VIEW_W - (start + span))
    }
  })

  it('lengthens with more rounds', () => {
    expect(colonnade(50).span).toBeGreaterThan(colonnade(3).span)
  })
})
