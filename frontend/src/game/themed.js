import { isId, read, shuffle, write } from './custom.js'

export const THEMED_ROUNDS = 10
export const MIN_THEME_BUILDINGS = 10
export const LEVELS = [1, 2, 3]

// What each difficulty asks for. Level III also asks the architect, unless the theme has none to ask for.
const LEVEL_FIELDS = {
  1: ['name', 'era'],
  2: ['name', 'era', 'century'],
  3: ['name', 'era', 'century', 'decade', 'architect'],
}

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

// A themed session is one shuffled run through ten buildings of a theme; it lives in this tab only.
const SESSION_KEY = 'arch-guesser:themed-session'

export function startThemedSession(pool, theme, level, random) {
  const ids = shuffle(pool.map((b) => b.id), random).slice(0, THEMED_ROUNDS)
  const session = { theme, level, ids, index: 0, played: [] }
  write(sessionStorage, SESSION_KEY, session)
  return session
}

export function readThemedSession() {
  const s = read(sessionStorage, SESSION_KEY)
  if (!s || !isId(s.theme) || !LEVELS.includes(s.level) || !Array.isArray(s.ids) || !s.ids.every(isId)) return null
  if (!Number.isInteger(s.index) || s.index < 0) return null
  // Only https links reach an <a href> from here.
  const played = (Array.isArray(s.played) ? s.played : [])
    .filter((p) => p && isId(p.id) && typeof p.name === 'string' && typeof p.wikipedia === 'string' && p.wikipedia.startsWith('https://'))
    .map((p) => ({ id: p.id, name: p.name, wikipedia: p.wikipedia, year: Number.isInteger(p.year) ? p.year : null, solved: p.solved === true }))
  return { theme: s.theme, level: s.level, ids: s.ids, index: s.index, played }
}

export const restoreThemedSession = (session) => write(sessionStorage, SESSION_KEY, session)
export const clearThemedSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Ignore.
  }
}

/** Moves on from `building`, recording it (and whether it was solved) for the recap. */
export function advanceThemedSession(session, building, solved) {
  const played = building
    ? [...session.played, { id: building.id, name: building.name, wikipedia: building.wikipedia, year: building.yearCompleted ?? null, solved }]
    : session.played
  const next = { ...session, played, index: session.index + 1 }
  write(sessionStorage, SESSION_KEY, next)
  return next
}

// The last theme and level picked, remembered between visits.
const PICK_KEY = 'arch-guesser:themed'

export function readThemedPick() {
  const v = read(localStorage, PICK_KEY) ?? {}
  return { theme: isId(v.theme) ? v.theme : null, level: LEVELS.includes(v.level) ? v.level : 1 }
}
export const saveThemedPick = (pick) => write(localStorage, PICK_KEY, pick)
