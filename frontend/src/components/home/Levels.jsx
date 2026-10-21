import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useStrings } from '../../i18n.js'
import { DRAWING_ERAS } from './pencil.js'
import { PencilDrawing } from './PencilDrawing.jsx'
import styles from './Levels.module.css'
import { useReducedMotion } from '../../motionPref.js'

// y of each level in the drawing's 400×244 viewBox (the ground line is at 214): top storey, first floor, ground.
const LEVELS = [54, 134, 214]
const STOREY = 80
const ABOVE = STOREY - LEVELS[0] // the top storey's hatch rises this far above the drawing (26 of 400 units wide: see .elevation)
// The sheet of lines is wider than the drawing (which is 86.7% of it, centred): the view box reaches this far past it on each side.
const X0 = -30.7
const VW = 461.4
const TOUR_MS = 3400
const RESUME_MS = 4500

// Three hand-drawn underlines, so the names don't all get the same stroke.
const STROKES = [
  'M2 7 C60 3 120 10 180 6 S300 4 350 7',
  'M2 6 C70 9 130 3 190 7 S310 9 350 5',
  'M2 8 C50 4 110 9 170 5 S290 8 350 6',
]

/**
 * The modes as the levels of a building: the era elevation draws itself, three level lines cross it,
 * and a datum marker glides to the active level. The active level tours on its own; pointing at or
 * tabbing to a mode holds it there. On phones the labels become rows under the drawing.
 *
 * @param modes  [{ key, href, name, text, action, today? }], top level first
 */
export function Levels({ modes }) {
  const strings = useStrings()
  const t = strings.home.levels
  const reduceMotion = useReducedMotion()
  const hatch = `levels-hatch-${useId().replace(/:/g, '')}`
  const [active, setActive] = useState(0)
  const [era, setEra] = useState(null)
  const held = useRef(false)
  const resumeAt = useRef(0)

  useEffect(() => {
    if (reduceMotion) return undefined
    const timer = setInterval(() => {
      if (held.current || Date.now() < resumeAt.current) return
      setActive((i) => (i + 1) % LEVELS.length)
    }, TOUR_MS)
    return () => clearInterval(timer)
  }, [reduceMotion])

  const hold = (i) => {
    held.current = true
    setActive(i)
  }
  const release = () => {
    held.current = false
    resumeAt.current = Date.now() + RESUME_MS
  }
  const onDrawing = useCallback((i) => setEra(DRAWING_ERAS[i]), [])
  const y = LEVELS[active]

  return (
    <section className={styles.stage} aria-label={t.label}>
      <div className={styles.elevation}>
        <div className={styles.frame}>
          <PencilDrawing className={styles.drawing} onDrawing={onDrawing} />
          <svg className={styles.overlay} viewBox={`${X0} 0 ${VW} 244`} aria-hidden="true">
            <defs>
              <pattern id={hatch} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="7" className={styles.hatchLine} />
              </pattern>
            </defs>
            {LEVELS.map((ly, i) => (
              <g key={ly} className={styles.level} data-on={i === active || undefined} style={{ '--i': i }}>
                <rect className={styles.band} x={X0} y={ly - STOREY} width={VW} height={STOREY} fill={`url(#${hatch})`} />
                <line className={styles.line} pathLength="1" x1={X0 - 8} x2={X0 + VW} y1={ly} y2={ly} />
                <path className={styles.datum} d={`M${X0 - 26} ${ly - 9}H${X0 - 10}L${X0 - 18} ${ly}Z`} />
              </g>
            ))}
            <text key={`storey-${active}`} className={styles.storey} x={X0 + VW - 2} y={y - 5} textAnchor="end">
              {t.storey(t.heights[active])}
            </text>
            <line key={`glow-${active}`} className={styles.glow} x1={X0 - 8} x2={X0 + VW} y1={y} y2={y} />
            <g className={styles.marker} style={{ transform: `translateY(${y}px)` }}>
              <path d={`M${X0 - 27} -10H${X0 - 9}L${X0 - 18} 0Z`} />
            </g>
          </svg>
        </div>
        <p className={styles.caption} aria-live="polite">
          {era && t.caption(strings.eras[era])}
        </p>
      </div>

      <ol className={styles.modes}>
        {modes.map((mode, i) => (
          <li
            key={mode.key}
            className={styles.mode}
            style={{ '--y': (LEVELS[i] + ABOVE) / (244 + ABOVE), '--i': i }}
            data-on={i === active || undefined}
            data-main={i === 0 || undefined}
          >
            <a
              className={styles.link}
              href={mode.href}
              onPointerEnter={() => hold(i)}
              onPointerLeave={release}
              onFocus={() => hold(i)}
              onBlur={release}
            >
              <span className={styles.meta}>
                <span className={styles.height}>{t.heights[i]}</span>
                {mode.today && <em className={styles.badge}>{t.today}</em>}
                <span className={styles.go}>
                  {mode.action} <span aria-hidden="true">→</span>
                </span>
              </span>
              <span className={styles.nameWrap}>
                <h2 className={styles.name}>{mode.name}</h2>
                <svg className={styles.underline} viewBox="0 0 352 12" preserveAspectRatio="none" aria-hidden="true">
                  <path pathLength="1" d={STROKES[i]} />
                </svg>
              </span>
              <span className={styles.text}>{mode.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
