import { AnimatePresence, motion } from 'motion/react'
import { duration, easeOut } from '../../motion.js'
import styles from './TitleBlock.module.css'

/** Value that "plots" in left to right when it changes, like a pen filling the box. */
function PlottedValue({ children, muted = false }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={String(children)}
        className={`${styles.value} ${muted ? styles.muted : ''}`}
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        exit={{ opacity: 0, transition: { duration: duration.fast } }}
        transition={{ duration: duration.slow * 1.4, ease: easeOut }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  )
}

/**
 * @param fields  [{ key, label, value, muted?, wide? }]
 */
export function TitleBlock({ fields }) {
  return (
    <figcaption className={styles.titleBlock}>
      <dl className={styles.grid}>
        {fields.map(({ key, label, value, muted, wide }) => (
          <div key={key} className={`${styles.field} ${wide ? styles.wide : ''}`}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.dd}>
              <PlottedValue muted={muted}>{value}</PlottedValue>
            </dd>
          </div>
        ))}
      </dl>
    </figcaption>
  )
}
