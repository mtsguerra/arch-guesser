import { useRef, useState } from 'react'
import { CENTROIDS } from '../../game/countryCentroids.js'
import { SHAPES } from '../../game/countryShapes.js'
import { C, R, graticule, project, silhouette } from '../../game/globe.js'
import { useStrings } from '../../i18n.js'
import styles from './LibraryGlobe.module.css'

const START = { lat: 25, lon: 15 }
const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

/**
 * A globe you can turn: every country with an unlocked building is filled and carries a pin, and selecting
 * one filters the Library to it. Countries with nothing unlocked are not drawn, so the globe says nothing about what is locked.
 *
 * @param counts  { countryCode: unlocked buildings }
 * @param selected  the filtered country code, or ''
 * @param onPick(code)  called with a country's code (the same code again clears it, decided by the caller)
 * @param nameOf(code)  the country's name
 */
export function LibraryGlobe({ counts, selected, onPick, nameOf }) {
  const t = useStrings().library.globe
  const [view, setView] = useState(START)
  const drag = useRef(null)
  const moved = useRef(0) // how far the last press travelled; it outlives the press so the click that follows can tell
  const codes = Object.keys(counts)

  const move = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    drag.current = { x: e.clientX, y: e.clientY }
    moved.current += Math.abs(dx) + Math.abs(dy)
    setView((v) => ({ lon: v.lon - dx * 0.5, lat: clamp(v.lat + dy * 0.4, -75, 75) }))
  }
  const end = () => {
    drag.current = null
  }
  // A press that turned the globe is not a selection.
  const pick = (code) => moved.current < 4 && onPick(code)

  return (
    <figure className={styles.globe}>
      <figcaption className={styles.title}>{t.title}</figcaption>
      <svg
        className={styles.svg}
        viewBox="0 0 200 200"
        role="img"
        aria-label={t.aria(codes.length)}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY }
          moved.current = 0
        }}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      >
        <circle className={styles.disc} cx={C} cy={C} r={R} />
        <path className={styles.lines} d={graticule(view.lat, view.lon)} />
        {codes.map((code) => {
          const d = SHAPES[code] ? silhouette(SHAPES[code], view.lat, view.lon) : ''
          return d && <path key={code} className={styles.country} data-selected={selected === code || undefined} d={d} onClick={() => pick(code)}><title>{t.country(nameOf(code), counts[code])}</title></path>
        })}
        {codes.map((code) => {
          const at = CENTROIDS[code] && project(...CENTROIDS[code], view.lat, view.lon)
          if (!at) return null
          const [x, y] = at.split(' ').map(Number)
          return <circle key={code} className={styles.pin} data-selected={selected === code || undefined} cx={x} cy={y} r={2.2 + Math.min(3, counts[code] * 0.4)} onClick={() => pick(code)} />
        })}
      </svg>
      <p className={styles.hint}>{t.hint}</p>
    </figure>
  )
}
