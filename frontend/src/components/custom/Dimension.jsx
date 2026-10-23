import { motion } from 'motion/react'
import { springSoft } from '../../motion.js'
import styles from './Dimension.module.css'

/**
 * The count of matches as a dimension line from 0 to the number needed: the line is drawn and a marker
 * slides along it; at the target the "n / min" label wipes over to the full text.
 *
 * @param count  buildings matched
 * @param needed buildings needed
 * @param text   label once ready, e.g. "42 buildings match"
 */
export function Dimension({ count, needed, text }) {
  const p = Math.min(count, needed) / needed
  const ready = count >= needed
  return (
    <div className={styles.dim}>
      <span className={styles.track} aria-hidden="true">
        <motion.span className={styles.fill} initial={false} animate={{ scaleX: p }} transition={springSoft} />
        <motion.span className={styles.marker} initial={false} animate={{ left: `${p * 100}%` }} transition={springSoft} />
      </span>
      <span className={styles.label} aria-hidden="true">
        <motion.span initial={false} animate={{ clipPath: ready ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0%)' }} transition={{ duration: 0.5 }}>
          {count} / {needed}
        </motion.span>
        <motion.span initial={false} animate={{ clipPath: ready ? 'inset(0 0 0 0%)' : 'inset(0 100% 0 0)' }} transition={{ duration: 0.5 }}>
          {text}
        </motion.span>
      </span>
      <span className="visually-hidden" role="status">
        {ready ? text : `${count} / ${needed}`}
      </span>
    </div>
  )
}
