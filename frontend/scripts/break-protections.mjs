// Breaks each protection on purpose and checks that a test notices, so we know the tests can fail.
//   node scripts/break-protections.mjs        (from frontend/; every line must say CAUGHT)
// Each case edits one file, runs the test that should fail, then puts the file back. SETUP-ERROR
// means the text to break was not found: the code moved, so update the case. Exit code 1 if any
// protection is NOT CAUGHT or a case could not be set up.
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const frontend = join(dirname(fileURLToPath(import.meta.url)), '..')
const repo = join(frontend, '..')

const cases = [
  ['CSP allows inline scripts', join(repo, 'vercel.json'), "script-src 'self';", "script-src 'self' 'unsafe-inline';", 'src/deploy.test.js'],
  ['CSP allows framing', join(repo, 'vercel.json'), "frame-ancestors 'none'", 'frame-ancestors *', 'src/deploy.test.js'],
  ['CSP allows any https image', join(repo, 'vercel.json'), 'img-src \'self\' data: https://upload.wikimedia.org', "img-src 'self' data: https:", 'src/deploy.test.js'],
  ['CSP allows any connection', join(repo, 'vercel.json'), "connect-src 'self'", "connect-src *", 'src/deploy.test.js'],
  ['saved daily result is trusted without checks', join(frontend, 'src/game/daily.js'), 'saved?.number === number && validResult(saved)', 'saved?.number === number', 'src/game/daily.test.js'],
  ['recap links are not limited to https', join(frontend, 'src/game/custom.js'), "p.wikipedia.startsWith('https://')", 'true', 'src/game/custom.test.js'],
  ['session ids are not checked', join(frontend, 'src/game/custom.js'), '!s.ids.every(isId)', 'false', 'src/game/custom.test.js'],
  ['stored filter mode is not checked', join(frontend, 'src/game/custom.js'), 'MODES.includes(v.mode) ? v.mode : emptyConfig.mode', 'v.mode', 'src/game/custom.test.js'],
]

let originals = []
const restore = () => originals.forEach(([file, text]) => writeFileSync(file, text))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => (restore(), process.exit(130)))

let failed = 0
for (const [name, file, find, replace, test] of cases) {
  const original = readFileSync(file, 'utf8')
  if (!original.includes(find)) {
    console.log(`SETUP-ERROR  ${name}`)
    failed++
    continue
  }
  originals = [[file, original]]
  writeFileSync(file, original.replace(find, replace))
  const run = spawnSync('npx', ['vitest', 'run', test], { cwd: frontend, encoding: 'utf8' })
  restore()
  originals = []
  const caught = run.status !== 0
  console.log(`${caught ? 'CAUGHT     ' : 'NOT CAUGHT'}  ${name}`)
  if (!caught) failed++
}
process.exit(failed ? 1 : 0)
