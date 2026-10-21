import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { duration, easeOut } from '../../motion.js'
import styles from './ArchImage.module.css'

const develop = (loaded) =>
  loaded ? { opacity: 1, filter: 'blur(0px)', scale: 1 } : { opacity: 0, filter: 'blur(12px)', scale: 1.02 }
const developTransition = { duration: duration.slow * 1.4, ease: easeOut }

/**
 * Image that develops into view once decoded. It draws no placeholder of its own (the
 * board shows a loader behind it); if the file fails to load, `onError` lets the parent
 * drop it (e.g. remove its tab).
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

  const imgRef = useRef(null)

  const settle = (img) => {
    if (crop) setRatio((img.naturalWidth * crop.w) / (img.naturalHeight * crop.h))
    setLoaded(true)
    onLoad?.()
  }
  const handleLoad = (event) => settle(event.currentTarget)

  // A cached image can finish before React attaches onLoad: without its size the crop frame would stretch it.
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth && !loaded) settle(img)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  if (crop) {
    // A frame with the cropped region's aspect ratio, fitted inside the box; the full
    // image is scaled and offset inside it so only the region shows.
    // Until the size is known the frame is hidden: its box would otherwise stretch the region to the whole stage.
    const frameSize = ratio ? { aspectRatio: ratio, height: 'auto', width: `min(100cqw, calc(100cqh * ${ratio}))` } : { visibility: 'hidden' }
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
            ref={imgRef}
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
