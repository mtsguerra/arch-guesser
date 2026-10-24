import { silhouetteFor } from '../reveal/silhouettes.js'
import styles from './EraDrawing.module.css'

/**
 * The era's front elevation, plotted line by line (the reveal's drawing). It is what a complete era earns:
 * the Library shows it beside the era once every building in it is unlocked.
 */
export function EraDrawing({ era, small = false }) {
  const { strokes } = silhouetteFor(era)
  return (
    <svg className={styles.plot} data-small={small || undefined} viewBox="0 0 400 244" aria-hidden="true">
      {strokes.map((s, i) => (
        <path key={i} d={s.d} pathLength="1" data-tone={s.tone} style={{ '--delay': `${s.delay}s`, '--dur': `${s.duration}s` }} />
      ))}
    </svg>
  )
}
