import styles from './Button.module.css'

/**
 * @param {'primary' | 'rail' | 'ghost' | 'quiet'} variant  `rail` sits on the dark header rail;
 *   `quiet` is a text-weight action for secondary choices.
 */
export function Button({ variant = 'primary', icon: Icon, children, className = '', ...props }) {
  return (
    <button type="button" className={`${styles.button} ${styles[variant]} ${className}`} {...props}>
      {Icon && <Icon className={styles.icon} aria-hidden="true" strokeWidth={1.75} />}
      <span>{children}</span>
    </button>
  )
}
