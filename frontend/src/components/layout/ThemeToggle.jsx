import { setTheme, useTheme } from '../../theme.js'
import { useStrings } from '../../i18n.js'
import { IconToggle } from './IconToggle.jsx'
import { SunMoonIcon } from './SunMoonIcon.jsx'

/** The icon shows the current theme; pressing it switches, with the new theme spreading from the button. */
export function ThemeToggle() {
  const dark = useTheme() === 'dark'
  const { theme } = useStrings()
  return (
    <IconToggle
      icon={SunMoonIcon}
      label={dark ? theme.toLight : theme.toDark}
      onClick={(event) => setTheme(dark ? 'light' : 'dark', event.currentTarget)}
    />
  )
}
