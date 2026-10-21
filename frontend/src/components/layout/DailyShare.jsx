import { useEffect, useId, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useStrings } from '../../i18n.js'
import { springSoft } from '../../motion.js'
import { Button } from '../ui/Button.jsx'
import { CheckIcon, CopyIcon, ExternalIcon } from '../ui/icons.jsx'
import { ShareIcon } from '../ui/InstrumentIcons.jsx'
import styles from './DailyShare.module.css'
import { useReducedMotion } from '../../motionPref.js'

/** Copy, share sheet and their state, for one result text. */
function useShareActions(text) {
  const [copied, setCopied] = useState(false)
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure context or permissions): the other ways still work.
    }
  }
  const share = () => navigator.share({ text }).catch(() => {}) // closing the sheet rejects: not an error
  return { canShare, copied, copy, share }
}

const whatsappUrl = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`

/** Share (where the device has a share sheet), copy and WhatsApp for one result text. */
export function ShareButtons({ text }) {
  const strings = useStrings()
  const { canShare, copied, copy, share } = useShareActions(text)

  return (
    <div className={styles.buttons}>
      {canShare && (
        <Button icon={ShareIcon} onClick={share}>
          {strings.daily.shareVia}
        </Button>
      )}
      <Button variant={canShare ? 'ghost' : 'primary'} icon={copied ? CheckIcon : CopyIcon} onClick={copy}>
        {copied ? strings.daily.copied : strings.daily.copy}
      </Button>
      <a className={styles.whatsapp} href={whatsappUrl(text)} target="_blank" rel="noreferrer">
        <ExternalIcon aria-hidden="true" strokeWidth={1.75} />
        WhatsApp
      </a>
    </div>
  )
}

/**
 * One wide Share button for the result card. It opens a short list: copy, WhatsApp and other ways
 * (the device's share sheet, or e-mail where there is none).
 */
export function ShareMenu({ text }) {
  const strings = useStrings()
  const { canShare, copied, copy, share } = useShareActions(text)
  const [open, setOpen] = useState(false)
  const listId = useId()

  return (
    <div className={styles.menu}>
      <Button icon={ShareIcon} className={styles.wide} aria-expanded={open} aria-controls={listId} onClick={() => setOpen((o) => !o)}>
        {strings.daily.share}
      </Button>
      {open && (
        <ul id={listId} className={styles.options}>
          <li>
            <button type="button" className={styles.option} onClick={copy}>
              {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
              {copied ? strings.daily.copied : strings.daily.copy}
            </button>
          </li>
          <li>
            <a className={styles.option} href={whatsappUrl(text)} target="_blank" rel="noreferrer">
              <ExternalIcon aria-hidden="true" strokeWidth={1.75} />
              WhatsApp
            </a>
          </li>
          <li>
            {canShare ? (
              <button type="button" className={styles.option} onClick={share}>
                <ShareIcon aria-hidden="true" />
                {strings.daily.shareMore}
              </button>
            ) : (
              <a className={styles.option} href={`mailto:?subject=${encodeURIComponent(strings.daily.shareTitle)}&body=${encodeURIComponent(text)}`}>
                <ExternalIcon aria-hidden="true" strokeWidth={1.75} />
                {strings.daily.email}
              </a>
            )}
          </li>
        </ul>
      )}
    </div>
  )
}

/**
 * The Daily's share button: opens a card above the bar with the result as it will be posted
 * (never naming the building) and ways to send it: the device's share sheet where there is one,
 * copy, and WhatsApp.
 *
 * @param text  the result, from `shareText`: title line, result row, link
 */
export function DailyShare({ text }) {
  const strings = useStrings()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const [title, row, link] = text.split('\n')

  // Escape or a click outside closes the card.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <div className={styles.root} ref={root}>
      <Button variant="ghost" icon={ShareIcon} compact aria-expanded={open} aria-label={strings.daily.share} onClick={() => setOpen((o) => !o)}>
        {strings.daily.share}
      </Button>
      {open && (
        <motion.div
          className={styles.card}
          role="group"
          aria-label={strings.daily.preview}
          initial={reduce ? false : { opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={springSoft}
        >
          {[
            [styles.eyebrow, strings.daily.preview],
            [styles.title, title],
            [styles.row, row],
            [styles.link, link],
          ].map(([className, text], i) => (
            <motion.p key={className} className={className} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springSoft, delay: 0.08 + i * 0.06 }}>
              {text}
            </motion.p>
          ))}
          <ShareButtons text={text} />
        </motion.div>
      )}
    </div>
  )
}
