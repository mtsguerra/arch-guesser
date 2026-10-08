import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import { ArrowRight, Check, ChevronDown, Eye, X } from 'lucide-react'
import { GUESS_FIELDS } from '../../game/matchGuess.js'
import { eraRange } from '../../game/useEras.js'
import { duration, easeOut } from '../../motion.js'
import { strings } from '../../strings.js'
import { Button } from '../ui/Button.jsx'
import { CountryCombobox } from './CountryCombobox.jsx'
import styles from './GuessForm.module.css'

const emptyValues = Object.fromEntries(GUESS_FIELDS.map((f) => [f, '']))
const shake = { x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.4, ease: 'easeOut' } }

function answerFor(field, building, eras) {
  switch (field) {
    case 'name':
      return building.name
    case 'architect':
      return building.architects.map((a) => a.name).join(' & ')
    case 'country':
      return building.location.country
    case 'era':
      return eras?.find((e) => e.id === building.era)?.label ?? building.era
  }
}

function Field({ id, field, status, attempts, revealedAnswer, children }) {
  const controls = useAnimationControls()
  const messageId = `${id}-message`

  useEffect(() => {
    if (status === 'wrong') controls.start(shake)
  }, [status, attempts, controls])

  const locked = status === 'correct'
  const revealed = revealedAnswer != null

  return (
    <motion.div className={styles.field} data-status={revealed ? (locked ? 'correct' : 'revealed') : status} animate={controls}>
      <label className={styles.label} htmlFor={id}>
        {strings.guess.fields[field]}
      </label>

      {revealed ? (
        <output id={id} className={styles.answer} aria-describedby={messageId}>
          {revealedAnswer}
        </output>
      ) : (
        children({ id, 'aria-describedby': messageId, 'aria-invalid': status === 'wrong' || undefined, readOnly: locked })
      )}

      <span className={styles.badge} aria-hidden="true">
        {locked && <Check strokeWidth={2.5} />}
        {revealed && !locked && <Eye strokeWidth={2} />}
      </span>

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
export function GuessForm({ building, eras, phase, fields, attempts, outcome, onSubmit, onEdit, onGiveUp, onNext }) {
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
    revealedAnswer: revealed ? answerFor(field, building, eras) : null,
  })

  return (
    <section className={styles.sheet} aria-labelledby={`${idPrefix}-heading`}>
      <h2 id={`${idPrefix}-heading`} className={styles.heading}>
        {strings.guess.heading}
      </h2>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field {...fieldProps('name')}>
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

        <Field {...fieldProps('architect')}>
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

        <Field {...fieldProps('country')}>
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

        <Field {...fieldProps('era')}>
          {({ readOnly, ...props }) => (
            <div className={styles.selectWrap}>
              <select
                {...props}
                className={`${styles.input} ${styles.select}`}
                value={values.era}
                disabled={readOnly || !eras?.length}
                onChange={(e) => update('era', e.target.value)}
              >
                <option value="">{eras?.length === 0 ? strings.guess.erasUnavailable : strings.guess.placeholders.era}</option>
                {eras?.map((era) => (
                  <option key={era.id} value={era.id}>
                    {era.label} · {eraRange(era)}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.chevron} aria-hidden="true" strokeWidth={1.75} />
            </div>
          )}
        </Field>

        <p className={styles.status} role="status">
          {status}
        </p>

        <div className={styles.actions}>
          {revealed ? (
            <Button ref={nextButton} icon={ArrowRight} onClick={onNext} className={styles.primary}>
              {strings.guess.next}
            </Button>
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
