import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { guessText } from '../../game/guessText.js'
import { duration, easeOut } from '../../motion.js'
import { useStrings } from '../../i18n.js'
import styles from './GuessLog.module.css'

/** The wrong guesses of this round, newest first, so nobody retypes the same one. */
export function GuessLog({ log, eras }) {
  const strings = useStrings()
  const shown = (entry) => guessText(entry.field, entry.text, { eras, strings })

  return (
    <section className={styles.log} aria-label={strings.guess.log.heading}>
      <div className={styles.header}>
        <h3 className={styles.heading}>{strings.guess.log.heading}</h3>
        <span className={styles.count}>{log.length}</span>
      </div>
      {log.length === 0 ? (
        <p className={styles.empty}>{strings.guess.log.empty}</p>
      ) : (
        <ul className={styles.list}>
          <AnimatePresence initial={false}>
            {[...log].reverse().map((entry) => (
              <motion.li
                key={`${entry.field}-${entry.text}`}
                className={styles.row}
                layout="position"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: easeOut } }}
              >
                <X className={styles.mark} aria-hidden="true" strokeWidth={2.25} />
                <s className={styles.text}>{shown(entry)}</s>
                <span className={styles.field}>{strings.guess.fields[entry.field]}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}
