import { AnimatePresence, motion } from 'motion/react'
import styles from './PickSketch.module.css'

// One small drawing per kind of pick, in a 24-unit box: a set square, a column, a map pin with a ring.
const SQUARE = 'M3.5 20.5v-17l17 17zM7 17.5v-5l5 5z' // the band along the slope is the widest
const COLUMN = 'M5 21h14M6 18h12M8 18V8M16 18V8M12 18V8M5 8h14M7 5h10'
const PIN = 'M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z'
const SHOWN = 10

function Glyph({ kind, ghost }) {
  if (kind === 'countries') {
    return (
      <>
        <path d={PIN} pathLength="1" />
        <circle cx="12" cy="10" r="3.2" pathLength="1" />
      </>
    )
  }
  if (kind === 'eras') return <path d={COLUMN} pathLength="1" />
  return (
    <g className={ghost ? undefined : styles.swing}>
      <path className={ghost ? undefined : styles.square} d={SQUARE} pathLength="1" fillRule="evenodd" />
      {!ghost && <path className={styles.ticks} d="M3.5 7h2M3.5 11h2M3.5 15h2M7 20.5v-2M11 20.5v-2M15 20.5v-2" />}
    </g>
  )
}

/**
 * The strip above a picker: empty, a dashed ghost of the kind of thing being picked is drawn and rubbed out
 * again, over and over; each pick adds one solid drawing (a rocking set square, a column, a pin drawn
 * stroke by stroke), up to ten and then "+n".
 */
export function PickSketch({ kind, count }) {
  return (
    <div className={styles.strip} aria-hidden="true">
      {count === 0 && (
        <svg className={`${styles.glyph} ${styles.ghost}`} viewBox="0 0 24 24">
          <Glyph kind={kind} ghost />
        </svg>
      )}
      <AnimatePresence initial={false}>
        {Array.from({ length: Math.min(count, SHOWN) }, (_, i) => (
          <motion.svg
            key={i}
            className={`${styles.glyph} ${styles[kind]}`}
            viewBox="0 0 24 24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Glyph kind={kind} />
          </motion.svg>
        ))}
      </AnimatePresence>
      {count > SHOWN && <span className={styles.more}>+{count - SHOWN}</span>}
    </div>
  )
}
