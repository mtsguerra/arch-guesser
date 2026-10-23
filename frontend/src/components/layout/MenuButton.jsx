import { LayoutGridIcon } from '../ui/icons.jsx'
import { useStrings } from '../../i18n.js'
import { Button } from '../ui/Button.jsx'
import styles from './AppShell.module.css'

/** Back to the homepage from any mode; `onClick` lets a screen (a custom session) ask first. */
export function MenuButton({ onClick = () => (window.location.hash = '#/') }) {
  const strings = useStrings()
  return (
    <Button variant="rail" icon={LayoutGridIcon} compact className={styles.menuRound} aria-label={strings.menu} onClick={onClick}>
      {strings.menu}
    </Button>
  )
}
