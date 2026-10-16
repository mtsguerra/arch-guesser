import { useEffect, useState } from 'react'

const HIDE_AFTER = 28 // px scrolled down, from where the page last turned, before the bar leaves
const SHOW_AFTER = 8 // px scrolled up before it comes back (it returns sooner than it leaves)
const TOP = 24 // near the top of the page it is always there

/**
 * One step of the hide-on-scroll rule. `state` is { hidden, anchor, dir, last }: the anchor is the
 * point where the scroll direction last turned, so a long slow scroll and a quick flick both count
 * from where they began, and small jitters change nothing.
 */
export function stepAutoHide(state, y) {
  if (y < TOP) return { hidden: false, anchor: y, dir: 0, last: y }
  const dir = y > state.last ? 1 : y < state.last ? -1 : state.dir
  const anchor = dir !== state.dir ? state.last : state.anchor
  let { hidden } = state
  if (dir === 1 && y - anchor > HIDE_AFTER) hidden = true
  if (dir === -1 && anchor - y > SHOW_AFTER) hidden = false
  return { hidden, anchor, dir, last: y }
}

/** True while a bar should be tucked away: the page is scrolling down. */
export function useAutoHide() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let state = { hidden: false, anchor: window.scrollY, dir: 0, last: window.scrollY }
    const onScroll = () => {
      state = stepAutoHide(state, window.scrollY)
      setHidden(state.hidden)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return hidden
}
