import { useId, useState } from 'react'
import { X } from 'lucide-react'
import { normalize } from '../../game/text.js'
import styles from './MultiPicker.module.css'

/**
 * Pick any number of rows from a list, with a search box, a count on every row and the picks
 * shown as removable chips.
 *
 * @param rows      [{ key, label, count }]
 * @param selected  the picked keys
 * @param onChange(keys)
 */
export function MultiPicker({ label, placeholder, emptyText, rows, selected, onChange }) {
  const [query, setQuery] = useState('')
  const listId = useId()
  const q = normalize(query)
  const shown = q ? rows.filter((row) => normalize(row.label).includes(q)) : rows
  const toggle = (key) => onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  const byKey = new Map(rows.map((row) => [row.key, row]))

  return (
    <div className={styles.picker}>
      <label className={styles.label} htmlFor={`${listId}-search`}>
        {label}
      </label>

      {selected.length > 0 && (
        <ul className={styles.chips}>
          {selected.map((key) => (
            <li key={key}>
              <button type="button" className={styles.chip} onClick={() => toggle(key)}>
                {byKey.get(key)?.label ?? key}
                <X className={styles.x} aria-label="×" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}

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
              aria-pressed={selected.includes(row.key)}
              onClick={() => toggle(row.key)}
            >
              <span>{row.label}</span>
              <span className={styles.count}>{row.count}</span>
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className={styles.empty}>{emptyText}</li>}
      </ul>
    </div>
  )
}
