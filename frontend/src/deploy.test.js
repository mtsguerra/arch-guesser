import { execFileSync } from 'node:child_process'
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

describe('transport and isolation headers', () => {
  it('forces https for a long time and upgrades stray http requests', () => {
    expect(Number(/max-age=(\d+)/.exec(header('Strict-Transport-Security'))?.[1])).toBeGreaterThanOrEqual(31_536_000)
    expect(policy['upgrade-insecure-requests']).toEqual([])
  })

  it('refuses framing, and isolates the page from other origins', () => {
    expect(header('X-Frame-Options')).toBe('DENY')
    expect(header('Cross-Origin-Opener-Policy')).toBe('same-origin')
    expect(header('Cross-Origin-Resource-Policy')).toBe('same-origin')
  })

  it('switches off the browser features the site never uses', () => {
    for (const feature of ['camera', 'microphone', 'geolocation', 'payment', 'usb']) {
      expect(header('Permissions-Policy')).toContain(`${feature}=()`)
    }
  })
})

describe('repository hygiene', () => {
  const root = new URL('../../', import.meta.url)
  const read = (file) => readFileSync(new URL(file, root), 'utf8')

  it('pins the Gradle download to a checksum', () => {
    expect(read('gradle/wrapper/gradle-wrapper.properties')).toMatch(/^distributionSha256Sum=[0-9a-f]{64}$/m)
  })

  it('keeps secrets and local data out of git', () => {
    const rules = read('.gitignore').split('\n').map((line) => line.trim())
    for (const rule of ['.env', '.env.*', '*.pem', '*.key', '*.db', '*.log']) expect(rules).toContain(rule)
  })

  it('has no secret-looking file under version control', () => {
    let files
    try {
      files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n')
    } catch {
      return // not a git checkout (a source archive): nothing to inspect
    }
    const risky = files.filter((f) => /(^|\/)\.env(\.|$)|\.(pem|key|p12|jks|keystore|db|sqlite)$|id_rsa/i.test(f) && !f.endsWith('.env.example'))
    expect(risky).toEqual([])
  })
})
