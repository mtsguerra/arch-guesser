import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarDays, ChevronDown, Compass, Play, SlidersHorizontal } from 'lucide-react'
import { duration, easeOut } from '../../motion.js'
import { dailyNumber, readDaily } from '../../game/daily.js'
import { useCountdown } from '../../game/useCountdown.js'
import { useStrings } from '../../i18n.js'
import { AppShell } from '../layout/AppShell.jsx'
import styles from './Home.module.css'

/** Today's daily: a link whose status says whether it is still to play. */
function DailyCard() {
  const { daily } = useStrings()
  const left = useCountdown()
  const number = dailyNumber()
  return (
    <a className={`${styles.card} ${styles.link}`} href="#/daily">
      <CalendarDays className={styles.icon} aria-hidden="true" strokeWidth={1.75} />
      <h2 className={styles.title}>{daily.title(number)}</h2>
      <p className={styles.text}>{readDaily(number) ? daily.done(left) : daily.play}</p>
    </a>
  )
}

export function Home() {
  const strings = useStrings()
  const { home } = strings
  const [open, setOpen] = useState(false)

  return (
    <AppShell>
      <div className={styles.home}>
        <header className={styles.intro}>
          <h1 className={styles.heading}>{home.heading}</h1>
          <p className={styles.lead}>{strings.tagline}</p>
        </header>

        <div className={styles.cards}>
          <DailyCard />

          <section className={styles.card}>
            <button
              type="button"
              className={styles.toggle}
              aria-expanded={open}
              aria-controls="guesser-modes"
              onClick={() => setOpen((o) => !o)}
            >
              <Compass className={styles.icon} aria-hidden="true" strokeWidth={1.75} />
              <h2 className={styles.title}>{home.guesser.title}</h2>
              <p className={styles.text}>{home.guesser.text}</p>
              <ChevronDown className={`${styles.chevron} ${open ? styles.turned : ''}`} aria-hidden="true" />
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id="guesser-modes"
                  className={styles.modes}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: { duration: duration.base, ease: easeOut } }}
                  exit={{ height: 0, opacity: 0, transition: { duration: duration.fast } }}
                >
                  <a className={styles.mode} href="#/play">
                    <Play className={styles.modeIcon} aria-hidden="true" strokeWidth={1.75} />
                    <span>
                      <strong>{home.guesser.normal.title}</strong>
                      <span className={styles.text}>{home.guesser.normal.text}</span>
                    </span>
                  </a>
                  <div className={`${styles.mode} ${styles.soon}`} aria-disabled="true">
                    <SlidersHorizontal className={styles.modeIcon} aria-hidden="true" strokeWidth={1.75} />
                    <span>
                      <strong>{home.guesser.custom.title}</strong>
                      <span className={styles.text}>{home.guesser.custom.text}</span>
                    </span>
                    <span className={styles.tag}>{home.soon}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
