import { useEffect, useId, useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { duration, easeOut } from '../../motion.js'
import { strings } from '../../strings.js'
import { Sheet } from './Sheet.jsx'
import { SheetTabs } from './SheetTabs.jsx'
import { TitleBlock } from './TitleBlock.jsx'
import { ZoomableDrawing } from './ZoomableDrawing.jsx'
import { buildSheets } from './sheets.js'
import styles from './DrawingBoard.module.css'

// Sheets slide like pages pulled from a set: in from the side you're heading to.
const sheetMotion = {
  enter: (dir) => ({ x: `${dir * 6}%`, rotate: dir * 0.5, opacity: 0 }),
  center: { x: 0, rotate: 0, opacity: 1, transition: { duration: duration.slow, ease: easeOut } },
  exit: (dir) => ({ x: `${dir * -4}%`, scale: 0.985, opacity: 0, transition: { duration: duration.base, ease: easeOut } }),
}

/**
 * The building's whole image set as sheets: cuts first, then photographs, all
 * available from the start. A sheet whose image fails to load (a hotlinked file
 * deleted upstream) removes its own tab instead of showing a placeholder.
 * Remount per building (`key={building.id}`) so the selected sheet resets.
 */
export function DrawingBoard({ building, revealed, fields }) {
  const idPrefix = useId()
  const [[requested, direction], setPage] = useState([0, 1])
  const [failed, setFailed] = useState(() => new Set())
  const allSheets = useMemo(() => buildSheets(building), [building])
  const sheets = allSheets.filter((s) => !failed.has(s.key))
  const index = Math.min(requested, Math.max(sheets.length - 1, 0))
  const sheet = sheets[index]

  function select(next) {
    if (next !== index) setPage([next, next > index ? 1 : -1])
  }

  function drop(key) {
    setFailed((prev) => new Set(prev).add(key))
  }

  // Probe every image up front, so a broken file loses its tab before anyone clicks it
  // (only the visible sheet renders its <img>). Successful probes also warm the cache.
  useEffect(() => {
    const probes = allSheets.map((s) => {
      const img = new Image()
      img.onerror = () => setFailed((prev) => new Set(prev).add(s.key))
      img.src = s.image.src
      return img
    })
    return () => probes.forEach((img) => (img.onerror = null))
  }, [allSheets])

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
    { key: 'drawing', label: strings.titleBlock.drawing, value: sheet ? sheet.title : strings.titleBlock.unknown },
    {
      key: 'sheet',
      label: strings.titleBlock.sheet,
      value: sheet ? `${sheet.number} · ${strings.titleBlock.sheetOf(index + 1, sheets.length)}` : strings.titleBlock.unknown,
    },
  ]

  return (
    <section className={styles.board} aria-label={strings.board.label}>
      <LayoutGroup id={idPrefix}>
        <SheetTabs sheets={sheets} activeIndex={index} onSelect={select} idPrefix={idPrefix} />
      </LayoutGroup>

      <div className={styles.stage}>
        {sheets.length === 0 && (
          <Sheet className={styles.page} titleBlock={<TitleBlock fields={titleFields} />}>
            <p className={styles.unavailable} role="alert">
              {strings.board.imagesUnavailable}
            </p>
          </Sheet>
        )}
        <AnimatePresence initial={false} custom={direction}>
          {sheet && (
          <motion.div
            key={sheet.key}
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
              <ZoomableDrawing sheet={sheet} revealed={revealed} onError={() => drop(sheet.key)} />
            </Sheet>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
