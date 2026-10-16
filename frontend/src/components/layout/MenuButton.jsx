import { LayoutGrid } from 'lucide-react'
import { useStrings } from '../../i18n.js'
import { Button } from '../ui/Button.jsx'

/** Back to the homepage from any mode; `onClick` lets a screen (a custom session) ask first. */
export function MenuButton({ onClick = () => (window.location.hash = '#/') }) {
  const strings = useStrings()
  return (
    <Button variant="rail" icon={LayoutGrid} compact aria-label={strings.menu} onClick={onClick}>
      {strings.menu}
    </Button>
  )
}
