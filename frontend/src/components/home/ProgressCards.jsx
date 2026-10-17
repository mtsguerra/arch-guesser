import { useState } from 'react'
import { dailyNumber, readDaily } from '../../game/daily.js'
import { lastWeek, readProgress, streakLength } from '../../game/progress.js'
import { eraName } from '../../game/useEras.js'
import { useStrings } from '../../i18n.js'
import styles from './ProgressCards.module.css'

function Check() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.5L5 9L10 3" />
    </svg>
  )
}

/**
 * The reasons to come back: the run of Dailies played on this device, and the archive of styles and
 * countries revealed so far. Both read the device's own record (game/progress.js).
 *
 * @param eras            the era list (for names and the total)
 * @param countriesTotal  how many countries the collection has, once the catalogue is loaded
 */
export function ProgressCards({ eras, countriesTotal }) {
  const strings = useStrings()
  const t = strings.home.progress
  const today = dailyNumber()
  const [progress] = useState(readProgress)
  // A Daily finished before the record existed still counts for today.
  const days = readDaily(today) ? [...progress.days, today] : progress.days
  const run = streakLength(days, today)
  const week = lastWeek(days, today)
  const found = new Set(progress.eras)
  const discovered = (eras ?? []).filter((e) => found.has(e.id))

  return (
    <>
      <section className={styles.card} aria-label={t.streak}>
        <div className={styles.head}>
          <span>{t.streak}</span>
          <strong className={styles.big}>{run ? t.days(run) : t.start}</strong>
        </div>
        <ol className={styles.week}>
          {week.map(({ number, state }) => (
            <li key={number} className={styles.day} data-state={state} title={t.day(number, state)} aria-label={t.day(number, state)}>
              <span className={styles.num}>#{number}</span>
              <span className={styles.mark}>{state === 'done' ? <Check /> : state === 'today' ? t.today : ''}</span>
            </li>
          ))}
        </ol>
      </section>

      {eras?.length > 0 && (
        <section className={styles.card} aria-label={t.archive}>
          <div className={styles.head}>
            <span>{t.archive}</span>
            <span className={styles.count}>{t.count(discovered.length, eras.length, progress.countries.length, countriesTotal ?? '…')}</span>
          </div>
          <div className={styles.register} aria-hidden="true">
            {eras.map((e) => (
              <span key={e.id} data-on={found.has(e.id) || undefined} />
            ))}
          </div>
          {discovered.length ? (
            <ul className={styles.stamps}>
              {discovered.map((e, i) => (
                <li key={e.id} style={{ '--i': i }}>
                  {eraName(e, strings)}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>{t.empty}</p>
          )}
        </section>
      )}
    </>
  )
}
