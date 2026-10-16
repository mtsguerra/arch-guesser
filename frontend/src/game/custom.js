export const MIN_BUILDINGS = 10
export const ROUNDS = [5, 10, 'all']

// Filter modes: one of architects, eras or countries alone, or countries + eras together.
export const MODES = ['architect', 'era', 'country', 'countryEra']

export const emptyConfig = { mode: 'architect', architects: [], eras: [], countries: [], rounds: 10 }

const CONFIG_KEY = 'arch-guesser:custom'
const SESSION_KEY = 'arch-guesser:custom-session'

/** Buildings matching the config. Inside a filter, any pick matches; countries + eras need both. */
export function filterPool(catalogue, { mode, architects, eras, countries }) {
  const has = (list, value) => list.includes(value)
  const match = {
    architect: (b) => b.architects.some((a) => has(architects, a)),
    era: (b) => has(eras, b.era),
    country: (b) => has(countries, b.countryCode),
    // An empty side means "any"; both empty matches nothing.
    countryEra: (b) => (eras.length || countries.length) > 0 && (!countries.length || has(countries, b.countryCode)) && (!eras.length || has(eras, b.era)),
  }[mode]
  return catalogue.filter(match)
}

/** Picker rows: [{ key, label, count }] for every distinct value, most buildings first. */
export function facets(catalogue, valuesOf, labelOf) {
  const counts = new Map()
  for (const b of catalogue) for (const key of new Set(valuesOf(b))) counts.set(key, (counts.get(key) ?? 0) + 1)
  return [...counts]
    .map(([key, count]) => ({ key, label: labelOf(key, catalogue), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

function read(storage, key) {
  try {
    return JSON.parse(storage.getItem(key))
  } catch {
    return null
  }
}

function write(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore: nothing is remembered.
  }
}

// Remembered between visits. Spread over the default so an older or damaged value can't break the form.
export const readConfig = () => ({ ...emptyConfig, ...read(localStorage, CONFIG_KEY) })
export const saveConfig = (config) => write(localStorage, CONFIG_KEY, config)

export function shuffle(items, random = Math.random) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** A session is one shuffled run through the pool; it lives in this tab only. */
export function startSession(pool, config, random) {
  const ids = shuffle(pool.map((b) => b.id), random)
  const session = { config, ids: config.rounds === 'all' ? ids : ids.slice(0, config.rounds), index: 0, played: [] }
  write(sessionStorage, SESSION_KEY, session)
  return session
}

export const readSession = () => read(sessionStorage, SESSION_KEY)
export const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Ignore.
  }
}

/** Moves on from `building`, recording it for the recap. Returns the saved session. */
export function advanceSession(session, building) {
  const played = building ? [...session.played, { id: building.id, name: building.name, wikipedia: building.wikipedia }] : session.played
  const next = { ...session, played, index: session.index + 1 }
  write(sessionStorage, SESSION_KEY, next)
  return next
}
