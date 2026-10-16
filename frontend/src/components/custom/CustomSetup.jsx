import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import { fetchCatalogue } from '../../api/buildings.js'
import { countryName } from '../../game/countries.js'
import {
  MIN_BUILDINGS,
  MODES,
  ROUNDS,
  filterPool,
  facets,
  readConfig,
  saveConfig,
  startSession,
} from '../../game/custom.js'
import { springSoft } from '../../motion.js'
import { useLanguage, useStrings } from '../../i18n.js'
import { AppShell } from '../layout/AppShell.jsx'
import { MenuButton } from '../layout/MenuButton.jsx'
import { Button } from '../ui/Button.jsx'
import { LiveText } from './LiveText.jsx'
import { MultiPicker } from './MultiPicker.jsx'
import styles from './CustomSetup.module.css'

/** Which pickers each mode shows. */
const PICKERS = { architect: ['architects'], era: ['eras'], country: ['countries'], countryEra: ['countries', 'eras'] }

export function CustomSetup() {
  const strings = useStrings()
  const { lang } = useLanguage()
  const { custom } = strings
  const [catalogue, setCatalogue] = useState(null)
  const [failed, setFailed] = useState(false)
  const [config, setConfig] = useState(readConfig)

  useEffect(() => {
    fetchCatalogue().then(setCatalogue).catch(() => setFailed(true))
  }, [])
  useEffect(() => saveConfig(config), [config])

  const rows = useMemo(() => {
    if (!catalogue) return { architects: [], eras: [], countries: [] }
    return {
      architects: facets(catalogue, (b) => b.architects, (name) => name),
      eras: facets(catalogue, (b) => [b.era], (id) => strings.eras[id] ?? id),
      countries: facets(
        catalogue,
        (b) => [b.countryCode],
        (code) => countryName(code, lang) ?? catalogue.find((b) => b.countryCode === code).country,
      ),
    }
  }, [catalogue, lang, strings])

  const pool = useMemo(() => (catalogue ? filterPool(catalogue, config) : []), [catalogue, config])
  const ready = pool.length >= MIN_BUILDINGS
  const set = (patch) => setConfig((c) => ({ ...c, ...patch }))

  const start = () => {
    startSession(pool, config)
    window.location.hash = '#/custom/play'
  }

  return (
    <AppShell place={strings.places.custom} actions={<MenuButton />}>
      <div className={styles.setup}>
        <header className={styles.intro}>
          <h1 className={styles.heading}>{custom.heading}</h1>
          <p className={styles.lead}>{custom.lead(MIN_BUILDINGS)}</p>
        </header>

        {failed && <p role="alert">{custom.failed}</p>}

        <div className={styles.modes} role="group" aria-label={custom.modeLabel}>
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className={styles.mode}
              aria-pressed={config.mode === mode}
              onClick={() => set({ mode })}
            >
              {custom.modes[mode]}
            </button>
          ))}
        </div>

        <div className={styles.pickers}>
          {PICKERS[config.mode].map((kind) => (
            <MultiPicker
              key={kind}
              label={custom.pick[kind]}
              placeholder={custom.search}
              // Nothing is "not found" while the list is still loading.
              emptyText={catalogue ? custom.none : ''}
              rows={rows[kind]}
              selected={config[kind]}
              onChange={(keys) => set({ [kind]: keys })}
            />
          ))}
        </div>

        <fieldset className={styles.rounds}>
          <legend className={styles.legend}>{custom.rounds}</legend>
          {ROUNDS.map((n) => (
            <button
              key={n}
              type="button"
              className={styles.mode}
              aria-pressed={config.rounds === n}
              onClick={() => set({ rounds: n })}
            >
              {n === 'all' ? custom.all(pool.length) : n}
            </button>
          ))}
        </fieldset>

        <footer className={styles.footer}>
          <p className={styles.count}>
            <LiveText
              value={pool.length}
              format={(n) => (n >= MIN_BUILDINGS ? custom.matches(n) : custom.needed(n, MIN_BUILDINGS))}
            />
          </p>
          {/* Keyed on readiness so unlocking Start gives it a small settle. */}
          <motion.div key={ready} initial={ready ? { scale: 0.92 } : false} animate={{ scale: 1 }} transition={springSoft}>
            <Button icon={Play} disabled={!ready} onClick={start}>
              {custom.start}
            </Button>
          </motion.div>
        </footer>
      </div>
    </AppShell>
  )
}
