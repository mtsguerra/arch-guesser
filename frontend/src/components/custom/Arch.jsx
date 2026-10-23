import { motion } from 'motion/react'
import { springSoft } from '../../motion.js'
import styles from './Arch.module.css'

const CX = 28
const CY = 34
const R_IN = 11
const R_OUT = 19
const STONES = 11 // ten voussoirs, then the keystone
const KEY = 5
const STEP = 180 / STONES
// The building that places stone k: left and right alternate from the springers inwards.
const ORDER = [0, 10, 1, 9, 2, 8, 3, 7, 4, 6]

const polar = (r, deg) => [CX + r * Math.cos((deg * Math.PI) / 180), CY - r * Math.sin((deg * Math.PI) / 180)]

/** The outline of stone k, shifted by (dx, dy): a path with the same shape at rest and displaced, so `d` can animate. */
function stonePath(k, dx = 0, dy = 0) {
  const a0 = 180 - k * STEP
  const a1 = a0 - STEP
  const pts = [polar(R_IN, a0), polar(R_OUT, a0), polar(R_OUT, a1), polar(R_IN, a1)]
  return `M${pts.map(([x, y]) => `${(x + dx).toFixed(2)} ${(y + dy).toFixed(2)}`).join('L')}Z`
}

const REST = Array.from({ length: STONES }, (_, k) => stonePath(k))
// Where a stone waits before it is placed: out and up from its seat, the keystone straight above.
const AWAY = Array.from({ length: STONES }, (_, k) => stonePath(k, k === KEY ? 0 : k < KEY ? -8 : 8, k === KEY ? -22 : -10))
const RANK = new Map(ORDER.map((k, i) => [k, i + 1]))

/**
 * The count of matches as an arch going up: one voussoir per building found (up to the ten needed),
 * left and right in turn, then at ten the keystone drops in and closes it.
 *
 * @param count  buildings matched
 * @param needed buildings needed (the ten voussoirs)
 */
export function Arch({ count, needed }) {
  const done = count >= needed
  return (
    <svg className={styles.svg} data-done={done || undefined} viewBox="0 -2 56 40" aria-hidden="true">
      <path className={styles.ground} d="M4 34H52" />
      {REST.map((rest, k) => {
        const on = k === KEY ? done : Math.min(count, needed) >= RANK.get(k)
        return (
          <motion.path
            key={k}
            className={k === KEY ? styles.key : styles.stone}
            initial={false}
            animate={{ d: on ? rest : AWAY[k], opacity: on ? 1 : 0 }}
            transition={springSoft}
          />
        )
      })}
    </svg>
  )
}
