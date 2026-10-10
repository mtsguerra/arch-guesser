import { describe, expect, it } from 'vitest'
import { eraRange, formatYear } from './useEras.js'

describe('formatYear', () => {
  it('writes BCE years without a minus sign', () => {
    expect(formatYear(-415)).toBe('415 BCE')
    expect(formatYear(126)).toBe('126')
  })
})

describe('eraRange', () => {
  it('formats open-ended and BCE ranges', () => {
    expect(eraRange({ startYear: -800, endYear: 476 })).toBe('800 BCE–476')
    expect(eraRange({ startYear: 1990, endYear: null })).toBe('1990–now')
  })
})
