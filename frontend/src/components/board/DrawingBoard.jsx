import { useId, useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { duration, easeOut } from '../../motion.js'
import { strings } from '../../strings.js'
import { Sheet } from './Sheet.jsx'
import { SheetTabs } from './SheetTabs.jsx'
import { TitleBlock } from './TitleBlock.jsx'
import { ZoomableDrawing } from './ZoomableDrawing.jsx'
import { sheetNumbers } from './sheetNumbers.js'
import styles from './DrawingBoard.module.css'

// Sheets slide like pages pulled from a set: in from the side you're heading to.
const sheetMotion = {
  enter: (dir) => ({ x: `${dir * 6}%`, rotate: dir * 0.5, opacity: 0 }),
  center: { x: 0, rotate: 0, opacity: 1, transition: { duration: duration.slow, ease: easeOut } },
  exit: (dir) => ({ x: `${dir * -4}%`, scale: 0.985, opacity: 0, transition: { duration: duration.base, ease: easeOut } }),
}

/**
 * The drawing set for one building. Remount per building (`key={building.id}`)
 * so the selected sheet resets.
 */
export function DrawingBoard({ building, revealed, fields }) {
  const idPrefix = useId()
  const [[index, direction], setPage] = useState([0, 1])
  const numbers = useMemo(() => sheetNumbers(building.drawings), [building.drawings])

  const sheets = building.drawings.map((d, i) => ({ number: numbers[i], label: d.label }))
  const drawing = building.drawings[index]

  function select(next) {
    if (next !== index) setPage([next, next > index ? 1 : -1])
  }

  // Title block cells fill in as soon as their guess field locks, not only at the reveal.
  const knowName = revealed || fields?.name === 'correct'
  const knowArchitect = revealed || fields?.architect === 'correct'

  const titleFields = [
    {
      key: 'project',
      label: strings.titleBlock.project,
      value: knowName ? building.name : strings.titleBlock.unidentified,
      muted: !knowName,
      wide: true,
    },
    {
      key: 'architect',
      label: strings.titleBlock.architect,
      value: knowArchitect ? building.architects.map((a) => a.name).join(' & ') : strings.titleBlock.unknown,
      muted: !knowArchitect,
    },
    { key: 'drawing', label: strings.titleBlock.drawing, value: drawing.label },
    {
      key: 'sheet',
      label: strings.titleBlock.sheet,
      value: `${numbers[index]} · ${strings.titleBlock.sheetOf(index + 1, sheets.length)}`,
    },
  ]

  return (
    <section className={styles.board} aria-label={strings.board.label}>
      <LayoutGroup id={idPrefix}>
        <SheetTabs sheets={sheets} activeIndex={index} onSelect={select} idPrefix={idPrefix} />
      </LayoutGroup>

      <div className={styles.stage}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            className={styles.page}
            custom={direction}
            variants={sheetMotion}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <Sheet
              as="figure"
              role="tabpanel"
              id={`${idPrefix}-panel`}
              aria-labelledby={`${idPrefix}-tab-${index}`}
              titleBlock={<TitleBlock fields={titleFields} />}
            >
              <ZoomableDrawing drawing={drawing} revealed={revealed} />
            </Sheet>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
