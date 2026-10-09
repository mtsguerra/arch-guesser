import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, Eye } from 'lucide-react'
import { GUESS_FIELDS } from '../../game/matchGuess.js'
import { eraRange } from '../../game/useEras.js'
import { duration, easeOut } from '../../motion.js'
import { strings } from '../../strings.js'
import { ArchImage } from '../ui/ArchImage.jsx'
import { Credit } from '../ui/Credit.jsx'
import { Button } from '../ui/Button.jsx'
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
  const { location } = building
  const items = [
    [strings.summary.facts.location, [location.city, location.country].filter(Boolean).join(', ')],
    [strings.summary.facts.completed, building.yearCompleted ?? strings.summary.facts.underConstruction],
    [
      strings.summary.facts.era,
      era ? (
        <>
          {/* Break only between "Modernism ·" and the range, never before the dot or inside the range */}
          {era.label}&nbsp;· <span className={styles.nowrap}>{eraRange(era)}</span>
        </>
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

function Recap({ fields, outcome }) {
  return (
    <div className={styles.recap}>
      <p className={styles.outcome}>{outcome === 'solved' ? strings.guess.solved : strings.guess.gaveUp}</p>
      <ul className={styles.recapList} aria-label={strings.summary.recap}>
        {GUESS_FIELDS.map((field) => {
          const got = fields[field] === 'correct'
          const Icon = got ? Check : Eye
          return (
            <li key={field} className={got ? styles.got : styles.missed}>
              <Icon aria-hidden="true" strokeWidth={2.25} />
              {strings.guess.fields[field]}
              <span className="visually-hidden">: {got ? strings.summary.recapGot : strings.summary.recapMissed}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** A print in the gallery. If its file fails to load, the whole print disappears. */
function Photo({ photo }) {
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

export function BuildingSummary({ building, eras, fields, outcome, onNext }) {
  const heading = useRef(null)
  const era = eras?.find((e) => e.id === building.era)
  const photos = building.photos ?? []
  const facts = [...building.hints.map((h) => h.text), ...building.summary.funFacts]

  // Move focus to the summary so keyboard and screen-reader users land on the payoff.
  useEffect(() => heading.current?.focus({ preventScroll: true }), [])

  return (
    <motion.article className={styles.monograph} aria-label={strings.summary.label} variants={unfold} initial="hidden" animate="shown">
      <motion.header className={styles.header} variants={section}>
        <h2 ref={heading} tabIndex={-1} className={styles.title}>
          {building.name}
        </h2>
        <p className={styles.byline}>{building.architects.map((a) => a.name).join(' & ')}</p>
      </motion.header>

      <motion.div variants={section}>
        <FactStrip building={building} era={era} />
      </motion.div>

      <motion.div variants={section}>
        <Recap fields={fields} outcome={outcome} />
      </motion.div>

      <motion.p className={styles.lead} variants={section}>
        {building.summary.description}
      </motion.p>

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
          <section>
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

      <motion.footer className={styles.footer} variants={section}>
        <Button icon={ArrowRight} onClick={onNext}>
          {strings.guess.next}
        </Button>
      </motion.footer>
    </motion.article>
  )
}
