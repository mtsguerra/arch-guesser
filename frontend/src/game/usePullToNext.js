import { useEffect, useRef } from 'react'
import { TICK, haptic } from './haptics.js'

const TRIGGER = 90 // px of finger travel that counts as a pull
const MAX = 72 // px the indicator follows (it resists: the finger moves twice as far)
// Touches that start here belong to something else: lists, inputs, and the gallery's own gestures.
const OWN_GESTURE = '[role="listbox"], [role="tabpanel"], input, textarea, select'

/**
 * Pull the page down at its top to ask for the next building. Touch only. Returns a ref for the
 * indicator element, which this moves through the `--pull` and `--pull-opacity` custom properties
 * (no re-render per frame) and marks `data-ready` once the pull is far enough to trigger.
 */
export function usePullToNext(enabled, onTrigger) {
  const indicator = useRef(null)
  const trigger = useRef(onTrigger)
  useEffect(() => {
    trigger.current = onTrigger
  })

  useEffect(() => {
    if (!enabled) return
    let start = null
    let pull = 0

    const show = (px, ready) => {
      const node = indicator.current
      if (!node) return
      node.style.setProperty('--pull', `${px}px`)
      node.style.setProperty('--pull-opacity', String(Math.min(1, px / 40)))
      if (ready) node.dataset.ready = ''
      else delete node.dataset.ready
    }

    const onStart = (event) => {
      const touch = event.touches[0]
      const blocked = event.touches.length !== 1 || window.scrollY > 0 || event.target.closest?.(OWN_GESTURE)
      start = blocked ? null : { x: touch.clientX, y: touch.clientY }
      pull = 0
    }
    const onMove = (event) => {
      if (!start) return
      const touch = event.touches[0]
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (Math.abs(dx) > Math.abs(dy) || dy <= 0) {
        // Sideways, or heading up: not a pull (a page that has started to scroll stays scrolling).
        if (dy < -8 || Math.abs(dx) > 12) start = null
        pull = 0
        show(0, false)
        return
      }
      pull = dy
      show(Math.min(MAX, dy / 2), dy >= TRIGGER)
    }
    const onEnd = () => {
      const fire = start !== null && pull >= TRIGGER
      start = null
      pull = 0
      show(0, false)
      if (fire) {
        haptic(TICK)
        trigger.current()
      }
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
    // Stops the browser's own pull-to-refresh from reloading the page under the gesture.
    document.documentElement.style.overscrollBehaviorY = 'contain'
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
      document.documentElement.style.overscrollBehaviorY = ''
    }
  }, [enabled])

  return indicator
}
