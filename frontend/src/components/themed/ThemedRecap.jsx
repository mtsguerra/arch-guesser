import { RotateIcon, SlidersIcon } from '../ui/icons.jsx'
import { fetchCatalogue } from '../../api/buildings.js'
import { readThemedSession, startThemedSession, themePool } from '../../game/themed.js'
import { useStrings } from '../../i18n.js'
import { Button } from '../ui/Button.jsx'
import styles from './ThemedRecap.module.css'

// Percent of the axis; a dot is about this wide on a phone.
const MIN_GAP = 13

/** Where each dated building sits along a ruled axis (0-100 %), oldest left; neighbours alternate between two lanes. */
function place(played) {
  const dated = played.filter((p) => p.year != null).sort((a, b) => a.year - b.year)
  if (!dated.length) return []
  const min = dated[0].year
  const span = dated[dated.length - 1].year - min || 1
  const xs = dated.map((p) => ((p.year - min) / span) * 100)
  // Keep neighbours in the same lane a dot apart, then squeeze back into the axis.
  for (let i = 2; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 2] + MIN_GAP)
  const last = Math.max(...xs, 100)
  return dated.map((p, i) => ({ ...p, x: (xs[i] / last) * 100, lane: i % 2 }))
}

/** The end of a themed game: the buildings drawn on a timeline by year, and what to do next. */
export function ThemedRecap({ onAgain }) {
  const strings = useStrings()
  const { themed } = strings
  const session = readThemedSession()
  const played = session?.played ?? []
  const solved = played.filter((p) => p.solved).length
  const points = place(played)
  const order = new Map(played.map((p, i) => [p.id, i + 1]))
  const years = points.length ? [points[0].year, points[points.length - 1].year] : null
  const fmt = (y) => (y < 0 ? `${-y} ${strings.years.bce}` : String(y))

  const again = async () => {
    startThemedSession(themePool(await fetchCatalogue(), session.theme), session.theme, session.level)
    onAgain()
  }

  return (
    <section className={styles.recap}>
      <h1 className={styles.heading}>{themed.recap.heading}</h1>
      <p className={styles.lead}>{themed.recap.lead(session ? themed.themes[session.theme] ?? '' : '', solved, played.length)}</p>

      {points.length > 0 && (
        <figure className={styles.timeline}>
          <div className={styles.track} role="img" aria-label={themed.recap.timeline}>
            {points.map((p) => (
              <span key={p.id} className={styles.mark} data-lane={p.lane} data-solved={p.solved || undefined} style={{ '--x': `${p.x}%` }}>
                {order.get(p.id)}
              </span>
            ))}
          </div>
          <figcaption className={styles.ends}>
            <span>{fmt(years[0])}</span>
            <span>{fmt(years[1])}</span>
          </figcaption>
        </figure>
      )}

      <ol className={styles.list}>
        {played.map((p) => (
          <li key={p.id}>
            <a href={p.wikipedia} target="_blank" rel="noreferrer">
              {p.name}
            </a>
            <span className={styles.year}>{p.year != null ? fmt(p.year) : themed.recap.undated}</span>
            <span className={styles.stamp} data-solved={p.solved || undefined}>
              {p.solved ? themed.recap.solved : themed.recap.revealed}
            </span>
          </li>
        ))}
      </ol>

      <div className={styles.actions}>
        {session && (
          <Button icon={RotateIcon} onClick={again}>
            {themed.recap.again}
          </Button>
        )}
        <Button variant="ghost" icon={SlidersIcon} onClick={() => (window.location.hash = '#/themed')}>
          {themed.recap.change}
        </Button>
      </div>
    </section>
  )
}
