import { dismissNote, setReduced, useMotionNote } from '../../motionPref.js'
import { useStrings } from '../../i18n.js'
import { Button } from '../ui/Button.jsx'
import styles from './MotionNote.module.css'

/** Said once, the first time reduced motion is on: what it does and that the drawings still play. */
export function MotionNote() {
  const show = useMotionNote()
  const { motion } = useStrings()
  if (!show) return null
  return (
    <aside className={styles.note} role="status">
      <h2 className={styles.title}>{motion.noteTitle}</h2>
      <p>{motion.noteText}</p>
      <div className={styles.actions}>
        <Button onClick={dismissNote}>
          {motion.noteKeep}
        </Button>
        <Button variant="ghost" onClick={() => { setReduced(false); dismissNote() }}>
          {motion.noteFull}
        </Button>
      </div>
    </aside>
  )
}
