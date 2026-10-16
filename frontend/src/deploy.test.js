import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// The deploy config is a protection too: these fail if a header that keeps the site safe is weakened.
const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'))
const everywhere = config.headers.find((h) => h.source === '/(.*)').headers
const header = (name) => everywhere.find((h) => h.key === name)?.value
const policy = Object.fromEntries(
  header('Content-Security-Policy')
    .split(';')
    .map((part) => part.trim().split(/\s+/))
    .filter(([name]) => name)
    .map(([name, ...sources]) => [name, sources]),
)

describe('deploy headers', () => {
  it('only runs scripts from the site itself', () => {
    expect(policy['script-src']).toEqual(["'self'"])
    expect(policy['default-src']).toEqual(["'self'"])
  })

  it('loads images only from the site and Wikimedia, and talks only to itself', () => {
    expect(policy['img-src']).toEqual(["'self'", 'data:', 'https://upload.wikimedia.org'])
    expect(policy['connect-src']).toEqual(["'self'"])
  })

  it('blocks plugins, framing and base-tag tricks, and allows only its own manifest', () => {
    expect(policy['object-src']).toEqual(["'none'"])
    expect(policy['frame-ancestors']).toEqual(["'none'"])
    expect(policy['base-uri']).toEqual(["'self'"])
    expect(policy['manifest-src']).toEqual(["'self'"])
  })

  it('stops content sniffing and trims the referrer', () => {
    expect(header('X-Content-Type-Options')).toBe('nosniff')
    expect(header('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
  })

  it('serves the manifest with its own content type', () => {
    const manifest = config.headers.find((h) => h.source === '/manifest.webmanifest')
    expect(manifest.headers[0]).toEqual({ key: 'Content-Type', value: 'application/manifest+json' })
  })
})
