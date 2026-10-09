import { describe, expect, it } from 'vitest'
import { buildSheets } from './sheets.js'

const drawing = (type, label) => ({ type, label, src: `/buildings/x/${label}.jpg`, alt: label })
const photo = (view, name) => ({ view, src: `/buildings/x/${name}.jpg`, alt: name })

describe('buildSheets', () => {
  it('puts cuts first, numbered by series, then photos with exteriors before interiors', () => {
    const sheets = buildSheets({
      drawings: [drawing('FLOOR_PLAN', 'ground'), drawing('SECTION', 'cut'), drawing('FLOOR_PLAN', 'first')],
      photos: [photo('INTERIOR', 'hall'), photo('EXTERIOR', 'front')],
    })

    expect(sheets.map((s) => s.number)).toEqual(['A-101', 'A-301', 'A-102', 'P-1', 'P-2'])
    expect(sheets.map((s) => s.kind)).toEqual(['drawing', 'drawing', 'drawing', 'photo', 'photo'])
    expect(sheets[3]).toMatchObject({ label: 'Exterior', image: { alt: 'front' } })
    expect(sheets[4]).toMatchObject({ label: 'Interior', image: { alt: 'hall' } })
  })

  it('works for buildings without cuts', () => {
    const sheets = buildSheets({ drawings: [], photos: [photo('EXTERIOR', 'a'), photo('INTERIOR', 'b')] })
    expect(sheets.map((s) => s.number)).toEqual(['P-1', 'P-2'])
  })

  it('gives every sheet a stable, unique key', () => {
    const sheets = buildSheets({ drawings: [drawing('SITE_PLAN', 's')], photos: [photo('EXTERIOR', 'a'), photo('INTERIOR', 'b')] })
    expect(new Set(sheets.map((s) => s.key)).size).toBe(3)
  })
})
