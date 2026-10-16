export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getJson(path, signal) {
  const res = await fetch(path, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) {
    // Backend errors are RFC 9457 problem+json; fall back to the status text.
    const problem = await res.json().catch(() => null)
    throw new ApiError(res.status, problem?.detail ?? res.statusText)
  }
  return res.json()
}

// Deployed builds (`npm run build:static`) have no Spring backend: the catalogue ships as static JSON
// files (scripts/build-static-api.mjs) and the browser makes the random pick the backend makes in dev.
const staticApi = import.meta.env.VITE_STATIC_API === 'true'

/**
 * Same rule as BuildingService.random: an unseen id if any is left, otherwise any id, so play never
 * dead-ends. `random` is injectable for tests.
 */
export function pickBuildingId(ids, exclude, random = Math.random) {
  if (ids.length === 0) throw new ApiError(404, 'The building catalogue is empty')
  const unseen = ids.filter((id) => !exclude.includes(id))
  const pool = unseen.length > 0 ? unseen : ids
  return pool[Math.floor(random() * pool.length)]
}

// English is the source text; other languages ask for a translated copy of the same building.
const staticBuildingPath = (id, lang) => `/api/${lang && lang !== 'en' ? `${lang}/` : ''}buildings/${id}.json`

/** A random building, preferring ids not in `exclude`, in `lang` (default English). */
export async function fetchRandomBuilding(exclude, signal, lang = 'en') {
  if (staticApi) {
    const ids = await getJson('/api/buildings/index.json', signal)
    return getJson(staticBuildingPath(pickBuildingId(ids, exclude), lang), signal)
  }
  const params = new URLSearchParams()
  if (exclude.length) params.set('exclude', exclude.join(','))
  if (lang !== 'en') params.set('lang', lang)
  const query = params.size ? `?${params}` : ''
  return getJson(`/api/buildings/random${query}`, signal)
}

/** One building by id, in `lang`; used to swap the text when the language changes mid-round. */
export function fetchBuilding(id, signal, lang = 'en') {
  if (staticApi) return getJson(staticBuildingPath(id, lang), signal)
  const query = lang !== 'en' ? `?${new URLSearchParams({ lang })}` : ''
  return getJson(`/api/buildings/${encodeURIComponent(id)}${query}`, signal)
}

let ids
/** Every building id, fetched once (the file is small); a failure is not cached. */
export function fetchBuildingIds() {
  ids ??= getJson(staticApi ? '/api/buildings/index.json' : '/api/buildings/ids').catch((error) => {
    ids = undefined
    throw error
  })
  return ids
}

let catalogue
/** The filterable fields of every building, fetched once; a failure is not cached. */
export function fetchCatalogue() {
  catalogue ??= getJson(staticApi ? '/api/buildings/catalogue.json' : '/api/buildings/catalogue').catch((error) => {
    catalogue = undefined
    throw error
  })
  return catalogue
}

export function fetchEras(signal) {
  return getJson(staticApi ? '/api/eras.json' : '/api/eras', signal)
}
