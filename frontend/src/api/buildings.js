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

/** A random building, preferring ids not in `exclude`. */
export async function fetchRandomBuilding(exclude, signal) {
  if (staticApi) {
    const ids = await getJson('/api/buildings/index.json', signal)
    return getJson(`/api/buildings/${pickBuildingId(ids, exclude)}.json`, signal)
  }
  const query = exclude.length ? `?${new URLSearchParams({ exclude: exclude.join(',') })}` : ''
  return getJson(`/api/buildings/random${query}`, signal)
}

export function fetchEras(signal) {
  return getJson(staticApi ? '/api/eras.json' : '/api/eras', signal)
}
