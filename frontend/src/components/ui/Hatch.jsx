import { useEffect, useRef, useState } from 'react'
import styles from './Hatch.module.css'

const GAP = 7 * Math.SQRT2 // 7px between lines, measured across them

/** Cut-wall hatching (45 degrees, 2px lines every 7px) over its parent, drawn stroke by stroke from left to right. */
export function Hatch() {
  const root = useRef(null)
  const [size, setSize] = useState(null)
  useEffect(() => {
    const el = root.current
    if (!el) return undefined
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const xs = size ? Array.from({ length: Math.ceil((size.w + size.h) / GAP) + 1 }, (_, i) => i * GAP - size.h) : []
  return (
    <svg ref={root} className={styles.hatch} viewBox={size ? `0 0 ${size.w} ${size.h}` : undefined} aria-hidden="true">
      {size && xs.map((x, i) => <path key={i} d={`M${x} ${size.h}L${x + size.h} 0`} style={{ '--i': i, '--len': size.h * Math.SQRT2 }} />)}
    </svg>
  )
}
