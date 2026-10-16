import { useId } from 'react'
import styles from './SunMoonIcon.module.css'

/** A sun that turns into a moon: the rays fold in and a shadow slides over the disc (driven by data-theme). */
export function SunMoonIcon({ className = '' }) {
  const mask = useId()
  return (
    <svg className={`${styles.icon} ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <mask id={mask}>
        <rect width="24" height="24" fill="white" />
        <circle className={styles.bite} cx="16" cy="8" r="5" fill="black" />
      </mask>
      <circle className={styles.core} cx="12" cy="12" r="4.5" fill="currentColor" mask={`url(#${mask})`} />
      <g className={styles.rays}>
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
        <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
        <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
        <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
      </g>
    </svg>
  )
}
