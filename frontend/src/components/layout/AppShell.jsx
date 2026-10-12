import { useStrings } from '../../i18n.js'
import { LanguageSwitch } from './LanguageSwitch.jsx'
import { PageBackground } from './PageBackground.jsx'
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
  const strings = useStrings()
  return (
    <div className={styles.shell}>
      <PageBackground />
      <header className={styles.rail}>
        <a className={styles.brand} href="/">
          <PlanMark />
          <span className={styles.name}>
            <span className={styles.wordmark}>{strings.appName}</span>
            <span className={styles.tagline}>{strings.tagline}</span>
          </span>
        </a>
        <div className={styles.actions}>
          {actions}
          <LanguageSwitch />
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>
          {strings.credits.images}{' '}
          <a href="https://commons.wikimedia.org/" target="_blank" rel="noreferrer">
            {strings.credits.commons}
          </a>
          {strings.credits.facts}{' '}
          <a href="https://www.wikipedia.org/" target="_blank" rel="noreferrer">
            {strings.credits.wikipedia}
          </a>{' '}
          (
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
            {strings.credits.licence}
          </a>
          ).
        </p>
      </footer>
    </div>
  )
}
