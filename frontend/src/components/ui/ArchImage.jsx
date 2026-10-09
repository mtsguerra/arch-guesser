import { useState } from 'react'
import { motion } from 'motion/react'
import { duration, easeOut } from '../../motion.js'
import styles from './ArchImage.module.css'

const develop = (loaded) => (loaded ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(8px)' })
const developTransition = { duration: duration.slow, ease: easeOut }

/**
 * Image that develops into view once decoded. There is no placeholder: if the
 * file fails to load, `onError` lets the parent drop it (e.g. remove its tab).
 * Remount with `key={src}` to reset.
 *
 * @param fit     'contain' for drawings (scans multiply onto the paper), 'photo' to show a
 *                whole photograph, 'cover' to fill a frame.
 * @param crop    optional { x, y, w, h } fractions: show only that region (e.g. to hide a title block).
 * @param onLoad  called once the image has loaded (e.g. to show its credit).
 */
export function ArchImage({ src, alt, fit = 'contain', crop, className = '', onLoad, onError }) {
  const [loaded, setLoaded] = useState(false)
  const [ratio, setRatio] = useState(null)

  const handleLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget
    if (crop) setRatio((naturalWidth * crop.w) / (naturalHeight * crop.h))
    setLoaded(true)
    onLoad?.()
  }

  if (crop) {
    // A frame with the cropped region's aspect ratio, fitted inside the box; the full
    // image is scaled and offset inside it so only the region shows.
    const frameSize = ratio ? { aspectRatio: ratio, width: `min(100cqw, calc(100cqh * ${ratio}))` } : undefined
    return (
      <div className={`${styles.cropBox} ${className}`}>
        <motion.div
          className={`${styles.cropFrame} ${fit === 'contain' ? styles.blend : ''}`}
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
            onError={onError}
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
      onError={onError}
      initial={false}
      animate={develop(loaded)}
      transition={developTransition}
    />
  )
}
