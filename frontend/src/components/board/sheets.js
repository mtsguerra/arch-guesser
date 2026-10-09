import { strings } from '../../strings.js'

// US National CAD Standard series for cuts: 0 general/site, 1 plans, 2 elevations, 3 sections.
const SERIES = { SITE_PLAN: 0, FLOOR_PLAN: 1, ELEVATION: 2, SECTION: 3 }
const VIEW_ORDER = { EXTERIOR: 0, INTERIOR: 1 }

/**
 * Every image of a building as a board sheet: cuts first, in data order, numbered
 * like a drawing set (A-101, A-301…), then photos, exteriors before interiors (P-1, P-2…).
 */
export function buildSheets(building) {
  const counts = {}
  const cuts = building.drawings.map((d, i) => {
    const series = SERIES[d.type] ?? 9
    counts[series] = (counts[series] ?? 0) + 1
    return {
      key: `d${i}`,
      kind: 'drawing',
      number: `A-${series}${String(counts[series]).padStart(2, '0')}`,
      label: d.label,
      title: d.label,
      image: d,
    }
  })

  const photos = (building.photos ?? [])
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (VIEW_ORDER[a.p.view] ?? 9) - (VIEW_ORDER[b.p.view] ?? 9) || a.i - b.i)
    .map(({ p, i }, n) => ({
      key: `p${i}`,
      kind: 'photo',
      number: `P-${n + 1}`,
      label: strings.board.views[p.view] ?? strings.board.views.EXTERIOR,
      title: strings.board.photoTitles[p.view] ?? strings.board.photoTitles.EXTERIOR,
      image: p,
    }))

  return [...cuts, ...photos]
}
