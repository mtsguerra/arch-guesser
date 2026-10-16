import { Volume2, VolumeX } from 'lucide-react'
import { toggleSound, useSoundOn } from '../../game/sound.js'
import { useStrings } from '../../i18n.js'
import { IconToggle } from './IconToggle.jsx'

export function SoundToggle() {
  const on = useSoundOn()
  const { sound } = useStrings()
  return <IconToggle icon={on ? Volume2 : VolumeX} label={on ? sound.turnOff : sound.turnOn} pressed={on} onClick={toggleSound} />
}
