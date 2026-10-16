import { useEffect, useMemo, useState } from 'react'
import { useStrings } from '../../i18n.js'
import { LanguageSwitch } from './LanguageSwitch.jsx'
import { SoundToggle } from './SoundToggle.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'
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

// The wordmark plots itself once per visit: each letter starts as an outline and lights up at its own moment.
let plotted = false

function PlotterText({ text }) {
  const [animate] = useState(() => !plotted)
  useEffect(() => {
    plotted = true
  }, [])
  // Scattered but fixed (no randomness in render): each letter lights at its own moment.
  const letters = useMemo(
    () => [...text].map((char, i) => ({ char, key: i, delay: ((i * 37) % 10) / 11, length: 0.8 + ((i * 53) % 7) / 10 })),
    [text],
  )
  if (!animate) return text
  return (
    <>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {letters.map(({ char, key, delay, length }) =>
          char === ' ' ? (
            ' '
          ) : (
            <span key={key} className={styles.plot} style={{ animationDelay: `${delay}s`, animationDuration: `${length}s` }}>
              {char}
            </span>
          ),
        )}
      </span>
    </>
  )
}

/** @param place  where the player is (Daily #3, Custom…), shown beside the logo */
export function AppShell({ actions, place, children }) {
  const strings = useStrings()
  // The rail's edge only appears once content scrolls under it.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className={styles.shell}>
      <PageBackground />
      <header className={styles.rail} data-scrolled={scrolled || undefined}>
        {place && <span className={styles.place}>{place}</span>}
        <a className={styles.brand} href="#/" aria-label={strings.appName}>
          <PlanMark />
          <span className={styles.name}>
            <span className={styles.wordmark}>
              <PlotterText text={strings.appName} />
            </span>
            <span className={styles.tagline}>{strings.tagline}</span>
          </span>
        </a>
        <div className={styles.actions}>
          {actions}
          <ThemeToggle />
          <SoundToggle />
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
          ). {strings.credits.hintBackground} (
          <a
            href="https://commons.wikimedia.org/wiki/File:Focus_on_the_floating_footpath_of_the_Skywalk_in_3-dimensional_image,_Dutch_modern_architecture_design_in_free_image,_created_by_Arjan_and_Fons_Heijnsbroek.tif"
            target="_blank"
            rel="noreferrer"
          >
            {strings.credits.hintBackgroundLicence}
          </a>
          ).
        </p>
      </footer>
    </div>
  )
}
