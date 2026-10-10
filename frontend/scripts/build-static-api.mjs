// Turns the Spring Boot catalogue into static JSON so the app can be hosted on a static host.
//   public/api/eras.json                 -> GET /api/eras
//   public/api/buildings/index.json      -> every building id (the browser picks the random one)
//   public/api/buildings/{id}.json       -> GET /api/buildings/{id}
// The Java side stays the source of truth: BuildingValidator checks buildings.json at startup and
// in `./gradlew test`, and Era.java defines the eras, so run those before shipping data changes.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const buildingsFile = join(root, 'src/main/resources/data/buildings.json')
const eraFile = join(root, 'src/main/java/com/mtsguerra/archguesser/building/Era.java')
const out = join(root, 'frontend/public/api')

const write = (path, value) => writeFileSync(path, JSON.stringify(value))

// The Spring API serializes every record component, writing null for optional ones the source
// JSON leaves out. Read the component names from the Java records so the static files match.
const javaDir = join(root, 'src/main/java/com/mtsguerra/archguesser/building')
function components(record) {
  const source = readFileSync(join(javaDir, `${record}.java`), 'utf8')
  const start = source.indexOf(`record ${record}(`) + `record ${record}(`.length
  let depth = 0
  let end = start
  for (; end < source.length; end++) {
    const c = source[end]
    if (c === '<' || c === '(') depth++
    else if (c === '>') depth--
    else if (c === ')') {
      if (depth === 0) break
      depth--
    }
  }
  const names = []
  let part = ''
  depth = 0
  for (const c of source.slice(start, end) + ',') {
    if (c === '<') depth++
    else if (c === '>') depth--
    if (c === ',' && depth === 0) {
      const name = part.replace(/\/\*[\s\S]*?\*\//g, '').trim().split(/\s+/).pop()
      if (name) names.push(name)
      part = ''
    } else part += c
  }
  return names
}
const fields = Object.fromEntries(
  ['Building', 'Architect', 'Location', 'Drawing', 'Photo', 'Hint', 'Summary', 'Crop'].map((r) => [r, components(r)]),
)
const full = (record, value) => Object.fromEntries(fields[record].map((name) => [name, value[name] ?? null]))
const each = (list, record) => (list ?? []).map((item) => full(record, item))

const toApi = (b) => ({
  ...full('Building', b),
  aliases: b.aliases ?? [],
  architects: each(b.architects, 'Architect'),
  location: full('Location', b.location),
  drawings: (b.drawings ?? []).map((d) => ({ ...full('Drawing', d), crop: d.crop ? full('Crop', d.crop) : null })),
  photos: (b.photos ?? []).map((p) => ({ ...full('Photo', p), crop: p.crop ? full('Crop', p.crop) : null })),
  hints: each(b.hints, 'Hint'),
  summary: full('Summary', b.summary),
})

const buildings = JSON.parse(readFileSync(buildingsFile, 'utf8')).map(toApi)

const eraPattern = /^\s*([A-Z_]+)\("([^"]+)",\s*(-?\d+),\s*(-?\d+|null)\)/gm
const eras = [...readFileSync(eraFile, 'utf8').matchAll(eraPattern)].map(([, id, label, start, end]) => ({
  id,
  label,
  startYear: Number(start),
  endYear: end === 'null' ? null : Number(end),
}))
if (eras.length === 0) throw new Error(`No eras found in ${eraFile}`)
const unknownEra = buildings.find((b) => !eras.some((e) => e.id === b.era))
if (unknownEra) throw new Error(`${unknownEra.id} uses an era missing from Era.java: ${unknownEra.era}`)

rmSync(out, { recursive: true, force: true })
mkdirSync(join(out, 'buildings'), { recursive: true })
write(join(out, 'eras.json'), eras)
write(join(out, 'buildings', 'index.json'), buildings.map((b) => b.id))
for (const b of buildings) write(join(out, 'buildings', `${b.id}.json`), b)
console.log(`Static API: ${buildings.length} buildings, ${eras.length} eras -> ${out}`)
