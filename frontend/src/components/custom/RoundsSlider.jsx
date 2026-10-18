import { AnimatePresence, motion } from 'motion/react'
import { MAX_ROUNDS, MIN_ROUNDS } from '../../game/custom.js'
import { VIEW_W, colonnade } from '../../game/colonnade.js'
import { springSoft } from '../../motion.js'
import { useStrings } from '../../i18n.js'
import { RollingText } from '../ui/RollingNumber.jsx'
import styles from './RoundsSlider.module.css'

const H = 64 // the drawing's height
const TOP = 16 // the shafts run from here to the base
const BASE = 54

/**
 * How many rounds: a slider from 3 to 50 with the number beside it, an "All" switch, and under it a colonnade
 * that gains one column per round (a porch at 3, a long stoa at 50).
 *
 * @param value  a number or 'all'
 * @param all    how many buildings "All" means
 */
export function RoundsSlider({ value, all, onChange, last, onLast }) {
  const { custom } = useStrings()
  const isAll = value === 'all'
  const shown = isAll ? Math.min(Math.max(all, MIN_ROUNDS), MAX_ROUNDS) : value
  const { pitch, width, start, span } = colonnade(shown)
  const pct = ((last - MIN_ROUNDS) / (MAX_ROUNDS - MIN_ROUNDS)) * 100

  return (
    <div className={styles.root}>
      <div className={styles.control}>
        <input
          className={styles.range}
          type="range"
          min={MIN_ROUNDS}
          max={MAX_ROUNDS}
          step={1}
          value={last}
          disabled={isAll}
          aria-label={custom.rounds}
          aria-valuetext={custom.roundsCount(last)}
          style={{ '--p': `${pct}%` }}
          onChange={(e) => {
            const n = Number(e.target.value)
            onLast(n)
            onChange(n)
          }}
        />
        <output className={styles.number} aria-hidden="true">
          <RollingText value={isAll ? all : last} format={String} />
        </output>
        <button type="button" className={styles.all} aria-pressed={isAll} onClick={() => onChange(isAll ? last : 'all')}>
          {custom.all(all)}
        </button>
      </div>

      {/* Positions are SVG attributes (attrX), not CSS transforms: browsers disagree on the units of a transform inside a viewBox. */}
      <svg className={styles.colonnade} viewBox={`0 0 ${VIEW_W} ${H}`} aria-hidden="true">
        <motion.rect className={styles.step} initial={false} animate={{ attrX: start - 7, width: span + 14 }} transition={springSoft} y={BASE + 4} height="3" />
        <motion.rect className={styles.step} initial={false} animate={{ attrX: start - 3.5, width: span + 7 }} transition={springSoft} y={BASE + 1} height="3" />
        <motion.rect className={styles.beam} initial={false} animate={{ attrX: start - 3.5, width: span + 7 }} transition={springSoft} y={TOP - 8} height="5" />
        <motion.path className={styles.beam} initial={false} animate={{ d: `M${start - 3.5} ${TOP - 8} L${VIEW_W / 2} ${TOP - 14} L${start + span + 3.5} ${TOP - 8} Z` }} transition={springSoft} />
        <AnimatePresence initial={false}>
          {Array.from({ length: shown }, (_, i) => (
            <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ ...springSoft, delay: Math.min(i, 12) * 0.015 }}>
              <motion.rect className={styles.shaft} initial={false} animate={{ attrX: start + i * pitch + width * 0.12 }} transition={springSoft} y={TOP} width={width * 0.76} height={BASE - TOP} />
              <motion.rect className={styles.cap} initial={false} animate={{ attrX: start + i * pitch }} transition={springSoft} y={TOP - 3} width={width} height="3" />
              <motion.rect className={styles.cap} initial={false} animate={{ attrX: start + i * pitch }} transition={springSoft} y={BASE - 2} width={width} height="2" />
            </motion.g>
          ))}
        </AnimatePresence>
      </svg>
    </div>
  )
}
