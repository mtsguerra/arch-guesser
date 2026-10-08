import { useState } from 'react'
import { motion } from 'motion/react'
import { duration, easeOut } from '../../motion.js'
import { strings } from '../../strings.js'
import styles from './ArchImage.module.css'

/**
 * Image that develops into view once decoded and falls back to a hatched
 * placeholder when the file is missing. Remount with `key={src}` to reset.
 *
 * @param fit     'contain' for drawings (never crop a plan), 'cover' for photos.
 * @param onLoad  called once the real image has loaded (e.g. to show its credit).
 */
export function ArchImage({
  src,
  alt,
  placeholderTitle = strings.board.missingDrawing,
  placeholderLabel,
  fit = 'contain',
  className = '',
  onLoad,
}) {
  const [status, setStatus] = useState('loading')

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

  return (
    <motion.img
      src={src}
      alt={alt}
      decoding="async"
      draggable={false}
      className={`${styles.image} ${styles[fit]} ${className}`}
      onLoad={() => {
        setStatus('loaded')
        onLoad?.()
      }}
      onError={() => setStatus('error')}
      initial={false}
      animate={status === 'loaded' ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: duration.slow, ease: easeOut }}
    />
  )
}
