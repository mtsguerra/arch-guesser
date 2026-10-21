export const THEMED_ROUNDS = 10
export const MIN_THEME_BUILDINGS = 10
export const LEVELS = [1, 2, 3]

// What each difficulty asks for. Level III also asks the architect, unless the theme has none to ask for.
const LEVEL_FIELDS = {
  1: ['name', 'era'],
  2: ['name', 'era', 'century'],
  3: ['name', 'era', 'century', 'decade', 'architect'],
}

/** A date within this many years of a century's edge is a near miss. */
const NEAR_YEARS = 10

const isKnownArchitect = (name) => !/^unknown/i.test(name)

/** Themes with enough buildings to play: [{ id, count }], most buildings first. */
export function themesOf(catalogue) {
  const counts = new Map()
  for (const b of catalogue) for (const id of b.themes ?? []) counts.set(id, (counts.get(id) ?? 0) + 1)
  return [...counts]
    .filter(([, count]) => count >= MIN_THEME_BUILDINGS)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
}

export const themePool = (catalogue, theme) => catalogue.filter((b) => b.themes?.includes(theme))

/** Eras that occur in the pool, so the era list never offers a style the theme lacks. */
export const erasIn = (pool) => [...new Set(pool.map((b) => b.era))]

/** Share of the pool with a named architect (not "Unknown ..."). */
const knownShare = (pool) => pool.filter((b) => b.architects.some(isKnownArchitect)).length / pool.length

/** Century of a year: 1..n for CE (1893 -> 19), -1..-n for BCE (-447 -> -5). Negative years are BCE year numbers; year 0 does not exist, so it counts as 1 BCE. */
export const centuryOf = (year) => (year > 0 ? Math.ceil(year / 100) : -Math.max(1, Math.ceil(-year / 100)))

/** First and last year of a century (-5 -> -500..-401). */
const centuryRange = (c) => (c > 0 ? [100 * (c - 1) + 1, 100 * c] : [100 * c, 100 * (c + 1) - 1])

/** true (the century), 'close' (the year is within 10 years of the guessed century) or false. */
export function judgeCentury(guess, year) {
  const c = Number(guess)
  if (!Number.isInteger(c) || c === 0) return false
  if (centuryOf(year) === c) return true
  const [from, to] = centuryRange(c)
  return year >= from - NEAR_YEARS && year <= to + NEAR_YEARS ? 'close' : false
}

/** Decade start of a CE year (1893 -> 1890). */
export const decadeOf = (year) => Math.floor(year / 10) * 10

/** true (the decade), 'close' (one decade either side) or false. Guess is the decade's first year, e.g. 1890. */
export function judgeDecade(guess, year) {
  const d = Number(guess)
  if (!Number.isInteger(d)) return false
  const gap = Math.abs(d - decadeOf(year))
  return gap === 0 ? true : gap === 10 ? 'close' : false
}

/**
 * The fields to ask for one building at one level. A building with no date skips the date fields,
 * a BCE one skips the decade, and the architect drops out when most of the theme's are unknown.
 */
export function fieldsFor(level, pool, building) {
  const dated = building.yearCompleted != null
  const skip = {
    century: !dated,
    decade: !dated || building.yearCompleted <= 0,
    architect: knownShare(pool) < 0.5 || !building.architects.some(isKnownArchitect),
  }
  return LEVEL_FIELDS[level].filter((f) => !skip[f])
}
