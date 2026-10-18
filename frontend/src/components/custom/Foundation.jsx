import { motion } from 'motion/react'
import { springSoft } from '../../motion.js'
import styles from './Foundation.module.css'

const COURSES = 10
const W = 40
const COURSE_H = 2.6
const GROUND = 34
const X = 8

/**
 * The count of matches as a building going up: one course of masonry per building found (up to the
 * ten needed), then at ten the roof goes on and a topping-out flag is raised.
 *
 * @param count  buildings matched
 * @param needed buildings needed
 */
export function Foundation({ count, needed }) {
  const laid = Math.min(count, needed)
  const done = count >= needed
  const top = GROUND - needed * COURSE_H
  const eave = top
  return (
    <svg className={styles.svg} viewBox="0 0 56 40" aria-hidden="true">
      <path className={styles.ground} d={`M2 ${GROUND}H54`} />
      {Array.from({ length: COURSES }, (_, i) => (
        <motion.rect
          key={i}
          className={styles.course}
          x={X}
          y={GROUND - (i + 1) * COURSE_H}
          height={COURSE_H}
          initial={false}
          animate={{ width: i < laid ? W : 0 }}
          transition={springSoft}
        />
      ))}
      <motion.path
        className={styles.roof}
        initial={false}
        animate={{ opacity: done ? 1 : 0, d: done ? `M${X - 3} ${eave} L${X + W / 2} ${eave - 9} L${X + W + 3} ${eave} Z` : `M${X - 3} ${eave} L${X + W / 2} ${eave} L${X + W + 3} ${eave} Z` }}
        transition={springSoft}
      />
      <motion.line className={styles.mast} x1={X + W / 2} x2={X + W / 2} y1={eave - 9} initial={false} animate={{ opacity: done ? 1 : 0, y2: done ? eave - 17 : eave - 9 }} transition={springSoft} />
      <motion.path
        className={styles.flag}
        initial={false}
        animate={{ opacity: done ? 1 : 0, d: done ? `M${X + W / 2} ${eave - 17} h8 l-2 2 l2 2 h-8 Z` : `M${X + W / 2} ${eave - 9} h0 l0 0 l0 0 h0 Z` }}
        transition={springSoft}
      />
    </svg>
  )
}
