import { describe, expect, it } from 'vitest'
import { routeFrom } from './route.js'

describe('routeFrom', () => {
  it('opens the game on #/play and the homepage otherwise', () => {
    expect(routeFrom('#/play')).toBe('play')
    expect(routeFrom('#/daily')).toBe('daily')
    expect(routeFrom('#/custom')).toBe('custom')
    expect(routeFrom('#/custom/play')).toBe('customPlay')
    expect(routeFrom('')).toBe('home')
    expect(routeFrom('#/')).toBe('home')
    expect(routeFrom('#/nope')).toBe('home')
  })
})
