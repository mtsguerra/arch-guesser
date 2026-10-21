import { useEffect, useRef, useState } from 'react'
import { CircleHelp } from 'lucide-react'
import styles from './InfoTip.module.css'

/** A small "?" button: the note opens on hover or focus, and on tap (it toggles, Escape or a tap elsewhere closes it). */
export function InfoTip({ label, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close) }
  }, [open])
  return (
    <span className={styles.tip} ref={ref} data-open={open || undefined}>
      <button type="button" className={styles.button} aria-label={label} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <CircleHelp aria-hidden="true" strokeWidth={1.75} />
      </button>
      <span className={styles.pop} role="note">{children}</span>
    </span>
  )
}
