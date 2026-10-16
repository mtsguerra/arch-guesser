import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { dailyNumber, shareText } from '../../game/daily.js'
import { useCountdown } from '../../game/useCountdown.js'
import { useStrings } from '../../i18n.js'
import { Button } from '../ui/Button.jsx'
import styles from './DailyDone.module.css'

/** Under the reveal of the daily: when the next one comes, and the copyable result. */
export function DailyDone({ fields, hintsUsed }) {
  const { daily } = useStrings()
  const left = useCountdown()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const text = shareText({
      number: dailyNumber(),
      fields,
      hintsUsed,
      title: daily.shareTitle,
      url: window.location.origin,
    })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure context or permissions): nothing to copy to.
    }
  }

  return (
    <section className={styles.panel} aria-label={daily.title(dailyNumber())}>
      <div>
        <h2 className={styles.title}>{daily.title(dailyNumber())}</h2>
        <p className={styles.next}>{daily.nextIn(left)}</p>
      </div>
      <Button variant="ghost" icon={copied ? Check : Copy} onClick={copy}>
        {copied ? daily.copied : daily.share}
      </Button>
    </section>
  )
}
