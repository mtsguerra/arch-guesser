import { flushSync } from 'react-dom'
import { isReduced } from './motionPref.js'

/**
 * Runs a screen change as a browser view transition (a soft cross-fade of the whole page) where
 * the browser has them; otherwise, or with reduced motion, it just runs. `flushSync` makes React
 * apply the change before the browser captures the new state.
 */
export function withTransition(update) {
  const reduce = isReduced()
  if (reduce || !document.startViewTransition) return update()
  document.startViewTransition(() => flushSync(update))
}
