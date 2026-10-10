import { afterEach, describe, expect, it, vi } from 'vitest'
import { pickBuildingId } from './buildings.js'

describe('pickBuildingId', () => {
  const ids = ['a', 'b', 'c']

  it('prefers ids that have not been seen', () => {
    expect(pickBuildingId(ids, ['a', 'c'], () => 0)).toBe('b')
    expect(pickBuildingId(ids, ['a'], () => 0.99)).toBe('c')
  })

  it('ignores exclusions once every building has been seen', () => {
    expect(pickBuildingId(ids, ['a', 'b', 'c', 'x'], () => 0.5)).toBe('b')
  })

  it('fails clearly on an empty catalogue', () => {
    expect(() => pickBuildingId([], [])).toThrow('catalogue is empty')
  })
})

describe('static API mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  async function staticClient(responses) {
    vi.stubEnv('VITE_STATIC_API', 'true')
    const fetchMock = vi.fn(async (path) => ({ ok: true, json: async () => responses[path] }))
    vi.stubGlobal('fetch', fetchMock)
    vi.resetModules()
    return { client: await import('./buildings.js'), fetchMock }
  }

  it('loads the id index, then the picked building file', async () => {
    const building = { id: 'b', name: 'B' }
    const { client, fetchMock } = await staticClient({
      '/api/buildings/index.json': ['a', 'b'],
      '/api/buildings/b.json': building,
    })
    await expect(client.fetchRandomBuilding(['a'])).resolves.toBe(building)
    expect(fetchMock.mock.calls.map(([path]) => path)).toEqual(['/api/buildings/index.json', '/api/buildings/b.json'])
  })

  it('reads eras from the static file', async () => {
    const eras = [{ id: 'BAROQUE' }]
    const { client, fetchMock } = await staticClient({ '/api/eras.json': eras })
    await expect(client.fetchEras()).resolves.toBe(eras)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/eras.json')
  })
})
