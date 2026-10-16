// A short vibration for the few moments that earn one (a field locking, the reveal). Silent where
// the Vibration API doesn't exist (iOS Safari, most desktops) and for people who asked for less motion.
export function haptic(pattern) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  navigator.vibrate(pattern)
}

export const TICK = 12
export const REVEAL = [18, 40, 18]
