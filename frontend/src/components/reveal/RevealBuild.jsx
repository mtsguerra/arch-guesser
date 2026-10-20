import { useEffect, useEffectEvent } from 'react'
import { motion } from 'motion/react'
import { useStrings } from '../../i18n.js'
import { easeOut, springSoft } from '../../motion.js'
import { silhouetteFor } from './silhouettes.js'
import styles from './RevealBuild.module.css'

const TOTAL_MS = 4400

/**
 * The answer being built: a blueprint plots itself, the building rises into it, and the
 * name, architect and place are lettered in. About four seconds, and it can be skipped.
 */
export function RevealBuild({ building, onDone, solved = false }) {
  const strings = useStrings()
  const settle = useEffectEvent(onDone)

  useEffect(() => {
    const timer = setTimeout(settle, TOTAL_MS)
    const onKey = (event) => event.key === 'Escape' && settle()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const { name, architects, location, yearCompleted, era } = building
  const { strokes, mass } = silhouetteFor(era)
  const place = [location.city, location.country].filter(Boolean).join(', ')
  const meta = [place, yearCompleted].filter(Boolean).join(' · ')

  return (
    <motion.div
      className={styles.overlay}
      role="status"
      aria-label={strings.reveal.building}
      // It arrives as a material: the page behind softens and recedes while it settles in.
      initial={{ opacity: 0, scale: 1.04, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(14px)', transition: { opacity: { duration: 0.35 }, scale: springSoft, backdropFilter: { duration: 0.5 } } }}
      exit={{ opacity: 0, scale: 0.98, backdropFilter: 'blur(0px)', transition: { duration: 0.6, ease: easeOut } }}
      onClick={onDone}
    >
      <button type="button" className={styles.skip} onClick={onDone}>
        {strings.reveal.skip}
      </button>

      {solved && (
        // All four right: a line sweeps down the sheet and the four pips fill in turn, before the drawing starts.
        <>
          <motion.span
            className={styles.sweep}
            aria-hidden="true"
            initial={{ top: '0%', opacity: 1 }}
            animate={{ top: '100%', opacity: [1, 1, 0] }}
            transition={{ duration: 1.2, delay: 0.2, ease: easeOut }}
          />
          <div className={styles.pips} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className={styles.pip}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3 + i * 0.18, duration: 0.3, ease: easeOut }}
              />
            ))}
          </div>
        </>
      )}

      <div className={styles.stage}>
        <svg className={styles.drawing} viewBox="0 0 400 244" aria-hidden="true">
          <motion.path
            d={mass}
            className={styles.mass}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 1.7, duration: 1.1, ease: easeOut }}
          />
          {strokes.map(({ d, delay, duration, tone = 'line' }) => (
            <motion.path
              key={d}
              d={d}
              className={styles[tone]}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay, duration, ease: easeOut }}
            />
          ))}
        </svg>

        <div className={styles.lettering}>
          <motion.h2
            className={styles.name}
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ delay: 2.3, duration: 0.9, ease: easeOut }}
          >
            {name}
          </motion.h2>
          <motion.p
            className={styles.architect}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.9, duration: 0.5, ease: easeOut }}
          >
            {architects.map((a) => a.name).join(' & ')}
          </motion.p>
          <motion.p
            className={styles.meta}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.15, duration: 0.5, ease: easeOut }}
          >
            {meta}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
