import { describe, expect, it } from 'vitest'
import { stepAutoHide } from './autoHide.js'

const run = (positions, from = { hidden: false, anchor: 0, dir: 0, last: 0 }) => positions.reduce(stepAutoHide, from)

describe('stepAutoHide', () => {
  it('stays put near the top of the page', () => {
    expect(run([5, 12, 20]).hidden).toBe(false)
  })

  it('leaves once the page has gone down far enough, and ignores a small scroll', () => {
    const at100 = { hidden: false, anchor: 100, dir: 0, last: 100 }
    expect(run([110, 120], at100).hidden).toBe(false)
    expect(run([140, 200], at100).hidden).toBe(true)
  })

  it('comes back on a short scroll up, sooner than it left', () => {
    const hidden = run([140, 200], { hidden: false, anchor: 100, dir: 0, last: 100 })
    expect(run([196], hidden).hidden).toBe(true) // 4 px up: still hidden
    expect(run([196, 188], hidden).hidden).toBe(false) // 12 px up from the turn: back
  })

  it('is always shown again at the top', () => {
    expect(run([140, 200, 10], { hidden: false, anchor: 100, dir: 0, last: 100 }).hidden).toBe(false)
  })
})
