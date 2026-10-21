import { useEffect, useState } from 'react'
import { fetchCatalogue } from '../../api/buildings.js'
import { countryName } from '../../game/countries.js'
import { filterPool, pickedKeys, readConfig } from '../../game/custom.js'
import { useEras } from '../../game/useEras.js'
import { useLanguage, useStrings } from '../../i18n.js'
import { AppShell } from '../layout/AppShell.jsx'
import { DailyTeaser } from './DailyTeaser.jsx'
import { Levels } from './Levels.jsx'
import { ArchiveCard, LibraryCard, StreakCard } from './ProgressCards.jsx'
import { PencilFilter } from './PencilFilter.jsx'
import { PencilTitle } from './PencilTitle.jsx'
import { useFitToScreen } from './useFitToScreen.js'
import styles from './Home.module.css'

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
  const { home } = useStrings()
  useFitToScreen()
  const customSummary = useCustomSummary()
  const eras = useEras()
  const [catalogue, setCatalogue] = useState(null)
  useEffect(() => {
    fetchCatalogue()
      .then((c) => setCatalogue({ buildings: c.length, countries: new Set(c.map((b) => b.countryCode)).size }))
      .catch(() => {})
  }, [])
  const lv = home.levels
  const modes = [
    { key: 'normal', href: '#/play', name: home.normal.title, text: home.normal.text, action: lv.play },
    { key: 'themed', href: '#/themed', name: home.themed.title, text: home.themed.text, action: lv.setUp },
    { key: 'custom', href: '#/custom', name: home.custom.title, text: customSummary ?? home.custom.text, action: lv.setUp },
  ]

  return (
    <AppShell brand="afterHero" floating>
      <div className={styles.home}>
        <PencilFilter />
        <PencilTitle className={styles.title} />
        <div className={styles.levels}>
          <Levels modes={modes} />
        </div>
        <div className={styles.archive}>
          <ArchiveCard eras={eras} countriesTotal={catalogue?.countries} />
        </div>
        <aside className={styles.aside}>
          <DailyTeaser />
          <StreakCard />
          <LibraryCard />
        </aside>
        <footer className={styles.foot}>
          <p>{home.how}</p>
          {catalogue && eras?.length > 0 && <p>{home.stats(catalogue.buildings, eras.length)}</p>}
        </footer>
      </div>
    </AppShell>
  )
}
