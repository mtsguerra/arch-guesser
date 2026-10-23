import { motion } from 'motion/react'
import { EXTRAS, LEVELS, sanitizeExtras } from '../../game/themed.js'
import { springSoft } from '../../motion.js'
import { useReducedMotion } from '../../motionPref.js'
import styles from './DifficultyAccordion.module.css'

const GROW = 2.2 // the open panel is this many times as tall (or wide) as a closed one
const FIXED = { 1: ['name', 'era'], 2: ['name', 'era', 'century'], 3: ['name'] } // asked in every case of that difficulty

/**
 * The difficulties as an accordion: the chosen one opens and shows what it asks, the others fold to a strip and dim.
 * Custom opens onto toggles for the extra fields. Choosing is by click, tap or arrow keys (a radio group).
 *
 * @param level     1 casual, 2 challenging, 3 custom
 * @param extras    the extra fields custom asks
 * @param strings   the language bundle
 * @param compact  tighter panels, for a short space
 * @param fill      panels take the height of their content (the open one the rest) instead of sharing a fixed height
 */
export function DifficultyAccordion({ level, onLevel, extras, onExtras, label, strings, className = '', fill = false, compact = false }) {
  const reduce = useReducedMotion()
  const { themed, guess } = strings
  const transition = reduce ? { duration: 0 } : springSoft

  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = LEVELS[(LEVELS.indexOf(level) + step + LEVELS.length) % LEVELS.length]
    onLevel(next)
    e.currentTarget.querySelector(`[data-level="${next}"]`)?.focus()
  }
  const toggle = (f) => {
    const next = extras.includes(f) ? extras.filter((x) => x !== f) : [...extras, f]
    onExtras(sanitizeExtras(f === 'century' && extras.includes(f) ? next.filter((x) => x !== 'decade') : next))
  }

  return (
    <div role="radiogroup" aria-label={label} className={`${styles.accordion} ${fill ? styles.fill : ''} ${compact ? styles.compact : ''} ${className}`} onKeyDown={onKeyDown}>
      {LEVELS.map((l) => {
        const open = level === l
        return (
          <motion.div
            key={l}
            className={styles.panel}
            data-open={open || undefined}
            initial={false}
            animate={{ flexGrow: fill ? (open ? 1 : 0) : open ? GROW : 1, opacity: open ? 1 : 0.6 }}
            transition={transition}
          >
            <button
              type="button"
              role="radio"
              data-level={l}
              aria-checked={open}
              tabIndex={open ? 0 : -1}
              className={styles.head}
              data-sound="choose"
              onClick={() => onLevel(l)}
            >
              <motion.span className={styles.bar} initial={false} animate={{ scaleY: open ? 1 : 0, opacity: open ? 1 : 0 }} transition={transition} aria-hidden="true" />
              <span className={styles.name}>{themed.levels[l - 1].name}</span>
              <span className={styles.text}>{themed.levels[l - 1].text}</span>
            </button>
            {/* What this difficulty asks. Custom's extras are toggles; they only take focus while it is open. */}
            <motion.div
              className={styles.body}
              initial={false}
              animate={{ opacity: open ? 1 : 0, y: open || reduce ? 0 : 6 }}
              transition={{ ...transition, delay: open && !reduce ? 0.08 : 0 }}
              aria-hidden={!open}
              inert={!open || undefined}
            >
              {FIXED[l].map((f) => (
                <span key={f} className={styles.chip} data-locked>
                  {guess.fields[f]}
                </span>
              ))}
              {l === 3 &&
                EXTRAS.map((f, i) => (
                  <motion.button
                    key={f}
                    type="button"
                    className={styles.chip}
                    aria-pressed={extras.includes(f)}
                    data-sound="choose"
                    initial={false}
                    animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.85 }}
                    transition={reduce ? { duration: 0 } : { ...springSoft, delay: open ? 0.12 + i * 0.04 : 0 }}
                    onClick={() => toggle(f)}
                  >
                    {guess.fields[f]}
                  </motion.button>
                ))}
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
