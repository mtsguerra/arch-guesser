import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Lightbulb } from 'lucide-react'
import { duration, easeOut } from '../../motion.js'
import { strings } from '../../strings.js'
import { ArchImage } from '../ui/ArchImage.jsx'
import { Button } from '../ui/Button.jsx'
import styles from './HintTray.module.css'

// Each hint is laid down on the table like a print: drops in, slightly askew, then settles.
const hintMotion = {
  initial: { opacity: 0, y: -14, rotate: -1.2, scale: 0.97 },
  animate: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { duration: duration.slow, ease: easeOut } },
}

function HintContent({ hint }) {
  if (hint.type === 'IMAGE') {
    return (
      <figure className={styles.photo}>
        <div className={styles.print}>
          <ArchImage
            key={hint.image.src}
            src={hint.image.src}
            alt={hint.image.alt}
            fit="cover"
            crop={hint.image.crop}
            placeholderTitle={strings.hints.missingPhoto}
          />
        </div>
        {hint.caption && <figcaption className={styles.caption}>{hint.caption}</figcaption>}
      </figure>
    )
  }
  return <p className={styles.fact}>{hint.text}</p>
}

export function HintTray({ hints, hintLevel, canReveal, onReveal }) {
  const shown = hints.slice(0, hintLevel)
  const remaining = hints.length - hintLevel
  const newest = useRef(null)
  const previousLevel = useRef(hintLevel)

  // A hint the player asked for takes focus (the button may have just vanished);
  // hints opened all at once by the reveal don't steal it.
  useEffect(() => {
    if (hintLevel === previousLevel.current + 1) newest.current?.focus({ preventScroll: true })
    previousLevel.current = hintLevel
  }, [hintLevel])

  return (
    <section className={styles.tray} aria-labelledby="hints-heading">
      <h2 id="hints-heading" className={styles.heading}>
        {strings.hints.heading}
        <span className={styles.count}>
          {hintLevel}/{hints.length}
        </span>
      </h2>

      {shown.length === 0 && <p className={styles.empty}>{strings.hints.empty}</p>}

      <ol className={styles.list}>
        <AnimatePresence initial={false}>
          {shown.map((hint, i) => (
            <motion.li
              key={hint.order}
              ref={i === shown.length - 1 ? newest : undefined}
              tabIndex={-1}
              className={styles.hint}
              layout
              variants={hintMotion}
              initial="initial"
              animate="animate"
            >
              <span className={styles.label}>
                {strings.hints.label(i + 1)} · {hint.type === 'IMAGE' ? strings.hints.photo : strings.hints.fact}
              </span>
              <HintContent hint={hint} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      {canReveal && remaining > 0 && (
        <motion.div layout className={styles.action}>
          <Button variant="ghost" icon={Lightbulb} onClick={onReveal}>
            {strings.hints.show(hintLevel + 1, hints.length)}
          </Button>
        </motion.div>
      )}
    </section>
  )
}
