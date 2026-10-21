import { useEffect } from 'react'
import { done } from '../../game/sound.js'
import { RotateIcon, SlidersIcon } from '../ui/icons.jsx'
import { fetchCatalogue } from '../../api/buildings.js'
import { filterPool, readSession, startSession } from '../../game/custom.js'
import { useStrings } from '../../i18n.js'
import { Button } from '../ui/Button.jsx'
import styles from './Recap.module.css'

/** The end of a custom session: what was played, with a way to read more, and what to do next. */
export function Recap({ onAgain }) {
  const { custom } = useStrings()
  useEffect(done, [])
  const session = readSession()
  const played = session?.played ?? []

  const again = async () => {
    const pool = filterPool(await fetchCatalogue(), session.config)
    startSession(pool, session.config)
    onAgain()
  }

  return (
    <section className={styles.recap}>
      <h1 className={styles.heading}>{custom.recap.heading}</h1>
      <p className={styles.lead}>{custom.recap.lead(played.length)}</p>

      <ol className={styles.list}>
        {played.map((b) => (
          <li key={b.id}>
            <a href={b.wikipedia} target="_blank" rel="noreferrer">
              {b.name}
            </a>
          </li>
        ))}
      </ol>

      <div className={styles.actions}>
        {session && (
          <Button icon={RotateIcon} onClick={again}>
            {custom.recap.again}
          </Button>
        )}
        <Button variant="ghost" icon={SlidersIcon} onClick={() => (window.location.hash = '#/custom')}>
          {custom.recap.change}
        </Button>
      </div>
    </section>
  )
}
