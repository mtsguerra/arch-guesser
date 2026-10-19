import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Eye } from 'lucide-react'
import { ExternalIcon } from '../ui/icons.jsx'
import { GUESS_FIELDS } from '../../game/matchGuess.js'
import { eraName, formatYear } from '../../game/useEras.js'
import { duration, easeOut } from '../../motion.js'
import { useLanguage, useStrings } from '../../i18n.js'
import { ArchImage } from '../ui/ArchImage.jsx'
import { Credit } from '../ui/Credit.jsx'
import { countryName } from '../../game/countries.js'
import { DailyCard } from './DailyCard.jsx'
import styles from './BuildingSummary.module.css'

// The monograph unfolds section by section as the board steps back.
const unfold = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
}
const section = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easeOut } },
}

function FactStrip({ building, era }) {
  const strings = useStrings()
  const { lang } = useLanguage()
  const { location } = building
  const items = [
    [strings.summary.facts.location, [location.city, countryName(location.countryCode, lang) ?? location.country].filter(Boolean).join(', ')],
    [strings.summary.facts.completed, building.yearCompleted == null ? strings.summary.facts.underConstruction : formatYear(building.yearCompleted, strings.years)],
    [
      strings.summary.facts.era,
      era ? (
        eraName(era, strings)
      ) : (
        building.era
      ),
    ],
    [strings.summary.facts.style, building.style],
  ].filter(([, value]) => value != null && value !== '')

  return (
    <dl className={styles.strip}>
      {items.map(([label, value]) => (
        <div key={label} className={styles.stripCell}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** The row's diagonal hatching (45 degrees, a line every 7px across, 2px thick), drawn stroke by stroke from left to right. */
const HATCH_GAP = 7 * Math.SQRT2 // 7px between lines, measured across them
function Hatch({ row }) {
  const root = useRef(null)
  const [size, setSize] = useState(null)
  useEffect(() => {
    const el = root.current
    if (!el) return undefined
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const strokes = size ? Array.from({ length: Math.ceil((size.w + size.h) / HATCH_GAP) + 1 }, (_, i) => i * HATCH_GAP - size.h) : []
  return (
    <svg ref={root} className={styles.hatch} viewBox={size ? `0 0 ${size.w} ${size.h}` : undefined} aria-hidden="true" style={{ '--row': row }}>
      {size &&
        strokes.map((x, i) => (
          <path key={i} d={`M${x} ${size.h}L${x + size.h} 0`} style={{ '--i': i, '--len': size.h * Math.SQRT2 }} />
        ))}
    </svg>
  )
}

/** Your guess against the answer, one ruled row per field. Four right earns the stamp. */
function Recap({ building, era, fields, log, outcome }) {
  const strings = useStrings()
  const { lang } = useLanguage()
  const { location } = building
  const answers = {
    name: building.name,
    architect: building.architects.map((a) => a.name).join(' & '),
    country: countryName(location.countryCode, lang) ?? location.country,
    era: era ? eraName(era, strings) : building.era,
  }
  const typed = (field) => log?.findLast((e) => e.field === field)?.text
  const allGot = GUESS_FIELDS.every((f) => fields[f] === 'correct')
  return (
    <div className={styles.recap}>
      <div className={styles.recapHead}>
        <p className={styles.outcome}>{outcome === 'solved' ? strings.guess.solved : strings.guess.gaveUp}</p>
        {allGot && <span className={styles.stamp}>{strings.summary.stamp}</span>}
      </div>
      <ul className={styles.recapList} aria-label={strings.summary.recap}>
        {GUESS_FIELDS.map((field) => {
          const got = fields[field] === 'correct'
          const Icon = got ? Check : Eye
          const guess = typed(field)
          return (
            <li key={field} className={got ? styles.got : styles.missed}>
              {got && <Hatch row={GUESS_FIELDS.indexOf(field)} />}
              <span className={styles.recapField}>{strings.guess.fields[field]}</span>
              <Icon className={styles.recapIcon} aria-hidden="true" strokeWidth={2.25} />
              <span className={styles.recapAnswer}>
                <span className="visually-hidden">{strings.summary.recapAnswer}: </span>
                {answers[field]}
              </span>
              {!got && (
                <span className={styles.recapGuess}>
                  <span className="visually-hidden">{strings.summary.recapGuess}: </span>
                  {guess ? <s>{guess}</s> : strings.summary.noGuess}
                </span>
              )}
              <span className="visually-hidden">: {got ? strings.summary.recapGot : strings.summary.recapMissed}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** The photo and a drawing (or a second photo) side by side under the title; tapping opens the gallery. */
function Hero({ building, onOpen }) {
  const strings = useStrings()
  const [bad, setBad] = useState({})
  const [loaded, setLoaded] = useState({})
  const photos = building.photos ?? []
  const first = photos.find((p) => p.view === 'EXTERIOR') ?? photos[0]
  const second = building.drawings?.[0] ?? photos.find((p) => p !== first)
  const tiles = [first && { ...first, key: 'a' }, second && { ...second, key: 'b' }].filter((t) => t && !bad[t.key])
  if (!tiles.length) return null
  return (
    <figure className={styles.hero}>
      <div className={styles.heroFrame}>
      <button type="button" className={styles.heroButton} data-count={tiles.length} onClick={onOpen} aria-label={strings.summary.showDrawings}>
        {tiles.map((t, i) => (
          <span key={t.key} className={styles.heroTile}>
            {(i === 0 || tiles.length === 1) && <span className={styles.scale} aria-hidden="true" />}
            {(i === 1 || tiles.length === 1) && (
              <svg className={styles.north} viewBox="0 0 10 16" aria-hidden="true">
                <path d="M5 0 L9 12 L5 9.5 L1 12Z" />
                <text x="5" y="16" textAnchor="middle">N</text>
              </svg>
            )}
            <ArchImage
              src={t.src}
              alt={t.alt}
              fit="cover"
              crop={t.crop}
              onLoad={() => setLoaded((l) => ({ ...l, [t.key]: true }))}
              onError={() => setBad((b) => ({ ...b, [t.key]: true }))}
            />
          </span>
        ))}
      </button>
      <div className={styles.cut} aria-hidden="true">
        <span className={styles.bub}>A</span>
        <span className={styles.cutLine} />
        <span className={styles.bub}>A</span>
      </div>
      </div>
      <figcaption className={styles.heroCredit}>
        {tiles.filter((t) => loaded[t.key] && t.credit).map((t) => (
          <span key={t.key}>
            <Credit text={t.credit} source={t.source} />
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

/** A slim title that slides in once the real one has scrolled away, so the reveal keeps its identity. */
function StickyTitle({ title, target, score, total }) {
  const reduce = useReducedMotion()
  const [away, setAway] = useState(false)
  useEffect(() => {
    const el = target.current
    if (!el) return undefined
    const observer = new IntersectionObserver(([entry]) => setAway(!entry.isIntersecting && entry.boundingClientRect.top < 0))
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])
  return (
    <div className={styles.stickyHold} aria-hidden="true">
      <AnimatePresence>
        {away && (
          <motion.div
            className={styles.sticky}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: duration.fast, ease: easeOut }}
          >
            <span className={styles.stickyName}>{title}</span>
            <span className={styles.stickyScore}>
              {score}/{total}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** The score as a level on a ruled scale: the triangle slides to it. */
function LevelMarker({ score, total }) {
  const strings = useStrings()
  return (
    <div className={styles.level} style={{ '--p': score / total }}>
      <div className={styles.ruler} aria-hidden="true">
        {Array.from({ length: total + 1 }, (_, i) => (
          <i key={i} className={styles.rulerTick} style={{ left: `${(i / total) * 100}%` }} />
        ))}
        <span className={styles.tri} />
      </div>
      <p className={styles.levelText}>
        <span>{strings.summary.levelLabel}</span>
        <strong>
          +{score} / {total}
        </strong>
      </p>
    </div>
  )
}

/** The foot of the sheet, set like a revision block. Its cells rise once it scrolls into view. */
function RevisionBlock({ building, era }) {
  const strings = useStrings()
  const root = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return setShown(true)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setShown(true)
      observer.disconnect()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const cells = [
    [strings.summary.drawnBy, building.architects.map((a) => a.name).join(' & ')],
    [strings.summary.dateLabel, building.yearCompleted == null ? strings.summary.noDate : formatYear(building.yearCompleted, strings.years)],
    [strings.summary.sheetLabel, building.style || (era ? eraName(era, strings) : building.era)],
  ]
  return (
    <dl ref={root} className={styles.rev} data-shown={shown || undefined}>
      {cells.map(([label, value], i) => (
        <div key={label} className={styles.revCell} style={{ '--i': i }}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** The first sentence, set larger, and the rest. A full stop inside an abbreviation ("d.C. sob") is not a sentence end. */
function splitLede(text) {
  const match = /^(.+?[.!?])\s+(?=[A-ZÀ-ÝÁÉÍÓÚ“"])/.exec(text)
  return match ? [match[1], text.slice(match[0].length)] : [null, text]
}

/** A print in the gallery. If its file fails to load, the whole print disappears. */
function Photo({ photo }) {
  const strings = useStrings()
  const [status, setStatus] = useState('loading')
  if (status === 'error') return null
  return (
    <figure className={styles.photo}>
      <div className={styles.print}>
        <ArchImage
          src={photo.src}
          alt={photo.alt}
          fit="cover"
          crop={photo.crop}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      </div>
      <figcaption>
        {photo.caption ?? strings.board.views[photo.view]}
        {status === 'loaded' && photo.credit && (
          <span className={styles.credit}>
            <Credit text={photo.credit} source={photo.source} />
          </span>
        )}
      </figcaption>
    </figure>
  )
}

export function BuildingSummary({ building, eras, fields, log, onOpenBoard, play = true, outcome, daily }) {
  const strings = useStrings()
  const heading = useRef(null)
  const era = eras?.find((e) => e.id === building.era)
  const photos = building.photos ?? []
  const [lede, rest] = splitLede(building.summary.description)
  const score = GUESS_FIELDS.filter((f) => fields[f] === 'correct').length
  const facts = [...building.hints.map((h) => h.text), ...building.summary.funFacts]

  // Move focus to the summary so keyboard and screen-reader users land on the payoff.
  useEffect(() => heading.current?.focus({ preventScroll: true }), [])

  return (
    <motion.article className={styles.monograph} aria-label={strings.summary.label} variants={unfold} initial="hidden" animate="shown" data-play={play || undefined}>
      <StickyTitle title={building.name} target={heading} score={score} total={GUESS_FIELDS.length} />
      <motion.header className={styles.header} variants={section}>
        <h2 ref={heading} tabIndex={-1} className={styles.title}>
          {building.name}
        </h2>
        <p className={styles.byline}>{building.architects.map((a) => a.name).join(' & ')}</p>
        <div className={styles.dim} aria-hidden="true">
          <span className={styles.dimLine} />
          {building.yearCompleted != null && <span className={styles.dimLabel}>{formatYear(building.yearCompleted, strings.years)}</span>}
          <span className={styles.dimLine} data-end />
        </div>
      </motion.header>

      {onOpenBoard && (
        <motion.div variants={section}>
          <Hero building={building} onOpen={onOpenBoard} />
        </motion.div>
      )}

      <motion.div variants={section}>
        <FactStrip building={building} era={era} />
      </motion.div>

      <motion.div variants={section}>
        <LevelMarker score={score} total={GUESS_FIELDS.length} />
      </motion.div>

      <motion.div variants={section}>
        {daily ? <DailyCard daily={daily} play={play} /> : <Recap building={building} era={era} fields={fields} log={log} outcome={outcome} />}
      </motion.div>

      <motion.div className={styles.reading} variants={section}>
        {lede && <p className={styles.ledeLine}>{lede}</p>}
        <p className={styles.lead}>{rest}</p>
      </motion.div>

      <motion.div className={styles.columns} variants={section}>
        {building.summary.keyFeatures.length > 0 && (
          <section>
            <h3 className={styles.sectionTitle}>{strings.summary.keyFeatures}</h3>
            <ul className={styles.features}>
              {building.summary.keyFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
        )}
        {facts.length > 0 && (
          <section className={styles.note}>
            <h3 className={styles.sectionTitle}>{strings.summary.funFacts}</h3>
            <ul className={styles.facts}>
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
        )}
      </motion.div>

      {photos.length > 0 && (
        <motion.section variants={section}>
          <h3 className={styles.sectionTitle}>{strings.summary.photos}</h3>
          <div className={styles.gallery}>
            {photos.map((photo) => (
              <Photo key={photo.src} photo={photo} />
            ))}
          </div>
        </motion.section>
      )}

      <motion.section variants={section}>
        <h3 className={styles.sectionTitle}>{strings.summary.architects(building.architects.length)}</h3>
        <div className={styles.architects}>
          {building.architects.map((a) => (
            <div key={a.name} className={styles.architect}>
              <p className={styles.architectName}>{a.name}</p>
              <p className={styles.architectMeta}>{[a.lifespan, a.nationality].filter(Boolean).join(' · ')}</p>
              <p className={styles.bio}>{a.bio}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {building.wikipedia && (
        <motion.section className={styles.more} variants={section} aria-labelledby="more-title">
          <h3 id="more-title" className={styles.sectionTitle}>
            {strings.summary.more.title}
          </h3>
          <p>{strings.summary.more.text}</p>
          <a className={styles.moreLink} href={building.wikipedia} target="_blank" rel="noreferrer">
            {strings.summary.more.link}
            <ExternalIcon className={styles.moreIcon} aria-hidden="true" strokeWidth={1.75} />
          </a>
        </motion.section>
      )}

      <RevisionBlock building={building} era={era} />
    </motion.article>
  )
}
