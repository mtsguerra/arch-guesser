// US National CAD Standard series: 0 general/site, 1 plans, 2 elevations, 3 sections.
const SERIES = { SITE_PLAN: 0, FLOOR_PLAN: 1, ELEVATION: 2, SECTION: 3 }

/** Sheet numbers in drawing order, e.g. ['A-101', 'A-102', 'A-301']. */
export function sheetNumbers(drawings) {
  const counts = {}
  return drawings.map(({ type }) => {
    const series = SERIES[type] ?? 9
    counts[series] = (counts[series] ?? 0) + 1
    return `A-${series}${String(counts[series]).padStart(2, '0')}`
  })
}
