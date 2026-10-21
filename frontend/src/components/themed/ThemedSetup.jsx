import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Blocks, Building2, Cable, Castle, ChevronDown, Church, Columns3, Cross, Crown, Flower2, Gem, House,
  LayoutGrid, Library, Landmark, MoonStar, Sparkles, Tent, Theater, TrainFront, Trophy,
} from 'lucide-react'
import { PlayIcon } from '../ui/icons.jsx'
import { fetchCatalogue } from '../../api/buildings.js'
import { LEVELS, THEMED_ROUNDS, readThemedPick, saveThemedPick, startThemedSession, themePool, themesOf } from '../../game/themed.js'
import { duration, easeOut } from '../../motion.js'
import { useStrings } from '../../i18n.js'
import { useReducedMotion } from '../../motionPref.js'
import { AppShell } from '../layout/AppShell.jsx'
import { MenuButton } from '../layout/MenuButton.jsx'
import { Button } from '../ui/Button.jsx'
import styles from './ThemedSetup.module.css'

const ICONS = {
  castles: Castle, 'churches-cathedrals': Church, mosques: MoonStar, monasteries: Cross, palaces: Crown,
  museums: Landmark, 'theatres-opera': Theater, 'railway-stations': TrainFront, 'bridges-towers': Cable,
  skyscrapers: Building2, libraries: Library, 'houses-villas': House, stadiums: Trophy, 'asian-temples': Tent,
  'ancient-ruins': Columns3, brutalism: Blocks, 'art-nouveau': Flower2, 'art-deco': Gem,
  'portuguese-azulejo': LayoutGrid, 'modern-icons': Sparkles,
}

/** The theme index: one numbered row per theme; the chosen row opens its difficulty strip. */
export function ThemedSetup() {
  const strings = useStrings()
  const { themed } = strings
  const reduce = useReducedMotion()
  const [catalogue, setCatalogue] = useState(null)
  const [failed, setFailed] = useState(false)
  const [pick, setPick] = useState(readThemedPick)

  useEffect(() => {
    fetchCatalogue().then(setCatalogue).catch(() => setFailed(true))
  }, [])
  useEffect(() => saveThemedPick(pick), [pick])

  // Rows keep the order of the theme list, not of the counts, so a theme never jumps while the data grows.
  const rows = useMemo(() => {
    if (!catalogue) return []
    const counts = new Map(themesOf(catalogue).map((t) => [t.id, t.count]))
    return Object.keys(themed.themes).filter((id) => counts.has(id)).map((id) => ({ id, count: counts.get(id) }))
  }, [catalogue, themed.themes])

  const start = () => {
    startThemedSession(themePool(catalogue, pick.theme), pick.theme, pick.level)
    window.location.hash = '#/themed/play'
  }

  return (
    <AppShell place={strings.places.themed} actions={<MenuButton />} floating>
      <div className={styles.setup}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>{themed.sheet} · {strings.titleBlock.sheetOf(1, 1)}</p>
          <h1 className={styles.heading}>{themed.heading}</h1>
          <p className={styles.lead}>{themed.lead}</p>
        </header>

        {failed && <p role="alert">{themed.failed}</p>}
        {catalogue && rows.length === 0 && <p>{themed.empty}</p>}

        <ol className={styles.sheet} aria-label={themed.themeStep}>
          {rows.map(({ id, count }, i) => {
            const Icon = ICONS[id] ?? Landmark
            const open = pick.theme === id
            return (
              <li key={id} className={styles.row} data-open={open || undefined}>
                <button
                  type="button"
                  className={styles.theme}
                  aria-expanded={open}
                  aria-controls={`levels-${id}`}
                  onClick={() => setPick((p) => ({ ...p, theme: open ? null : id }))}
                >
                  <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                  <Icon className={styles.icon} aria-hidden="true" strokeWidth={1.6} />
                  <span className={styles.name}>{themed.themes[id]}</span>
                  <span className={styles.count}>{themed.count(count)}</span>
                  <ChevronDown className={styles.caret} aria-hidden="true" strokeWidth={2} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`levels-${id}`}
                      className={styles.drawer}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : duration.base, ease: easeOut }}
                    >
                      <div className={styles.drawerInner}>
                        <p className={styles.levelTitle}>{themed.levelStep}</p>
                        <div role="radiogroup" aria-label={themed.levelStep} className={styles.levels}>
                          {LEVELS.map((level) => (
                            <button
                              key={level}
                              type="button"
                              role="radio"
                              aria-checked={pick.level === level}
                              className={styles.level}
                              onClick={() => setPick((p) => ({ ...p, level }))}
                            >
                              <span className={styles.levelName}>{themed.levels[level - 1].name}</span>
                              <span>{themed.levels[level - 1].text}</span>
                            </button>
                          ))}
                        </div>
                        <div className={styles.go}>
                          <span className={styles.rounds}>{themed.rounds(Math.min(THEMED_ROUNDS, count))}</span>
                          <Button icon={PlayIcon} onClick={start}>
                            {themed.start}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ol>
      </div>
    </AppShell>
  )
}
