import { useEffect, useRef, useState } from 'react'

const WANT = 256 // the list's own max height (16rem)
const MARGIN = 16
const HEADER = 80 // the sticky header covers the top of the page

/**
 * Where a suggestion list fits. `rect` is the field's box in layout-viewport coordinates and
 * `visual` the visible part of the page (it shrinks when a phone keyboard opens). The list opens
 * downward unless there is little room below and more above; its height is capped to the room.
 */
export function placeList(rect, visual) {
  const below = visual.top + visual.height - rect.bottom - MARGIN
  const above = rect.top - visual.top - HEADER - MARGIN
  const up = below < Math.min(WANT, 160) && above > below
  return { up, max: Math.max(96, Math.min(WANT, Math.floor(up ? above : below))) }
}

/** Keeps a combobox's list on screen, including above a phone keyboard. Attach `ref` to the field's wrapper. */
export function useListPlacement(open) {
  const ref = useRef(null)
  const [placement, setPlacement] = useState({ up: false, max: WANT })

  useEffect(() => {
    if (!open) return
    const vv = window.visualViewport
    const measure = () => {
      if (!ref.current) return
      const visual = { top: vv?.offsetTop ?? 0, height: vv?.height ?? window.innerHeight }
      setPlacement(placeList(ref.current.getBoundingClientRect(), visual))
    }
    measure()
    // The keyboard opens after focus and changes the visible height, so measure again as it moves.
    vv?.addEventListener('resize', measure)
    vv?.addEventListener('scroll', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      vv?.removeEventListener('resize', measure)
      vv?.removeEventListener('scroll', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [open])

  return { ref, placement }
}
