import { useEffect, useRef } from 'react'
import { formatYear } from '../../game/useEras.js'
import { compareFacts } from '../../game/libraryView.js'
import { useLanguage, useStrings } from '../../i18n.js'
import { Button } from '../ui/Button.jsx'
import { Mass, Marks } from './Marks.jsx'
import styles from './Detail.module.css'

/**
 * The panel for one row. An unlocked building shows its facts and opens its summary; a locked one shows
 * only what the table shows (era and sheet number) and offers a round on a locked building of that era.
 *
 * @param neighbours  era ids the game calls close to this one
 */
export function Detail({ row, eraLabel, countryLabel, neighbours, inCompare, onCompare, onEra, onPlay, onClose }) {
  const strings = useStrings()
  const t = strings.library
  const root = useRef(null)
  useEffect(() => root.current?.focus(), [row.id])

  return (
    <aside ref={root} tabIndex={-1} className={styles.panel} aria-label={row.open ? row.name : t.notMet} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <button type="button" className={styles.close} onClick={onClose} aria-label={t.close}>
        ×
      </button>
      <span className={styles.eyebrow}>
        {row.no} · {eraLabel(row.era)}
      </span>
      <div className={styles.pic} data-locked={!row.open || undefined}>
        <Mass era={row.era} className={styles.picMass} />
      </div>
      {row.open ? (
        <>
          <h2 className={styles.name}>{row.name}</h2>
          <dl className={styles.facts}>
            <dt>{t.detail.architect}</dt>
            <dd>{row.architects.join(', ')}</dd>
            <dt>{t.detail.country}</dt>
            <dd>{countryLabel(row.countryCode)}</dd>
            <dt>{t.detail.completed}</dt>
            <dd>{row.yearCompleted == null ? '–' : formatYear(row.yearCompleted, strings.years)}</dd>
            <dt>{t.detail.marks}</dt>
            <dd>
              <Marks row={row} t={t} /> {row.mastered ? t.mastered : t.revealed}
            </dd>
            <dt>{t.detail.met}</dt>
            <dd>{t.met(row.at, t.modes[row.mode])}</dd>
          </dl>
        </>
      ) : (
        <>
          <h2 className={styles.name}>{t.notMet}</h2>
          <p className={styles.text}>{t.notMetText}</p>
        </>
      )}
      {neighbours.length > 0 && (
        <div className={styles.near}>
          <span className={styles.eyebrow}>{t.neighbours}</span>
          <div className={styles.chips}>
            {neighbours.map((id) => (
              <button key={id} type="button" onClick={() => onEra(id)}>
                {eraLabel(id)}
              </button>
            ))}
          </div>
          <p className={styles.text}>{t.neighboursNote}</p>
        </div>
      )}
      <div className={styles.actions}>
        {row.open ? (
          <>
            <Button onClick={() => (window.location.hash = `#/library/${row.id}`)}>{t.open}</Button>
            <Button variant="ghost" onClick={onCompare}>
              {inCompare ? t.compare.remove : t.compare.add}
            </Button>
          </>
        ) : (
          <Button onClick={onPlay}>{t.playEra(eraLabel(row.era))}</Button>
        )}
      </div>
    </aside>
  )
}

/** Two unlocked buildings side by side at one scale, and how they relate. A native dialog: focus stays inside, Escape closes. */
export function Compare({ a, b, eraLabel, countryLabel, onClose }) {
  const strings = useStrings()
  const { lang } = useLanguage()
  const t = strings.library
  const dialog = useRef(null)
  useEffect(() => {
    const el = dialog.current
    if (!el.open) el.showModal()
    return () => el.open && el.close()
  }, [])
  const facts = compareFacts(a, b)
  const yes = (v) => (v ? t.compare.yes : t.compare.no)
  const side = (r) => (
    <div className={styles.card}>
      <div className={styles.cardArt}>
        <Mass era={r.era} className={styles.cardMass} />
      </div>
      <div className={styles.cardInfo}>
        <b>{r.name}</b>
        <span>{r.architects.join(', ')}</span>
        <span>
          {countryLabel(r.countryCode)} · {r.yearCompleted == null ? '–' : formatYear(r.yearCompleted, strings.years)}
        </span>
        <span className={styles.chip}>{eraLabel(r.era)}</span>
      </div>
    </div>
  )
  return (
    <dialog ref={dialog} className={styles.dialog} aria-label={t.compare.pick} onClose={onClose}>
      <button type="button" className={styles.close} onClick={onClose} aria-label={t.close}>
        ×
      </button>
      <span className={styles.eyebrow}>
        {t.compare.title} · {t.compare.same}
      </span>
      <div className={styles.cols}>
        {side(a)}
        <div className={styles.mid}>
          {facts.yearsApart != null && (
            <p>
              <b>{facts.yearsApart.toLocaleString(lang)}</b>
              {t.compare.yearsApart}
            </p>
          )}
          {facts.km > 0 && (
            <p>
              <b>{facts.km.toLocaleString(lang)}</b>
              {t.compare.kmApart}
            </p>
          )}
          <p className={styles.same}>
            {t.compare.era}: {yes(facts.sameEra)}
            <br />
            {t.compare.country}: {yes(facts.sameCountry)}
            <br />
            {t.compare.architect}: {yes(facts.sameArchitect)}
          </p>
        </div>
        {side(b)}
      </div>
      <p className={styles.text}>{t.compare.note}</p>
    </dialog>
  )
}
