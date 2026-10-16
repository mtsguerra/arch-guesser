import { useEffect, useRef } from 'react'
import { useReducedMotion, useSpring } from 'motion/react'

/**
 * A line with a number in it that rolls to its new value instead of jumping.
 * The animated text is hidden from screen readers; a plain copy announces the final value.
 */
export function LiveText({ value, format }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const spring = useSpring(value, { stiffness: 220, damping: 30 })
  const formatRef = useRef(format)
  // Keeps the text current after a re-render too (a language switch changes the wording, not the number).
  useEffect(() => {
    formatRef.current = format
    if (ref.current) ref.current.textContent = format(Math.round(spring.get()))
  })

  // The animated text is written straight to the DOM (React would fight it with every frame).
  useEffect(() => {
    const show = (v) => {
      if (ref.current) ref.current.textContent = formatRef.current(Math.round(v))
    }
    show(spring.get())
    return spring.on('change', show)
  }, [spring])

  useEffect(() => {
    if (reduce) spring.jump(value)
    else spring.set(value)
  }, [value, reduce, spring])

  return (
    <>
      <span ref={ref} aria-hidden="true" />
      <span className="visually-hidden" role="status">
        {format(value)}
      </span>
    </>
  )
}
