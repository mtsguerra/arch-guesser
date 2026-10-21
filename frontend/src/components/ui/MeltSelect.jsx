import { useCallback, useEffect, useId, useLayoutEffect, useRef } from 'react'
import { motion, useSpring, useTransform } from 'motion/react'
import styles from './MeltSelect.module.css'
import { useReducedMotion } from '../../motionPref.js'

// A fast pill leads and a slower one follows; the goo filter melts the two into one stretching blob.
const LEAD = { stiffness: 420, damping: 38 }
const TAIL = { stiffness: 170, damping: 24 }

/**
 * A group of exclusive choices with a pill that melts from the old choice to the new one. The
 * labels are copied in the pill's ink and clipped to it, so the text turns light only where the pill is.
 *
 * @param options   [{ value, label, icon? }]  (an icon is a node shown before the label)
 * @param value     the chosen value
 * @param onChange(value)
 */
export function MeltSelect({ label, options, value, onChange }) {
  const reduce = useReducedMotion()
  const filterId = `melt-${useId().replace(/:/g, '')}`
  const root = useRef(null)
  const buttons = useRef([])
  const placed = useRef(false)
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  const indexRef = useRef(index)

  const leadX = useSpring(0, LEAD)
  const leadW = useSpring(0, LEAD)
  const tailX = useSpring(0, TAIL)
  const tailW = useSpring(0, TAIL)
  // The light copy of the labels shows through the union of both pills, so the bridge reads too.
  const clip = useTransform([leadX, leadW, tailX, tailW], ([lx, lw, tx, tw]) => {
    const left = Math.min(lx, tx)
    const right = Math.max(lx + lw, tx + tw)
    return `inset(0 calc(100% - ${right}px) 0 ${left}px round 0.375rem)`
  })

  const place = useCallback(
    (jump) => {
      const el = buttons.current[indexRef.current]
      if (!el) return
      for (const [spring, target] of [
        [leadX, el.offsetLeft],
        [leadW, el.offsetWidth],
        [tailX, el.offsetLeft],
        [tailW, el.offsetWidth],
      ]) {
        if (jump) spring.jump(target)
        else spring.set(target)
      }
    },
    [leadX, leadW, tailX, tailW],
  )

  useLayoutEffect(() => {
    indexRef.current = index
    place(!placed.current || reduce)
    placed.current = true
  }, [index, options.length, reduce, place])

  // A resize or a font load moves the choices: snap the pill to where they are now.
  useEffect(() => {
    const observer = new ResizeObserver(() => place(true))
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [place])

  function handleKeyDown(event) {
    const last = options.length - 1
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key]
    if (next === undefined) return
    event.preventDefault()
    onChange(options[next].value)
    buttons.current[next]?.focus()
  }

  return (
    <div ref={root} className={styles.root} role="radiogroup" aria-label={label} onKeyDown={handleKeyDown}>
      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId} x="-20%" y="-60%" width="140%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className={styles.goo} style={{ filter: `url(#${filterId})` }} aria-hidden="true">
        <motion.span className={styles.pill} style={{ x: tailX, width: tailW }} />
        <motion.span className={styles.pill} style={{ x: leadX, width: leadW }} />
      </div>

      <div className={styles.row}>
        {options.map((option, i) => (
          <button
            key={option.value}
            ref={(el) => (buttons.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={i === index}
            tabIndex={i === index ? 0 : -1}
            className={styles.option}
            onClick={() => onChange(option.value)}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>

      <motion.div className={`${styles.row} ${styles.ink}`} style={{ clipPath: clip }} aria-hidden="true">
        {options.map((option) => (
          <span key={option.value} className={styles.option}>
            {option.icon}
            {option.label}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
