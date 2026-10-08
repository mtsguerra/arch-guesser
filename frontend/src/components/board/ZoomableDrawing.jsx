import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import { Minus, Plus } from 'lucide-react'
import { duration, easeOut } from '../../motion.js'
import { strings } from '../../strings.js'
import { ArchImage } from '../ui/ArchImage.jsx'
import styles from './ZoomableDrawing.module.css'

const ZOOM = 2.5
const KEY_STEP = 0.1
const followSpring = { stiffness: 220, damping: 34, mass: 0.6 }

const clamp = (n) => Math.min(1, Math.max(0, n))

/**
 * In-place zoom. Clicking zooms in around that point; while zoomed the view
 * follows the pointer (or finger), so the whole sheet is explorable without
 * drag handles. Arrow keys pan from the zoom button; Esc exits.
 */
export function ZoomableDrawing({ drawing, revealed }) {
  const [zoomed, setZoomed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const viewport = useRef(null)
  const originX = useMotionValue(0.5)
  const originY = useMotionValue(0.5)
  const smoothX = useSpring(originX, followSpring)
  const smoothY = useSpring(originY, followSpring)

  useEffect(() => {
    if (!zoomed) return
    const onKey = (e) => e.key === 'Escape' && setZoomed(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  function pointerOrigin(event) {
    const rect = viewport.current.getBoundingClientRect()
    return [clamp((event.clientX - rect.left) / rect.width), clamp((event.clientY - rect.top) / rect.height)]
  }

  function setOrigin([x, y], { jump = false } = {}) {
    originX.set(x)
    originY.set(y)
    if (jump) {
      smoothX.jump(x)
      smoothY.jump(y)
    }
  }

  function handleClick(event) {
    if (!zoomed) setOrigin(pointerOrigin(event), { jump: true })
    setZoomed(!zoomed)
  }

  function handlePointerMove(event) {
    if (zoomed) setOrigin(pointerOrigin(event))
  }

  function handleButtonKeyDown(event) {
    if (!zoomed) return
    const delta = { ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, -KEY_STEP], ArrowDown: [0, KEY_STEP] }[event.key]
    if (!delta) return
    event.preventDefault()
    event.stopPropagation()
    setOrigin([clamp(originX.get() + delta[0]), clamp(originY.get() + delta[1])])
  }

  function toggleFromButton() {
    if (!zoomed) setOrigin([0.5, 0.5], { jump: true })
    setZoomed(!zoomed)
  }

  return (
    <div className={styles.wrap}>
      <div
        ref={viewport}
        className={`${styles.viewport} ${zoomed ? styles.zoomed : ''}`}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
      >
        <motion.div
          className={styles.canvas}
          style={{ originX: smoothX, originY: smoothY }}
          animate={{ scale: zoomed ? ZOOM : 1 }}
          transition={{ duration: duration.slow, ease: easeOut }}
        >
          <ArchImage
            key={drawing.src}
            src={drawing.src}
            alt={drawing.alt}
            placeholderLabel={drawing.label}
            onLoad={() => setLoaded(true)}
          />
        </motion.div>
      </div>

      <div className={styles.controls}>
        <AnimatePresence>
          {zoomed && (
            <motion.p
              className={styles.hint}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: duration.base, ease: easeOut }}
            >
              {strings.board.zoomHint}
            </motion.p>
          )}
        </AnimatePresence>
        <button
          type="button"
          className={styles.zoomButton}
          aria-pressed={zoomed}
          onClick={toggleFromButton}
          onKeyDown={handleButtonKeyDown}
        >
          {zoomed ? <Minus aria-hidden="true" strokeWidth={2} /> : <Plus aria-hidden="true" strokeWidth={2} />}
          <span>{zoomed ? strings.board.zoomOut : strings.board.zoomIn}</span>
        </button>
      </div>

      {/* Credits belong to real images (the placeholder labels itself), and appear only after
          the reveal: a drawing's author is often the architect, which would give the answer away. */}
      {revealed && loaded && drawing.credit && <p className={styles.credit}>{drawing.credit}</p>}
    </div>
  )
}
