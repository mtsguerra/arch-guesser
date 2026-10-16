import styles from './SlimButton.module.css'

/** A text control for the slim game bar: no box, an underline on hover. */
export function SlimButton({ icon: Icon, children, ...props }) {
  return (
    <button type="button" className={styles.button} {...props}>
      {Icon && <Icon className={styles.icon} aria-hidden="true" strokeWidth={1.75} />}
      <span>{children}</span>
    </button>
  )
}
