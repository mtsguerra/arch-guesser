import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import { Check, Eye, Target, X } from 'lucide-react'
import { CheckIcon } from '../ui/icons.jsx'
import { GUESS_FIELDS } from '../../game/matchGuess.js'
import { eraName } from '../../game/useEras.js'
import { duration, easeOut } from '../../motion.js'
import { REVEAL, TICK, haptic } from '../../game/haptics.js'
import { chime, scratch, tick } from '../../game/sound.js'
import { useLanguage, useStrings } from '../../i18n.js'
import { countryName } from '../../game/countries.js'
import { Button } from '../ui/Button.jsx'
import { Hatch } from '../ui/Hatch.jsx'
import { BuildingIcon, CompassIcon, GlobeIcon, HourglassIcon, RevealIcon } from '../ui/InstrumentIcons.jsx'
import { CountryCombobox } from './CountryCombobox.jsx'
import { EraCombobox } from './EraCombobox.jsx'
import styles from './GuessForm.module.css'

const emptyValues = Object.fromEntries(GUESS_FIELDS.map((f) => [f, '']))
const shake = { x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.4, ease: 'easeOut' } }

function answerFor(field, building, eras, { strings, lang }) {
  switch (field) {
    case 'name':
      return building.name
    case 'architect':
      return building.architects.map((a) => a.name).join(' & ')
    case 'country':
      return countryName(building.location.countryCode, lang) ?? building.location.country
    case 'era': {
      const era = eras?.find((e) => e.id === building.era)
      return era ? eraName(era, strings) : building.era
    }
  }
}

/**
 * One guess field. Once correct (or revealed) the input is replaced by the
 * canonical answer, plotted in like the title block, so "Savoy" is corrected
 * to "Villa Savoye" the moment it locks.
 */
function Field({ id, field, icon: Icon, status, attempts, revealed, answer, children }) {
  const strings = useStrings()
  const controls = useAnimationControls()
  const messageId = `${id}-message`

  const wasLocked = useRef(status === 'correct')

  useEffect(() => {
    if (status === 'wrong') {
      controls.start(shake)
      scratch()
    }
  }, [status, attempts, controls])

  const locked = status === 'correct'

  // A field locking is felt: a small spring on the row and a tick, once, not when a saved result comes back.
  useEffect(() => {
    if (locked && !wasLocked.current) {
      controls.start({ scale: [1, 1.025, 1], transition: { duration: 0.4, ease: easeOut } })
      haptic(TICK)
      tick()
    }
    wasLocked.current = locked
  }, [locked, controls])

  const showAnswer = answer != null

  return (
    <motion.div className={styles.field} data-motion data-status={revealed ? (locked ? 'correct' : 'revealed') : status} animate={controls}>
      <label className={styles.label} htmlFor={id}>
        {strings.guess.fields[field]}
      </label>

      <div className={styles.control}>
        {Icon && <Icon className={styles.icon} aria-hidden="true" strokeWidth={1.75} />}
        {showAnswer ? (
          <output id={id} className={styles.answer} aria-describedby={messageId}>
            {locked && <Hatch />}
            <motion.span
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: duration.slow * 1.4, ease: easeOut }}
            >
              {answer}
            </motion.span>
          </output>
        ) : (
          children({ id, 'aria-describedby': messageId, 'aria-invalid': status === 'wrong' || undefined })
        )}

        <span className={styles.badge} aria-hidden="true">
          {locked && (
            <motion.span
              // Stamped down: lands a little big and crooked, then settles.
              initial={{ scale: 1.8, rotate: -14, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.25 }}
              style={{ display: 'grid' }}
            >
              <Check strokeWidth={2.5} />
            </motion.span>
          )}
          {revealed && !locked && <Eye strokeWidth={2} />}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {(status === 'wrong' || status === 'close') && !revealed && (
          <motion.p
            key={status}
            id={messageId}
            className={styles.message}
            data-kind={status}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: duration.base, ease: easeOut }}
          >
            {status === 'close' ? <Target aria-hidden="true" strokeWidth={2.25} /> : <X aria-hidden="true" strokeWidth={2.25} />}
            {status === 'close' ? strings.guess.close : strings.guess.wrong}
          </motion.p>
        )}
      </AnimatePresence>
      {locked && <span id={messageId} className="visually-hidden">{strings.guess.correct}</span>}
    </motion.div>
  )
}

