import styles from './Button.module.css'

/**
 * @param {'primary' | 'rail' | 'cream' | 'ghost' | 'quiet'} variant  `rail` and `cream` sit on the dark header rail (`cream` is the solid one);
 *   `quiet` is a text-weight action for secondary choices.
 * @param {boolean} compact  hide the label on narrow screens and keep the icon (pass an `aria-label`).
 */
export function Button({ variant = 'primary', icon: Icon, compact = false, children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]} ${compact ? styles.compact : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon className={styles.icon} aria-hidden="true" strokeWidth={1.75} />}
      <span>{children}</span>
    </button>
  )
}
