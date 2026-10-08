import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readSeen, recordSeen } from './seenBuildings.js'

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
  }
}

describe('seen buildings', () => {
  beforeEach(() => vi.stubGlobal('sessionStorage', memoryStorage()))

  it('appends new ids', () => {
    recordSeen('a', readSeen())
    recordSeen('b', readSeen())
    expect(readSeen()).toEqual(['a', 'b'])
  })

  it('restarts the list when the backend repeats a building', () => {
    recordSeen('a', [])
    recordSeen('b', readSeen())
    recordSeen('a', readSeen())
    expect(readSeen()).toEqual(['a'])
  })

  it('survives broken or blocked storage', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => '{not json',
      setItem: () => {
        throw new Error('blocked')
      },
    })
    expect(readSeen()).toEqual([])
    expect(() => recordSeen('a', [])).not.toThrow()
  })
})
