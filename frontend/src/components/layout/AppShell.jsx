import { strings } from '../../strings.js'
import styles from './AppShell.module.css'

function PlanMark() {
  return (
    <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="var(--oxblood)" />
      <g fill="none" stroke="var(--cream)" strokeWidth="2.2" strokeLinecap="square">
        <path d="M7 7h18v18H7z" />
        <path d="M7 16h7M18 7v6" />
        <path d="M14 16a6 6 0 0 1 6 6" strokeWidth="1.6" />
      </g>
    </svg>
  )
}

export function AppShell({ actions, children }) {
  return (
    <div className={styles.shell}>
      <header className={styles.rail}>
        <a className={styles.brand} href="/">
          <PlanMark />
          <span className={styles.wordmark}>{strings.appName}</span>
        </a>
        <div className={styles.actions}>{actions}</div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
