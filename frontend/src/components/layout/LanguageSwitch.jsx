import { useId } from 'react'
import { motion } from 'motion/react'
import { springSoft } from '../../motion.js'
import { useLanguage } from '../../i18n.js'
import styles from './LanguageSwitch.module.css'

// Each language names itself, so the labels don't come from the string tables.
const LANGUAGES = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'pt-BR', short: 'PT', name: 'Português (Brasil)' },
]

/** A segmented pill: the lit segment slides to the chosen language. */
export function LanguageSwitch() {
  const { lang, setLang, strings } = useLanguage()
  const id = useId()

  return (
    <div className={styles.switch} role="group" aria-label={strings.language.label}>
      {LANGUAGES.map(({ code, short, name }) => {
        const on = lang === code
        return (
          <button
            key={code}
            type="button"
            className={`${styles.option} ${on ? styles.on : ''}`}
            lang={code}
            aria-pressed={on}
            aria-label={name}
            data-sound="toggle"
            onClick={() => setLang(code)}
          >
            {on && <motion.span layoutId={`${id}-lit`} className={styles.lit} transition={springSoft} />}
            <span className={styles.short}>{short}</span>
          </button>
        )
      })}
    </div>
  )
}
