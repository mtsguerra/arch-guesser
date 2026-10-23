import { useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { countryName } from '../../game/countries.js'
import { CENTROIDS } from '../../game/countryCentroids.js'
import { SHAPES } from '../../game/countryShapes.js'
import { useLanguage } from '../../i18n.js'
import { easeOut } from '../../motion.js'
import styles from './VeiledGlobe.module.css'
import { useReducedMotion } from '../../motionPref.js'

const R = 88
const C = 100
const RAD = Math.PI / 180
const IDLE = { lat: 25, lon: 20 }
const TURN = { duration: 1.6, ease: easeOut }
const SPIN = { duration: 2.6, ease: easeOut } // a full turn first, then it comes to rest on the country

// Orthographic projection; null on the far side of the globe (`limb`: pushed out to the edge of the disc instead).
function project(lat, lon, lat0, lon0, limb = false) {
  const p = lat * RAD
  const p0 = lat0 * RAD
  const dl = (lon - lon0) * RAD
  const front = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(dl) > 0
  if (!front && !limb) return null
  let x = R * Math.cos(p) * Math.sin(dl)
  let y = -R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(dl))
  if (!front) {
    const norm = Math.hypot(x, y) || 1
    x = (x / norm) * R
    y = (y / norm) * R
  }
  return `${(C + x).toFixed(1)} ${(C + y).toFixed(1)}`
}

// A country as filled outlines. Points past the horizon sit on the edge, which clips a country that runs round the back.
function silhouette(rings, lat0, lon0) {
  let d = ''
  for (const ring of rings) {
    if (!ring.some(([lon, lat]) => project(lat, lon, lat0, lon0))) continue
    d += `${ring.map(([lon, lat], i) => `${i ? 'L' : 'M'}${project(lat, lon, lat0, lon0, true)}`).join('')}Z`
  }
  return d
}

function graticule(lat0, lon0) {
  let d = ''
  const trace = (points) => {
    let pen = false
    for (const [lat, lon] of points) {
      const xy = project(lat, lon, lat0, lon0)
      d += xy ? `${pen ? 'L' : 'M'}${xy}` : ''
      pen = xy !== null
    }
  }
  for (let lon = -180; lon < 180; lon += 30) trace(Array.from({ length: 37 }, (_, i) => [-90 + i * 5, lon]))
  for (let lat = -60; lat <= 60; lat += 30) trace(Array.from({ length: 73 }, (_, i) => [lat, -180 + i * 5]))
  return d
}

/**
 * A bare graticule that hides where the building is. Once the country guess is right it spins once, then turns to
 * that country and drops a pin. `found` is true after the guess locks or the answer is revealed.
 */
export function VeiledGlobe({ code, found }) {
  const { lang, strings } = useLanguage()
  const text = strings.board.globe
  const reduceMotion = useReducedMotion()
  const centre = CENTROIDS[code]
  const known = found && centre
  const lat = known ? centre[0] : IDLE.lat
  const lon = known ? centre[1] : IDLE.lon
  const latValue = useMotionValue(lat)
  const lonValue = useMotionValue(lon)
  const path = useTransform([latValue, lonValue], ([a, b]) => graticule(a, b))
  const rings = known ? SHAPES[code] : undefined // not before the guess: the outline would give the country away
  const shape = useTransform([latValue, lonValue], ([a, b]) => (rings?.length ? silhouette(rings, a, b) : ''))

  useEffect(() => {
    if (reduceMotion) {
      latValue.set(lat)
      lonValue.set(lon)
      return undefined
    }
    // Going to the country, the globe first spins once all the way round (eastward) and ends on it.
    const start = lonValue.get()
    const spun = start + ((((lon - start) % 360) + 360) % 360) + 360
    const turns = known
      ? [
          animate(latValue, lat, SPIN),
          animate(lonValue, spun, { ...SPIN, onComplete: () => lonValue.set(lon) }), // same place, so the next turn starts from a plain angle
        ]
      : [animate(latValue, lat, TURN), animate(lonValue, lon, TURN)]
    return () => turns.forEach((t) => t.stop())
  }, [lat, lon, known, latValue, lonValue, reduceMotion])

  const name = known ? (countryName(code, lang) ?? code) : text.hidden

  return (
    <figure className={styles.globe}>
      <svg viewBox="0 0 200 200" className={styles.svg} role="img" aria-label={name}>
        <circle className={styles.disc} cx={C} cy={C} r={R} />
        <motion.path className={styles.lines} d={path} />
        <motion.path
          className={styles.shape}
          d={shape}
          initial={false}
          animate={{ opacity: rings?.length ? 1 : 0 }}
          transition={{ duration: 0.6, ease: easeOut, delay: known && !reduceMotion ? 1.9 : 0 }}
        />
        <motion.text
          className={styles.question}
          x={C}
          y={C + 20}
          textAnchor="middle"
          initial={false}
          animate={{ opacity: known ? 0 : 1 }}
        >
          ?
        </motion.text>
        <motion.g
          className={styles.pin}
          initial={false}
          animate={{ opacity: known ? 1 : 0, scale: known ? 1 : 0.4 }}
          transition={{ duration: 0.45, ease: easeOut, delay: known && !reduceMotion ? 2.1 : 0 }}
        >
          <circle className={styles.ring} cx={C} cy={C} r="11" />
          <circle className={styles.dot} cx={C} cy={C} r="4.5" />
        </motion.g>
      </svg>
      <figcaption className={styles.caption}>
        <span className={styles.label}>{text.label}</span>
        <strong className={known ? styles.name : styles.hidden}>{name}</strong>
        <span className={styles.note}>{known ? text.coords(centre[0], centre[1]) : text.hint}</span>
      </figcaption>
    </figure>
  )
}
