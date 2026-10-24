import { silhouetteFor } from '../reveal/silhouettes.js'
import styles from './Library.module.css'

/** The era's front elevation as a small solid shape (the reveal's silhouette). */
export function Mass({ era, className = styles.mass }) {
  return (
    <svg className={className} viewBox="0 0 400 244" aria-hidden="true">
      <path d={silhouetteFor(era).mass} />
    </svg>
  )
}

/** One mark per thing earned: revealed, and mastered when the player named the building. */
export function Marks({ row, t }) {
  const label = row.mastered ? t.mastered : t.revealed
  return (
    <span className={styles.marks} role="img" aria-label={label} title={label}>
      <i>✓</i>
      {row.mastered && <i data-mastered>★</i>}
    </span>
  )
}
