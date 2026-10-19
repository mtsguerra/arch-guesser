import { motion } from 'motion/react'
import { springSoft } from '../../motion.js'
import { splitFormat } from './splitFormat.js'
import styles from './RollingNumber.module.css'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const CELL = 1.2 // em: the height of one digit

function Digit({ digit, delay }) {
  return (
    <span className={styles.column}>
      <motion.span className={styles.strip} initial={{ y: 0 }} animate={{ y: `${-digit * CELL}em` }} transition={{ ...springSoft, delay }}>
        {DIGITS.map((d) => (
          <span key={d} className={styles.cell}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

/** A number whose digits roll to their new values. Keyed from the right, so a longer number keeps its low digits. */
export function RollingNumber({ value, delay = 0, fade = false }) {
  const digits = String(Math.max(0, Math.round(value))).split('')
  return (
    <span className={styles.number} data-fade={fade || undefined}>
      {digits.map((d, i) => (
        <Digit key={digits.length - i} digit={Number(d)} delay={delay} />
      ))}
    </span>
  )
}

/**
 * A line with a rolling number in it. Screen readers get the plain text (announced when `live`,
 * for a count that changes); the rolling digits are hidden from them.
 */
export function RollingText({ value, format, live = false }) {
  const parts = splitFormat(format)
  const plain = format(value)
  if (!parts) return plain
  return (
    <>
      <span aria-hidden="true">
        {parts[0]}
        <RollingNumber value={value} />
        {parts[1]}
      </span>
      <span className="visually-hidden" role={live ? 'status' : undefined}>
        {plain}
      </span>
    </>
  )
}
