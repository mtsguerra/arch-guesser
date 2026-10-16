import styles from './IconToggle.module.css'

/** A round icon button for a header setting (theme, sound). `label` names what pressing does. */
export function IconToggle({ icon: Icon, label, pressed, onClick }) {
  return (
    <button type="button" className={styles.toggle} aria-label={label} aria-pressed={pressed} onClick={onClick}>
      <Icon className={styles.icon} aria-hidden="true" strokeWidth={1.75} />
    </button>
  )
}
