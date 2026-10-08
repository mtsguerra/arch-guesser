import { useId, useMemo, useState } from 'react'
import { suggestCountries } from '../../game/countries.js'
import { strings } from '../../strings.js'
import styles from './GuessForm.module.css'

/**
 * Free-text country input with suggestions (WAI-ARIA combobox, list autocomplete).
 * Any text is accepted; matching to a country happens when the guess is checked.
 */
export function CountryCombobox({ id, value, onChange, className, ...inputProps }) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const options = useMemo(() => (open ? suggestCountries(value) : []), [open, value])
  const expanded = open && options.length > 0

  function choose(country) {
    onChange(country.name)
    setOpen(false)
    setActive(-1)
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!expanded) return setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (i + step + options.length) % options.length)
    } else if (event.key === 'Enter' && expanded && active >= 0) {
      event.preventDefault() // pick the suggestion instead of submitting the form
      choose(options[active])
    } else if (event.key === 'Escape' && expanded) {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div className={styles.combo}>
      <input
        {...inputProps}
        id={id}
        className={className}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setOpen(false)}
      />
      <ul id={listId} role="listbox" aria-label={strings.guess.countrySuggestions} className={styles.listbox} hidden={!expanded}>
        {options.map((country, i) => (
          <li
            key={country.code}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            className={styles.option}
            // mousedown, not click: fires before the input's blur closes the list
            onMouseDown={(e) => {
              e.preventDefault()
              choose(country)
            }}
            onMouseEnter={() => setActive(i)}
          >
            {country.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
