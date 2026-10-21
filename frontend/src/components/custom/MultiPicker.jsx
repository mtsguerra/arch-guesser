import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { XIcon } from '../ui/icons.jsx'
import { springSoft } from '../../motion.js'
import { useStrings } from '../../i18n.js'
import { normalize } from '../../game/text.js'
import { PickSketch } from './PickSketch.jsx'
import styles from './MultiPicker.module.css'

const VISIBLE = 5 // chips shown in the row; the rest are behind the dots, so a long pick list never grows the page

/**
 * Pick any number of rows from a list, with a search box, a count on every row and the picks
 * shown as removable chips.
 *
 * @param kind      'architects', 'eras' or 'countries' (which sketch the picks draw)
 * @param rows      [{ key, label, count }]
 * @param selected  the picked keys
 * @param onChange(keys)
 */
export function MultiPicker({ kind, label, placeholder, emptyText, rows, selected, onChange }) {
  const strings = useStrings()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const listId = useId()
  const q = normalize(query)
  const shown = q ? rows.filter((row) => normalize(row.label).includes(q)) : rows
  const toggle = (key) => onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  const byKey = new Map(rows.map((row) => [row.key, row]))
  const extra = selected.length - VISIBLE

  // Escape or a click elsewhere closes the full list of picks.
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

  const chip = (key) => (
    <button type="button" className={styles.chip} data-sound="choose" onClick={() => toggle(key)}>
      {byKey.get(key)?.label ?? key}
      <XIcon className={styles.x} aria-label="×" strokeWidth={2} />
    </button>
  )

  return (
    <div className={styles.picker} ref={root}>
      <label className={styles.label} htmlFor={`${listId}-search`}>
        {label}
      </label>

      <PickSketch kind={kind} count={selected.length} />

      <motion.ul className={styles.chips} layout transition={springSoft}>
        <AnimatePresence initial={false} mode="popLayout">
          {selected.slice(0, VISIBLE).map((key) => (
            <motion.li
              key={key}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={springSoft}
            >
              {chip(key)}
            </motion.li>
          ))}
          {extra > 0 && (
            <motion.li key="more" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button type="button" className={styles.dots} aria-expanded={open} aria-label={strings.custom.more(extra)} onClick={() => setOpen((o) => !o)}>
                <span aria-hidden="true">•••</span>
                <span aria-hidden="true" className={styles.dotsCount}>+{extra}</span>
              </button>
            </motion.li>
          )}
        </AnimatePresence>
      </motion.ul>

      {open && extra > 0 && <ul className={styles.all}>{selected.map((key) => <li key={key}>{chip(key)}</li>)}</ul>}

      <input
        id={`${listId}-search`}
        className={styles.search}
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />

      <ul className={styles.list} aria-label={label}>
        {shown.map((row) => (
          <li key={row.key}>
            <button
              type="button"
              className={styles.row}
              data-sound="choose"
              aria-pressed={selected.includes(row.key)}
              onClick={() => toggle(row.key)}
            >
              <span>{row.label}</span>
              <span className={styles.count}>{row.count}</span>
            </button>
          </li>
        ))}
        {shown.length === 0 && emptyText && <li className={styles.empty}>{emptyText}</li>}
      </ul>
    </div>
  )
}
