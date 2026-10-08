import { isCloseTo, normalize } from './text.js'

// Region codes Intl knows that aren't countries.
const NOT_COUNTRIES = new Set(['EU', 'EZ', 'QO', 'UN', 'XA', 'XB', 'ZZ'])

// Common names Intl doesn't produce.
const ALIASES = {
  usa: 'US',
  'united states of america': 'US',
  america: 'US',
  uk: 'GB',
  britain: 'GB',
  'great britain': 'GB',
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  holland: 'NL',
  turkey: 'TR',
  'czech republic': 'CZ',
  russia: 'RU',
  'south korea': 'KR',
  'north korea': 'KP',
  'ivory coast': 'CI',
  burma: 'MM',
  vatican: 'VA',
}

const DISPLAY_LOCALE = 'en'

// Drops deprecated codes that alias a current one (FX → FR, BU → MM, YU → RS).
function isCanonical(code) {
  return Intl.getCanonicalLocales(`und-${code}`)[0] === `und-${code}`
}

function regionNames(locale) {
  const names = new Intl.DisplayNames([locale], { type: 'region', fallback: 'none' })
  const result = []
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b)
      if (NOT_COUNTRIES.has(code) || !isCanonical(code)) continue
      const name = names.of(code)
      if (name && name !== code) result.push({ code, name })
    }
  }
  return result
}

let cache
function index() {
  if (cache) return cache
  const countries = regionNames(DISPLAY_LOCALE).sort((x, y) => x.name.localeCompare(y.name, DISPLAY_LOCALE))
  const byName = new Map(countries.map((c) => [normalize(c.name), c.code]))

  // Also accept names in the player's own language ("Estados Unidos", "Itália").
  const userLocale = typeof navigator !== 'undefined' ? navigator.language : undefined
  if (userLocale && !userLocale.startsWith(DISPLAY_LOCALE)) {
    for (const { code, name } of regionNames(userLocale)) byName.set(normalize(name), code)
  }
  for (const [alias, code] of Object.entries(ALIASES)) byName.set(alias, code)

  cache = { countries, byName, codes: new Set(countries.map((c) => c.code)) }
  return cache
}

/** All countries as { code, name }, sorted by English name. */
export function allCountries() {
  return index().countries
}

/** Up to `limit` suggestions: prefix matches first, then names containing the query. */
export function suggestCountries(query, limit = 8) {
  const q = normalize(query)
  if (!q) return []
  const prefix = []
  const contains = []
  for (const country of index().countries) {
    const name = normalize(country.name)
    if (name.startsWith(q)) prefix.push(country)
    else if (name.includes(` ${q}`)) contains.push(country)
  }
  return [...prefix, ...contains].slice(0, limit)
}

/** ISO code for free text ("usa", "France", "Itália", "Frnace"), or null. */
export function resolveCountryCode(text) {
  const q = normalize(text)
  if (!q) return null
  const { byName, codes } = index()
  if (q.length === 2 && codes.has(q.toUpperCase())) return q.toUpperCase()
  if (byName.has(q)) return byName.get(q)
  for (const [name, code] of byName) {
    if (isCloseTo(q, name)) return code
  }
  return null
}
