// Century and decade arithmetic and judging; pure, no storage.

/** A date within this many years of a century's edge is a near miss. */
const NEAR_YEARS = 10

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

/** Centuries from the earliest to the latest dated building of the pool, BCE first, with no century 0. */
export function centuriesIn(pool) {
  const cs = pool.filter((b) => b.yearCompleted != null).map((b) => centuryOf(b.yearCompleted))
  if (!cs.length) return []
  const out = []
  for (let c = Math.min(...cs); c <= Math.max(...cs); c++) if (c !== 0) out.push(c)
  return out
}

/** First years of the decades of a CE century, 1800 to 1900 for the 19th: the year 1900 ends it, and its decade is the 1900s. */
export const decadesOfCentury = (c) => Array.from({ length: 11 }, (_, i) => (c - 1) * 100 + i * 10)
