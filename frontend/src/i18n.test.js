import { describe, expect, it } from 'vitest'
import { detectLanguage } from './i18n.js'
import { bundles } from './strings/index.js'

describe('detectLanguage', () => {
  it('prefers a saved choice', () => {
    expect(detectLanguage('en', 'pt-BR')).toBe('en')
    expect(detectLanguage('pt-BR', 'en-US')).toBe('pt-BR')
  })

  it('falls back to the browser language, then English', () => {
    expect(detectLanguage(null, 'pt-PT')).toBe('pt-BR')
    expect(detectLanguage('xx', 'fr-FR')).toBe('en')
    expect(detectLanguage(null, undefined)).toBe('en')
  })
})

describe('string bundles', () => {
  const shape = (o) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v && typeof v === 'object' ? shape(v) : typeof v]))

  it('Portuguese mirrors the English keys', () => {
    expect(shape(bundles['pt-BR'])).toEqual(shape(bundles.en))
  })
})
