import { useEffect, useMemo, useState } from 'react'
import { DRAWINGS, length, order, skipsPencil } from './pencil.js'
import styles from './PencilDrawing.module.css'

const HOLD_MS = 3000 // a finished drawing stays this long
const FADE_MS = 700
const FIRST_LEAD_S = 2.2 // the first drawing starts while the title is still being written

/**
 * The home page's picture: era drawings (pyramid, Gothic front, pagoda…) drawn stroke by stroke with
 * the pencil, held for a moment, faded and replaced by the next, in random order. On phones and
 * with reduced motion one drawing is shown, finished, and stays.
 */
export function PencilDrawing() {
  const [instant] = useState(skipsPencil)
  // `at` walks through a shuffled `list` of drawings; `shown` counts the drawings so far.
  const [queue, setQueue] = useState(() => ({ list: order(-1), at: 0, shown: 0 }))
  const [leaving, setLeaving] = useState(false)

  const index = queue.list[queue.at]
  const strokes = DRAWINGS[index]
  const lead = queue.shown === 0 ? FIRST_LEAD_S : 0.2
  const total = useMemo(() => length(strokes), [strokes])

  useEffect(() => {
    if (instant) return
    const stay = (lead + total) * 1000 + HOLD_MS
    const leave = setTimeout(() => setLeaving(true), stay)
    const next = setTimeout(() => {
      const at = queue.at + 1
      setQueue(
        at >= queue.list.length
          ? { list: order(index), at: 0, shown: queue.shown + 1 }
          : { ...queue, at, shown: queue.shown + 1 },
      )
      setLeaving(false)
    }, stay + FADE_MS)
    return () => {
      clearTimeout(leave)
      clearTimeout(next)
    }
  }, [queue, index, instant, lead, total])

  return (
    <svg
      key={`${queue.shown}`}
      className={`${styles.svg} ${leaving ? styles.leaving : ''}`}
      viewBox="0 0 400 244"
      aria-hidden="true"
    >
      {strokes.flatMap((stroke, i) =>
        [false, true].map((ghost) => (
          <path
            key={`${i}-${ghost}`}
            d={stroke.d}
            pathLength="1"
            className={`${styles.stroke} ${ghost ? styles.ghost : ''} ${instant ? styles.done : ''}`}
            style={{ '--delay': `${lead + stroke.delay + (ghost ? 0.12 : 0)}s`, '--dur': `${stroke.duration}s` }}
          />
        )),
      )}
    </svg>
  )
}
