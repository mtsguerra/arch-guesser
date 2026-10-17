import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons.jsx'
import { duration, easeOut, springSoft } from '../../motion.js'
import { useStrings } from '../../i18n.js'
import { ArchImage } from '../ui/ArchImage.jsx'
import { Credit } from '../ui/Credit.jsx'
import { TitleBlock } from './TitleBlock.jsx'
import { VeiledGlobe } from './VeiledGlobe.jsx'
import { ZoomableDrawing } from './ZoomableDrawing.jsx'
import { buildSheets } from './sheets.js'
import styles from './DrawingBoard.module.css'

const SLOP = 8 // px of travel before a touch becomes a drag
const FLICK_MS = 90 // how far back release velocity is measured
const SNAP_SPRING = { type: 'spring', stiffness: 320, damping: 34 } // critically damped: no bounce back

// Where a flick at `velocity` (px/s) would come to rest, with scroll-like deceleration.
const project = (velocity, rate = 0.998) => ((velocity / 1000) * rate) / (1 - rate)

// A change of image is a wipe: the new one is drawn in from the side you're heading to, settling
// from slightly large and soft, while the old one steps back and blurs away beneath it.
const wipe = (dir) => (dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)')
const wipeEase = [0.7, 0, 0.2, 1]
const slideMotion = {
  enter: (dir) => ({ clipPath: wipe(dir), scale: 1.08, filter: 'blur(8px)' }),
  center: {
    clipPath: 'inset(0 0 0 0)',
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      clipPath: { duration: 0.85, ease: wipeEase },
      scale: { duration: 1.1, ease: easeOut },
      filter: { duration: 0.9, ease: easeOut },
    },
  },
  exit: (dir) => ({
    x: `${dir * -7}%`,
    scale: 0.93,
    opacity: 0,
    filter: 'blur(6px)',
    transition: { duration: 0.85, ease: wipeEase },
  }),
}

const noteMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
}

/**
 * The building's whole image set as a carousel: cuts first, then photographs, all
 * available from the start. A large frameless stage, a strip of thumbnails to jump
 * between images, and a side column that describes the current one. An image that fails
 * to load (a hotlinked file deleted upstream) removes itself instead of showing a
 * placeholder. Remount per building (`key={building.id}`) so the selection resets.
 */
