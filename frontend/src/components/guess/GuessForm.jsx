import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import { ArrowRight, BookOpen, Building2, Check, Eye, Globe, Hourglass, PencilRuler, X } from 'lucide-react'
import { GUESS_FIELDS } from '../../game/matchGuess.js'
import { eraName } from '../../game/useEras.js'
import { duration, easeOut } from '../../motion.js'
import { useLanguage, useStrings } from '../../i18n.js'
import { countryName } from '../../game/countries.js'
import { Button } from '../ui/Button.jsx'
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

  useEffect(() => {
    if (status === 'wrong') controls.start(shake)
  }, [status, attempts, controls])

  const locked = status === 'correct'
  const showAnswer = answer != null

  return (
    <motion.div className={styles.field} data-status={revealed ? (locked ? 'correct' : 'revealed') : status} animate={controls}>
      <label className={styles.label} htmlFor={id}>
        {strings.guess.fields[field]}
      </label>

      <div className={styles.control}>
        {Icon && <Icon className={styles.icon} aria-hidden="true" strokeWidth={1.75} />}
        {showAnswer ? (
          <output id={id} className={styles.answer} aria-describedby={messageId}>
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
          {locked && <Check strokeWidth={2.5} />}
          {revealed && !locked && <Eye strokeWidth={2} />}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {status === 'wrong' && !revealed && (
          <motion.p
            key="wrong"
            id={messageId}
            className={styles.message}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: duration.base, ease: easeOut }}
          >
            <X aria-hidden="true" strokeWidth={2.25} />
            {strings.guess.wrong}
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
export function GuessForm({ building, eras, phase, fields, attempts, outcome, onSubmit, onEdit, onGiveUp, onNext, onShowSummary }) {
  const strings = useStrings()
  const { lang } = useLanguage()
  const idPrefix = useId()
  const [values, setValues] = useState(emptyValues)
  const [nothingToCheck, setNothingToCheck] = useState(false)
  const nextButton = useRef(null)
  const revealed = phase === 'revealed'

  useEffect(() => {
    if (revealed) nextButton.current?.focus({ preventScroll: true })
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

  let status = ''
  if (revealed) status = outcome === 'solved' ? strings.guess.solved : strings.guess.gaveUp
  else if (nothingToCheck) status = strings.guess.nothingToCheck
  else if (attempts > 0) status = strings.guess.result(correctCount, wrongCount)

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

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field {...fieldProps('name')} icon={Building2}>
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

        <Field {...fieldProps('architect')} icon={PencilRuler}>
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

        <Field {...fieldProps('country')} icon={Globe}>
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

        <Field {...fieldProps('era')} icon={Hourglass}>
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

        <div className={styles.actions}>
          {revealed ? (
            <>
              <Button ref={nextButton} icon={ArrowRight} onClick={onNext} className={styles.primary}>
                {strings.guess.next}
              </Button>
              {onShowSummary && (
                <Button variant="quiet" icon={BookOpen} onClick={onShowSummary}>
                  {strings.summary.showSummary}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="submit" icon={Check} className={styles.primary}>
                {strings.guess.submit}
              </Button>
              <Button variant="quiet" onClick={onGiveUp}>
                {strings.guess.giveUp}
              </Button>
            </>
          )}
        </div>
      </form>
    </section>
  )
}
