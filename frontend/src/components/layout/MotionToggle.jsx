import { setReduced, useReducedMotion } from '../../motionPref.js'
import { useStrings } from '../../i18n.js'
import { IconToggle } from './IconToggle.jsx'
import { MotionOffIcon, MotionOnIcon } from './MotionIcon.jsx'

/** Pressed = reduced motion is on (the system setting sets the first value; this is the app's own say). */
export function MotionToggle() {
  const reduced = useReducedMotion()
  const { motion } = useStrings()
  return <IconToggle icon={reduced ? MotionOffIcon : MotionOnIcon} label={reduced ? motion.restore : motion.reduce} pressed={reduced} onClick={() => setReduced(!reduced)} />
}