export function DrawingBoard({ building, revealed, fields }) {
  const strings = useStrings()
  const idPrefix = useId()
  const [[requested, direction], setPage] = useState([0, 1])
  const [failed, setFailed] = useState(() => new Set())
  const [zoomed, setZoomed] = useState(false)
  const [moves, setMoves] = useState(0)
  const drag = useRef(null)
  const dragX = useMotionValue(0)
  const reduceMotion = useReducedMotion()
  const thumbRefs = useRef([])
  const allSheets = useMemo(() => buildSheets(building, strings), [building, strings])
  const sheets = allSheets.filter((s) => !failed.has(s.key))
  const index = Math.min(requested, Math.max(sheets.length - 1, 0))
  const sheet = sheets[index]
  const many = sheets.length > 1

  function select(next) {
    if (next === index) return
    setPage([next, next > index ? 1 : -1])
    setMoves((n) => n + 1)
  }

  const step = (delta) => select((index + delta + sheets.length) % sheets.length)

  function drop(key) {
    setFailed((prev) => new Set(prev).add(key))
  }

  // Probe every image up front, so a broken file loses its slot before anyone clicks it
  // (only the visible slide renders its full image). Successful probes also warm the cache.
  useEffect(() => {
    const probes = allSheets.map((s) => {
      const img = new Image()
      img.onerror = () => setFailed((prev) => new Set(prev).add(s.key))
      img.src = s.image.src
      return img
    })
    return () => probes.forEach((img) => (img.onerror = null))
  }, [allSheets])

  // The thumbnail strip follows the selection.
  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [index])

  function handleThumbKeyDown(event) {
    const last = sheets.length - 1
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key]
    if (next === undefined) return
    event.preventDefault()
    select(next)
    thumbRefs.current[next]?.focus()
  }

  // A finger drags the picture 1:1; on release a flick is projected and, if it would carry the
  // picture past a quarter of the stage, goes to the next or previous sheet. Otherwise it springs home.
  function handlePointerDown(event) {
    if (event.pointerType === 'mouse' || !many || zoomed) return
    dragX.stop()
    drag.current = { id: event.pointerId, x: event.clientX, base: dragX.get(), moved: false, history: [] }
  }

  function handlePointerMove(event) {
    const g = drag.current
    if (!g || g.id !== event.pointerId) return
    const dx = event.clientX - g.x
    if (!g.moved) {
      if (Math.abs(dx) < SLOP) return
      g.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    const now = performance.now()
    g.history.push({ t: now, x: event.clientX })
    while (g.history.length > 2 && now - g.history[0].t > FLICK_MS) g.history.shift()
    if (!reduceMotion) dragX.set(g.base + dx)
  }

  function handlePointerEnd(event, cancelled) {
    const g = drag.current
    if (!g || g.id !== event.pointerId) return
    drag.current = null
    if (!g.moved) return
    const [first, last] = [g.history[0], g.history.at(-1)]
    const velocity = last.t > first.t ? ((last.x - first.x) / (last.t - first.t)) * 1000 : 0
    const travel = event.clientX - g.x
    const reach = travel + project(velocity)
    const commit = !cancelled && Math.abs(reach) > event.currentTarget.clientWidth * 0.25
    if (commit) step(reach < 0 ? 1 : -1)
    animate(dragX, 0, { ...SNAP_SPRING, velocity })
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
    },
    {
      key: 'architect',
      label: strings.titleBlock.architect,
      value: knowArchitect ? building.architects.map((a) => a.name).join(' & ') : strings.titleBlock.unknown,
      muted: !knowArchitect,
    },
  ]

  return (
    <div className={styles.root}>
      <section className={styles.board} aria-label={strings.board.label} aria-roledescription={strings.board.carousel}>
        <div className={styles.main}>
          <div
            className={styles.stage}
            data-kind={sheet?.kind}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => handlePointerEnd(e, false)}
            onPointerCancel={(e) => handlePointerEnd(e, true)}
          >
            {sheets.length === 0 && (
              <p className={styles.unavailable} role="alert">
                {strings.board.imagesUnavailable}
              </p>
            )}
            <AnimatePresence initial={false} custom={direction}>
              {sheet && (
                <motion.div
                  key={sheet.key}
                  className={styles.slide}
                  custom={direction}
                  variants={slideMotion}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  role="tabpanel"
                  id={`${idPrefix}-panel`}
                  aria-labelledby={`${idPrefix}-tab-${index}`}
                >
                  <motion.div className={styles.drag} style={{ x: dragX }}>
                    <ZoomableDrawing sheet={sheet} onError={() => drop(sheet.key)} onZoomChange={setZoomed} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {moves > 0 && (
              <motion.span
                key={`edge-${sheet?.key}`}
                className={styles.edge}
                aria-hidden="true"
                initial={{ left: direction > 0 ? '100%' : '0%', opacity: 1 }}
                animate={{ left: direction > 0 ? '0%' : '100%', opacity: [1, 1, 0] }}
                transition={{ duration: 0.85, ease: wipeEase, opacity: { duration: 0.85, times: [0, 0.8, 1] } }}
              />
            )}

            {many && (
              <>
                <span className={styles.counter} aria-hidden="true">
                  {index + 1} / {sheets.length}
                </span>
                <button
                  type="button"
                  className={`${styles.arrow} ${styles.prev}`}
                  onClick={() => step(-1)}
                  aria-label={strings.board.previous}
                >
                  <ChevronLeftIcon aria-hidden="true" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className={`${styles.arrow} ${styles.next}`}
                  onClick={() => step(1)}
                  aria-label={strings.board.next}
                >
                  <ChevronRightIcon aria-hidden="true" strokeWidth={2} />
                </button>
              </>
            )}
          </div>

          {many && (
            <div
              className={styles.thumbs}
              role="tablist"
              aria-label={strings.board.tabsLabel}
              onKeyDown={handleThumbKeyDown}
            >
              {sheets.map((s, i) => {
                const selected = i === index
                return (
                  <button
                    key={s.key}
                    ref={(el) => (thumbRefs.current[i] = el)}
                    type="button"
                    role="tab"
                    id={`${idPrefix}-tab-${i}`}
                    aria-selected={selected}
                    aria-controls={`${idPrefix}-panel`}
                    aria-label={`${s.number} ${s.label}`}
                    tabIndex={selected ? 0 : -1}
                    className={`${styles.thumb} ${selected ? styles.thumbOn : ''}`}
                    data-kind={s.kind}
                    onClick={() => select(i)}
                  >
                    {selected && (
                      <motion.span layoutId={`${idPrefix}-ring`} className={styles.ring} transition={springSoft} />
                    )}
                    <ArchImage
                      src={s.image.src}
                      alt=""
                      fit={s.kind === 'photo' ? 'photo' : 'contain'}
                      crop={s.image.crop}
                      className={styles.thumbImage}
                    />
                    <span className={styles.thumbNumber}>{s.number}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <aside className={styles.info} aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {sheet && (
              <motion.div key={sheet.key} className={styles.note} {...noteMotion}>
                <p className={styles.eyebrow}>
                  {sheet.number} · {strings.titleBlock.sheetOf(index + 1, sheets.length)}
                </p>
                <h3 className={styles.sheetTitle}>{sheet.title}</h3>
                <p className={styles.describeLabel}>{strings.board.describes}</p>
                <p className={styles.description}>{sheet.image.alt}</p>
                {sheet.image.caption && <p className={styles.caption}>{sheet.image.caption}</p>}
                {revealed && sheet.image.credit && (
                  <p className={styles.credit}>
                    <Credit text={sheet.image.credit} source={sheet.image.source} />
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <TitleBlock fields={titleFields} />
          <div className={styles.globeSlot}>
            <VeiledGlobe code={building.location.countryCode} found={revealed || fields?.country === 'correct'} />
          </div>
        </aside>
      </section>
    </div>
  )
}
