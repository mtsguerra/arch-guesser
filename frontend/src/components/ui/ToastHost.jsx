import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { springSoft } from '../../motion.js'
import { dismissToast, useToast } from './toast.js'
import styles from './ToastHost.module.css'

const SHOWN_MS = 7000

/** Shows the current toast at the bottom of the screen until it is dismissed or times out. */
export function ToastHost() {
  const toast = useToast()
  const id = toast?.id
  const duration = toast?.duration ?? SHOWN_MS

  useEffect(() => {
    if (id === undefined) return
    const timer = setTimeout(dismissToast, duration)
    return () => clearTimeout(timer)
  }, [id, duration])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className={styles.toast}
          role="status"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={springSoft}
        >
          <span>{toast.text}</span>
          {toast.onAction && (
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                dismissToast()
                toast.onAction()
              }}
            >
              {toast.actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
