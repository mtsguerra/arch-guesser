import { useRef } from 'react'
import { motion } from 'motion/react'
import { springSoft } from '../../motion.js'
import { strings } from '../../strings.js'
import styles from './SheetTabs.module.css'

/** Index tabs for the drawing set. Roving tabindex with arrow / Home / End keys. */
export function SheetTabs({ sheets, activeIndex, onSelect, idPrefix }) {
  const tabRefs = useRef([])

  function handleKeyDown(event) {
    const last = sheets.length - 1
    const next = {
      ArrowRight: activeIndex === last ? 0 : activeIndex + 1,
      ArrowLeft: activeIndex === 0 ? last : activeIndex - 1,
      Home: 0,
      End: last,
    }[event.key]
    if (next === undefined) return
    event.preventDefault()
    onSelect(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className={styles.tabs} role="tablist" aria-label={strings.board.tabsLabel} onKeyDown={handleKeyDown}>
      {sheets.map((sheet, i) => {
        const selected = i === activeIndex
        return (
          <button
            key={sheet.number}
            ref={(el) => (tabRefs.current[i] = el)}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${i}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            className={`${styles.tab} ${selected ? styles.selected : ''}`}
            onClick={() => onSelect(i)}
          >
            {selected && <motion.span layoutId={`${idPrefix}-tab-paper`} className={styles.paper} transition={springSoft} />}
            <span className={styles.number}>{sheet.number}</span>
            <span className={styles.label}>{sheet.label}</span>
          </button>
        )
      })}
    </div>
  )
}
