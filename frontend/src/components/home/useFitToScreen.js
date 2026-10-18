import { useEffect } from 'react'

const MIN_FIT = 0.5
const TWO_COLUMNS = 1024 // px: below this the homepage stacks and may scroll

/**
 * Shrinks the root text size (everything is in rem) until the whole page fits the window's height,
 * so the homepage never needs a scroll on a wide screen. Phones and narrow windows keep scrolling.
 */
export function useFitToScreen() {
  useEffect(() => {
    const root = document.documentElement
    const fit = () => {
      root.style.removeProperty('--fit')
      if (window.innerWidth < TWO_COLUMNS) return
      const over = root.scrollHeight - window.innerHeight
      if (over <= 0) return
      const next = Math.max(MIN_FIT, (window.innerHeight / root.scrollHeight) * 0.99)
      root.style.setProperty('--fit', next.toFixed(3))
    }
    fit()
    // Fonts and the catalogue change the height after first paint; fit() is idempotent, so its own change settles.
    const watch = new ResizeObserver(fit)
    watch.observe(document.body)
    window.addEventListener('resize', fit, { passive: true })
    return () => {
      watch.disconnect()
      window.removeEventListener('resize', fit)
      root.style.removeProperty('--fit')
    }
  }, [])
}
