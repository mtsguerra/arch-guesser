import styles from './SpeakerIcon.module.css'

/**
 * A speaker whose sound waves draw themselves in when sound is on and whose cross draws in when it is
 * off. It follows the `aria-pressed` of the button around it (see the css), and the speaker body
 * carries `data-speaker-body` so the button can pop it.
 */
export function SpeakerIcon({ className = '' }) {
  return (
    <svg className={`${styles.icon} ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path className={styles.body} data-speaker-body="" d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
      <path className={`${styles.wave} ${styles.w1}`} pathLength="1" d="M15.5 9a4 4 0 0 1 0 6" />
      <path className={`${styles.wave} ${styles.w2}`} pathLength="1" d="M18 6.5a7.5 7.5 0 0 1 0 11" />
      <path className={`${styles.off} ${styles.x1}`} pathLength="1" d="M16 9.5l5 5" />
      <path className={`${styles.off} ${styles.x2}`} pathLength="1" d="M21 9.5l-5 5" />
    </svg>
  )
}
