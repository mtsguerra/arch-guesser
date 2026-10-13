import { describe, expect, it } from 'vitest'
import { formatYear } from './useEras.js'

describe('formatYear', () => {
  it('writes BCE years without a minus sign', () => {
    expect(formatYear(-415)).toBe('415 BCE')
    expect(formatYear(126)).toBe('126')
  })
})
