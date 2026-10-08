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

/** A random building, preferring ids not in `exclude`. */
export function fetchRandomBuilding(exclude, signal) {
  const query = exclude.length ? `?${new URLSearchParams({ exclude: exclude.join(',') })}` : ''
  return getJson(`/api/buildings/random${query}`, signal)
}

export function fetchEras(signal) {
  return getJson('/api/eras', signal)
}
