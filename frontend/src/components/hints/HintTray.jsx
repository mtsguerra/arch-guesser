import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Lightbulb, Lock } from 'lucide-react'
import { duration, easeOut } from '../../motion.js'
import { useStrings } from '../../i18n.js'
import styles from './HintTray.module.css'

// A hint is laid down in its slot like a note: drops in, slightly askew, then settles.
const hintMotion = {
  initial: { opacity: 0, y: -10, rotate: -1.2, scale: 0.97 },
  animate: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { duration: duration.slow, ease: easeOut } },
}

/**
 * Progressive text-only tips, one slot each in a single row so the board never grows.
 * Hints open in order: the next slot is the button, the rest wait locked.
 */
export function HintTray({ hints, hintLevel, canReveal, onReveal }) {
  const strings = useStrings()
  const newest = useRef(null)
  const previousLevel = useRef(hintLevel)

  // A hint the player asked for takes focus (the button may have just vanished);
  // hints opened all at once by the reveal don't steal it.
  useEffect(() => {
    if (hintLevel === previousLevel.current + 1) newest.current?.focus({ preventScroll: true })
    previousLevel.current = hintLevel
  }, [hintLevel])

  return (
    <section className={styles.tray} aria-labelledby="hints-heading">
      <h2 id="hints-heading" className={styles.heading}>
        {strings.hints.heading}
        <span className={styles.count}>
          {hintLevel}/{hints.length}
        </span>
      </h2>

      <ol className={styles.row}>
        {hints.map((hint, i) => {
          const open = i < hintLevel
          const next = i === hintLevel && canReveal
          return (
            <li key={hint.order} className={styles.slot}>
              {open ? (
                <motion.div
                  ref={i === hintLevel - 1 ? newest : undefined}
                  tabIndex={-1}
                  className={`${styles.card} ${styles.open}`}
                  variants={hintMotion}
                  initial="initial"
                  animate="animate"
                >
                  <span className={styles.label}>{strings.hints.label(i + 1)}</span>
                  <p className={styles.fact}>{hint.text}</p>
                </motion.div>
              ) : next ? (
                <button type="button" className={`${styles.card} ${styles.next}`} onClick={onReveal}>
                  <Lightbulb className={styles.icon} aria-hidden="true" strokeWidth={1.75} />
                  <span className={styles.label}>{strings.hints.label(i + 1)}</span>
                  <span className={styles.cta}>{strings.hints.show(i + 1, hints.length)}</span>
                </button>
              ) : (
                <div className={`${styles.card} ${styles.locked}`} aria-disabled="true">
                  <Lock className={styles.icon} aria-hidden="true" strokeWidth={1.75} />
                  <span className={styles.label}>{strings.hints.label(i + 1)}</span>
                  <span className={styles.cta}>{strings.hints.locked}</span>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
