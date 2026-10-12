import { useEffect, useEffectEvent } from 'react'
import { motion } from 'motion/react'
import { useStrings } from '../../i18n.js'
import { easeOut } from '../../motion.js'
import styles from './RevealBuild.module.css'

const TOTAL_MS = 4400

// A civic front elevation, drawn the way it would be built: ground and steps, columns going
// up, the entablature, then the pediment. `delay` is in seconds from the start.
const COLUMNS = Array.from({ length: 6 }, (_, i) => 92 + i * 43.2)
const STROKES = [
  { d: 'M24 214H376', delay: 0.15, duration: 0.7, tone: 'ground' },
  { d: 'M48 214V202H352V214', delay: 0.4, duration: 0.6 },
  { d: 'M62 202V190H338V202', delay: 0.6, duration: 0.6 },
  ...COLUMNS.map((x, i) => ({
    d: `M${x - 6} 190V112H${x + 6}V190`,
    delay: 0.9 + i * 0.13,
    duration: 0.55,
    tone: 'column',
  })),
  { d: 'M70 112H330V98H70Z', delay: 1.65, duration: 0.6 },
  { d: 'M70 98L200 42L330 98', delay: 1.9, duration: 0.7 },
  { d: 'M178 84H222L200 62Z', delay: 2.3, duration: 0.5, tone: 'accent' },
  { d: 'M24 230H376M24 224V236M376 224V236', delay: 0.3, duration: 1.2, tone: 'dimension' },
]

/**
 * The answer being built: a blueprint plots itself, the building rises into it, and the
 * name, architect and place are lettered in. About four seconds, and it can be skipped.
 */
export function RevealBuild({ building, onDone }) {
  const strings = useStrings()
  const settle = useEffectEvent(onDone)

  useEffect(() => {
    const timer = setTimeout(settle, TOTAL_MS)
    const onKey = (event) => event.key === 'Escape' && settle()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const { name, architects, location, yearCompleted } = building
  const place = [location.city, location.country].filter(Boolean).join(', ')
  const meta = [place, yearCompleted].filter(Boolean).join(' · ')

  return (
    <motion.div
      className={styles.overlay}
      role="status"
      aria-label={strings.reveal.building}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.35 } }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: easeOut } }}
      onClick={onDone}
    >
      <button type="button" className={styles.skip} onClick={onDone}>
        {strings.reveal.skip}
      </button>

      <div className={styles.stage}>
        <svg className={styles.drawing} viewBox="0 0 400 244" aria-hidden="true">
          <motion.rect
            className={styles.mass}
            x="70"
            y="98"
            width="260"
            height="92"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 1.7, duration: 1.1, ease: easeOut }}
          />
          {STROKES.map(({ d, delay, duration, tone = 'line' }) => (
            <motion.path
              key={d}
              d={d}
              className={styles[tone]}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay, duration, ease: easeOut }}
            />
          ))}
        </svg>

        <div className={styles.lettering}>
          <motion.h2
            className={styles.name}
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ delay: 2.3, duration: 0.9, ease: easeOut }}
          >
            {name}
          </motion.h2>
          <motion.p
            className={styles.architect}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.9, duration: 0.5, ease: easeOut }}
          >
            {architects.map((a) => a.name).join(' & ')}
          </motion.p>
          <motion.p
            className={styles.meta}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.15, duration: 0.5, ease: easeOut }}
          >
            {meta}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
