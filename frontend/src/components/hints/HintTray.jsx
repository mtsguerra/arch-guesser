import { useEffect, useRef } from 'react'
import { Lock } from 'lucide-react'
import { BulbIcon } from '../ui/icons.jsx'
import { hint as hintSound } from '../../game/sound.js'
import { useStrings } from '../../i18n.js'
import FlipCard from '../ui/FlipCard.jsx'
import styles from './HintTray.module.css'

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
              <FlipCard
                className={styles.flip}
                flipped={open}
                // Only the next slot is live; open and locked ones stay put so hints open in order.
                disabled={!next}
                onFlipChange={next ? (...args) => { hintSound(); onReveal(...args) } : undefined}
                ariaLabel={next ? strings.hints.show(i + 1, hints.length) : strings.hints.label(i + 1)}
                draggable={false}
                tiltMax={6}
                hoverScale={1.02}
                radius={6}
                background="var(--paper)"
                color="var(--ink)"
                shadowColor="#432818"
                shadowOpacity={0.2}
                front={
                  <div className={`${styles.card} ${styles.front} ${next ? styles.next : styles.locked}`}>
                    {next ? (
                      <BulbIcon className={styles.icon} aria-hidden="true" strokeWidth={1.75} />
                    ) : (
                      <Lock className={styles.icon} aria-hidden="true" strokeWidth={1.75} />
                    )}
                    <span className={styles.label}>{strings.hints.label(i + 1)}</span>
                    <span className={styles.cta}>
                      {next ? strings.hints.show(i + 1, hints.length) : strings.hints.locked}
                    </span>
                  </div>
                }
                back={
                  <div
                    ref={i === hintLevel - 1 ? newest : undefined}
                    tabIndex={-1}
                    className={`${styles.card} ${styles.open}`}
                  >
                    <span className={styles.label}>{strings.hints.label(i + 1)}</span>
                    <p className={styles.fact}>{hint.text}</p>
                  </div>
                }
              />
            </li>
          )
        })}
      </ol>
    </section>
  )
}
