import { useEffect, useState } from 'react'
import { fetchCatalogue } from '../../api/buildings.js'
import { countryName } from '../../game/countries.js'
import { filterPool, pickedKeys, readConfig } from '../../game/custom.js'
import { dailyNumber, readDaily } from '../../game/daily.js'
import { useCountdown } from '../../game/useCountdown.js'
import { useEras } from '../../game/useEras.js'
import { useLanguage, useStrings } from '../../i18n.js'
import { AppShell } from '../layout/AppShell.jsx'
import { RollingText } from '../ui/RollingNumber.jsx'
import { PencilDrawing } from './PencilDrawing.jsx'
import { PencilFilter } from './PencilFilter.jsx'
import { PencilTitle } from './PencilTitle.jsx'
import styles from './Home.module.css'

// Three hand-drawn underlines, so the names don't all get the same stroke.
const STROKES = [
  'M2 7 C60 3 120 10 180 6 S300 4 350 7',
  'M2 6 C70 9 130 3 190 7 S310 9 350 5',
  'M2 8 C50 4 110 9 170 5 S290 8 350 6',
]

/** One mode: its name, underlined by the pencil, and a line about it. The whole block is the link. */
function Mode({ href, tone, index, name, text }) {
  return (
    <li className={`${styles.mode} ${tone === 'main' ? styles.main : ''}`}>
      <a className={styles.link} href={href}>
        <span className={styles.nameWrap}>
          <h2 className={styles.name}>{name}</h2>
          <svg className={styles.underline} viewBox="0 0 352 12" preserveAspectRatio="none" aria-hidden="true" style={{ '--d': `${0.5 + index * 0.6}s` }}>
            <path pathLength="1" d={STROKES[index]} />
          </svg>
        </span>
        <p className={styles.text}>{text}</p>
      </a>
    </li>
  )
}

/** What the remembered Custom setup would play ("12 buildings · Siza +1"), or null if nothing is picked. */
function useCustomSummary() {
  const { lang } = useLanguage()
  const { eras: eraNames, home } = useStrings()
  const [catalogue, setCatalogue] = useState(null)
  useEffect(() => {
    fetchCatalogue().then(setCatalogue).catch(() => {})
  }, [])
  if (!catalogue) return null
  const config = readConfig()
  const picked = pickedKeys(config)
  const count = filterPool(catalogue, config).length
  if (!picked.length || !count) return null
  const label = ({ kind, key }) =>
    kind === 'countries' ? (countryName(key, lang) ?? key) : kind === 'eras' ? (eraNames[key] ?? key) : key
  return home.custom.summary(count, label(picked[0]), picked.length - 1)
}

export function Home() {
  const { home, daily } = useStrings()
  const left = useCountdown()
  const number = dailyNumber()
  const customSummary = useCustomSummary()
  const eras = useEras()
  const [buildings, setBuildings] = useState(null)
  useEffect(() => {
    fetchCatalogue().then((c) => setBuildings(c.length)).catch(() => {})
  }, [])

  return (
    <AppShell brand="afterHero">
      <div className={styles.home}>
        <PencilFilter />
        <PencilTitle />
        <div className={styles.hero}>
          <PencilDrawing />
        </div>

        <p className={styles.how}>{home.how}</p>

        <ul className={styles.modes}>
          <Mode
            href="#/daily"
            tone="main"
            index={0}
            name={<RollingText value={number} format={daily.title} />}
            text={readDaily(number) ? daily.done(left) : daily.play}
          />
          <Mode href="#/play" index={1} name={home.normal.title} text={home.normal.text} />
          <Mode href="#/custom" index={2} name={home.custom.title} text={customSummary ?? home.custom.text} />
        </ul>

        {buildings && eras?.length > 0 && <p className={styles.stats}>{home.stats(buildings, eras.length)}</p>}
      </div>
    </AppShell>
  )
}
