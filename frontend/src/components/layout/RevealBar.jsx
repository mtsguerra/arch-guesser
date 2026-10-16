import { useEffect, useRef, useState } from 'react'
import { dailyNumber, shareText } from '../../game/daily.js'
import { useCountdown } from '../../game/useCountdown.js'
import { useStrings } from '../../i18n.js'
import { Button } from '../ui/Button.jsx'
import { ArrowRightIcon, BookIcon, CheckIcon, CopyIcon, ExternalIcon, MapIcon } from '../ui/icons.jsx'
import styles from './RevealBar.module.css'

/**
 * What to do once the answer is shown, fixed at the bottom while the summary is read: switch between the
 * drawings and the summary, read more on Wikipedia, and go on. For the daily it also says when the next
 * one comes and holds the copyable result.
 *
 * @param view      'summary' or 'board'
 * @param daily     null, or { fields, hintsUsed } for the daily's result
 */
export function RevealBar({ view, onToggleView, wikipedia, onNext, nextLabel, daily }) {
  const strings = useStrings()
  const left = useCountdown()
  const next = useRef(null)
  const [copied, setCopied] = useState(false)

  // Whoever finished the round is one key press from the way forward.
  useEffect(() => {
    next.current?.focus({ preventScroll: true })
  }, [])

  const text = daily
    ? shareText({ number: dailyNumber(), fields: daily.fields, hintsUsed: daily.hintsUsed, title: strings.daily.shareTitle, url: window.location.origin })
    : ''
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure context or permissions): nothing to copy to.
    }
  }

  const toSummary = view === 'board'
  return (
    <div className={styles.bar} role="region" aria-label={strings.reveal.menu}>
      <div className={styles.lead}>
        {daily ? (
          <>
            <span>{strings.daily.nextIn(left)}</span>
            <span className={styles.result} aria-label={strings.daily.preview}>
              {text.split('\n')[1]}
            </span>
          </>
        ) : (
          strings.reveal.readOn
        )}
      </div>

      <div className={styles.actions}>
        <Button
          variant="ghost"
          icon={toSummary ? BookIcon : MapIcon}
          compact
          aria-label={toSummary ? strings.summary.showSummary : strings.summary.showDrawings}
          onClick={onToggleView}
        >
          {toSummary ? strings.summary.showSummary : strings.summary.showDrawings}
        </Button>
        {wikipedia && (
          <a className={styles.link} href={wikipedia} target="_blank" rel="noreferrer" aria-label={strings.summary.more.link}>
            <ExternalIcon className={styles.linkIcon} aria-hidden="true" strokeWidth={1.75} />
            <span>{strings.summary.more.link}</span>
          </a>
        )}
        {daily && (
          <Button variant="ghost" icon={copied ? CheckIcon : CopyIcon} compact aria-label={strings.daily.share} onClick={copy}>
            {copied ? strings.daily.copied : strings.daily.share}
          </Button>
        )}
        <Button ref={next} icon={ArrowRightIcon} onClick={onNext} className={styles.next}>
          {nextLabel ?? strings.guess.next}
        </Button>
      </div>
    </div>
  )
}