/**
 * The guess sheet. Remount per building (`key={building.id}`) to clear the inputs.
 */
export function GuessForm({ building, eras, phase, fields, attempts, outcome, onSubmit, onEdit, onGiveUp }) {
  const strings = useStrings()
  const { lang } = useLanguage()
  const idPrefix = useId()
  const [values, setValues] = useState(emptyValues)
  const [nothingToCheck, setNothingToCheck] = useState(false)
  const revealed = phase === 'revealed'

  const wasRevealed = useRef(revealed)
  useEffect(() => {
    if (revealed && !wasRevealed.current) {
      haptic(REVEAL)
      chime()
    }
    wasRevealed.current = revealed
  }, [revealed])

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }))
    setNothingToCheck(false)
    onEdit(field)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const open = GUESS_FIELDS.filter((f) => fields[f] !== 'correct')
    if (!open.some((f) => values[f].trim())) return setNothingToCheck(true)
    onSubmit(values)
  }

  const correctCount = GUESS_FIELDS.filter((f) => fields[f] === 'correct').length
  const wrongCount = GUESS_FIELDS.filter((f) => fields[f] === 'wrong').length
  const closeCount = GUESS_FIELDS.filter((f) => fields[f] === 'close').length

  let status = ''
  if (revealed) status = outcome === 'solved' ? strings.guess.solved : strings.guess.gaveUp
  else if (nothingToCheck) status = strings.guess.nothingToCheck
  else if (attempts > 0) status = strings.guess.result(correctCount, wrongCount, closeCount)

  const fieldProps = (field) => ({
    id: `${idPrefix}-${field}`,
    field,
    status: fields[field],
    attempts,
    revealed,
    answer: revealed || fields[field] === 'correct' ? answerFor(field, building, eras, { strings, lang }) : null,
  })

  return (
    <section className={styles.sheet} aria-labelledby={`${idPrefix}-heading`}>
      <div className={styles.header}>
        <h2 id={`${idPrefix}-heading`} className={styles.heading}>
          {strings.guess.heading}
        </h2>
        <span className={styles.pips} aria-hidden="true">
          {GUESS_FIELDS.map((f) => (
            <span key={f} className={styles.pip} data-status={revealed && fields[f] !== 'correct' ? 'revealed' : fields[f]} />
          ))}
        </span>
      </div>

      <form id="guess-form" className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field {...fieldProps('name')} icon={BuildingIcon}>
          {(props) => (
            <input
              {...props}
              className={styles.input}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder={strings.guess.placeholders.name}
              value={values.name}
              onChange={(e) => update('name', e.target.value)}
            />
          )}
        </Field>

        <Field {...fieldProps('architect')} icon={CompassIcon}>
          {(props) => (
            <input
              {...props}
              className={styles.input}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder={strings.guess.placeholders.architect}
              value={values.architect}
              onChange={(e) => update('architect', e.target.value)}
            />
          )}
        </Field>

        <Field {...fieldProps('country')} icon={GlobeIcon}>
          {(props) => (
            <CountryCombobox
              {...props}
              className={styles.input}
              placeholder={strings.guess.placeholders.country}
              value={values.country}
              onChange={(value) => update('country', value)}
            />
          )}
        </Field>

        <Field {...fieldProps('era')} icon={HourglassIcon}>
          {(props) => (
            <EraCombobox
              {...props}
              className={styles.input}
              eras={eras}
              value={values.era}
              onChange={(era) => update('era', era)}
            />
          )}
        </Field>

        <p className={styles.status} role="status">
          {status}
        </p>

        {!revealed && (
          <div className={styles.actions}>
            <Button type="submit" icon={CheckIcon} className={styles.primary}>
              {strings.guess.submit}
            </Button>
            <Button variant="quiet" icon={RevealIcon} onClick={onGiveUp}>
              {strings.guess.giveUp}
            </Button>
          </div>
        )}
      </form>
    </section>
  )
}
