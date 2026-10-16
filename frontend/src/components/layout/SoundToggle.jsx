import { useState } from 'react'
import { toggleSound, useSoundOn } from '../../game/sound.js'
import { useStrings } from '../../i18n.js'
import { IconToggle } from './IconToggle.jsx'
import { SpeakerIcon } from './SpeakerIcon.jsx'
import styles from './SoundToggle.module.css'

// The speaker squashes, overshoots and settles.
const POP = [
  { transform: 'scale(1)' },
  { transform: 'scale(0.78)', offset: 0.25 },
  { transform: 'scale(1.14)', offset: 0.6 },
  { transform: 'scale(1)' },
]

/** Turning sound on draws the waves, pops the speaker and sends a ring out from the button. */
export function SoundToggle() {
  const on = useSoundOn()
  const { sound } = useStrings()
  const [rings, setRings] = useState(0)

  const press = (event) => {
    toggleSound()
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    event.currentTarget.querySelector('[data-speaker-body]')?.animate(POP, {
      duration: 440,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    })
    if (!on) setRings((n) => n + 1) // `on` is still the old value: it was off, so it is turning on
  }

  return (
    <IconToggle icon={SpeakerIcon} label={on ? sound.turnOff : sound.turnOn} pressed={on} onClick={press}>
      {rings > 0 && on && <span key={rings} className={styles.ring} aria-hidden="true" />}
    </IconToggle>
  )
}
