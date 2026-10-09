import { useState } from 'react'
import { motion } from 'motion/react'
import { duration, easeOut } from '../../motion.js'
import { strings } from '../../strings.js'
import styles from './ArchImage.module.css'

const develop = (loaded) => (loaded ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(8px)' })
const developTransition = { duration: duration.slow, ease: easeOut }

/**
 * Image that develops into view once decoded and falls back to a hatched
 * placeholder when there is no image (`src` null) or it fails to load.
 * Remount with `key={src}` to reset.
 *
 * @param fit     'contain' for drawings (never crop a plan), 'cover' for photos.
 * @param crop    optional { x, y, w, h } fractions: show only that region (e.g. to hide a title block).
 * @param onLoad  called once the real image has loaded (e.g. to show its credit).
 */
export function ArchImage({
  src,
  alt,
  placeholderTitle = strings.board.missingDrawing,
  placeholderLabel,
  fit = 'contain',
  crop,
  className = '',
  onLoad,
}) {
  const [status, setStatus] = useState(src ? 'loading' : 'error')
  const [ratio, setRatio] = useState(null)

  if (status === 'error') {
    return (
      <div className={`${styles.placeholder} ${className}`} role="img" aria-label={alt}>
        <div className={styles.note} aria-hidden="true">
          <span className={styles.noteTitle}>{placeholderTitle}</span>
          {placeholderLabel && <span className={styles.noteLabel}>{placeholderLabel}</span>}
        </div>
      </div>
    )
  }

  const loaded = status === 'loaded'
  const handleLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget
    if (crop) setRatio((naturalWidth * crop.w) / (naturalHeight * crop.h))
    setStatus('loaded')
    onLoad?.()
  }

  if (crop) {
    // A frame with the cropped region's aspect ratio, fitted inside the box; the full
    // image is scaled and offset inside it so only the region shows.
    const frameSize = ratio ? { aspectRatio: ratio, width: `min(100cqw, calc(100cqh * ${ratio}))` } : undefined
    return (
      <div className={`${styles.cropBox} ${className}`}>
        <motion.div
          className={styles.cropFrame}
          style={frameSize}
          initial={false}
          animate={develop(loaded && ratio)}
          transition={developTransition}
        >
          <img
            src={src}
            alt={alt}
            decoding="async"
            draggable={false}
            className={styles.cropped}
            style={{
              width: `${100 / crop.w}%`,
              height: `${100 / crop.h}%`,
              left: `${(-crop.x / crop.w) * 100}%`,
              top: `${(-crop.y / crop.h) * 100}%`,
            }}
            onLoad={handleLoad}
            onError={() => setStatus('error')}
          />
        </motion.div>
      </div>
    )
  }

  return (
    <motion.img
      src={src}
      alt={alt}
      decoding="async"
      draggable={false}
      className={`${styles.image} ${styles[fit]} ${className}`}
      onLoad={handleLoad}
      onError={() => setStatus('error')}
      initial={false}
      animate={develop(loaded)}
      transition={developTransition}
    />
  )
}
