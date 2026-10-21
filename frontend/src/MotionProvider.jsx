import { MotionConfig } from 'motion/react'
import { useReducedMotion } from './motionPref.js'

/** Motion's own animations follow the toggle too, not just the OS setting. */
export function MotionProvider({ children }) {
  return <MotionConfig reducedMotion={useReducedMotion() ? 'always' : 'never'}>{children}</MotionConfig>
}
