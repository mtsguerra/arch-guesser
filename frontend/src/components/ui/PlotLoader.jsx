import { useStrings } from '../../i18n.js'
import styles from './PlotLoader.module.css'

// Strokes of an abstract stepped elevation, left to right, so the pen sweep and the drawing agree.
// `construction` lines are the faint set-out lines; the rest is the drawing proper.
const STROKES = [
  { d: 'M30 156H290', construction: true },
  { d: 'M64 40V164M160 28V164M256 40V164', construction: true },
  { d: 'M52 150V94H112V150', delay: 0 },
  { d: 'M52 94L82 72L112 94', delay: 0.15 },
  { d: 'M130 150V58H190V150', delay: 0.35 },
  { d: 'M142 58V36H178V58', delay: 0.5 },
  { d: 'M148 36L160 24L172 36', delay: 0.6 },
  { d: 'M208 150V104H268V150', delay: 0.8 },
  { d: 'M208 104H268', delay: 0.95 },
  { d: 'M148 150V128a12 12 0 0 1 24 0V150', delay: 1.05, accent: true },
  { d: 'M142 80H178M142 96H178M142 112H178', delay: 1.2 },
  { d: 'M64 112H100M222 124H254', delay: 1.3 },
  { d: 'M40 170H280M40 165V175M280 165V175', delay: 1.45, accent: true },
]

/**
 * Shown on a sheet while its image is on the way: a drawing being plotted. It stays
 * invisible for the first moments, so an image that arrives quickly never flashes it.
 */
export function PlotLoader({ label, tone = 'paper' }) {
  const strings = useStrings()
  const text = label ?? strings.board.plotting
  return (
    <div className={`${styles.loader} ${tone === 'dark' ? styles.dark : ''}`} role="status">
      <span className={styles.shimmer} aria-hidden="true" />
      <svg className={styles.drawing} viewBox="0 0 320 190" aria-hidden="true">
        {STROKES.map(({ d, construction, accent, delay = 0 }) => (
          <path
            key={d}
            d={d}
            pathLength="1"
            className={construction ? styles.construction : accent ? styles.accent : styles.stroke}
            style={{ '--delay': `${delay}s` }}
          />
        ))}
      </svg>
      <span className={styles.pen} aria-hidden="true" />
      <p className={styles.label}>{text}</p>
    </div>
  )
}
