import { describe, expect, it } from 'vitest'
import { placeList } from './listPlacement.js'

const visual = { top: 0, height: 800 }

describe('placeList', () => {
  it('opens downward when there is room', () => {
    expect(placeList({ top: 100, bottom: 148 }, visual)).toEqual({ up: false, max: 256 })
  })

  it('opens upward above a phone keyboard that leaves little room below', () => {
    // keyboard: the visible area is only 420 px tall, the field sits at 340 to 388
    expect(placeList({ top: 340, bottom: 388 }, { top: 0, height: 420 })).toEqual({ up: true, max: 244 })
  })

  it('stays downward and shrinks when neither side has much room', () => {
    const placed = placeList({ top: 60, bottom: 108 }, { top: 0, height: 250 })
    expect(placed.up).toBe(false)
    expect(placed.max).toBe(126)
  })

  it('never goes below a usable height', () => {
    expect(placeList({ top: 60, bottom: 108 }, { top: 0, height: 120 }).max).toBe(96)
  })
})
