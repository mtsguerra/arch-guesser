import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Shuffle } from 'lucide-react'
import { useEras } from './game/useEras.js'
import { useGameRound } from './game/useGameRound.js'
import { duration, easeOut } from './motion.js'
import { useStrings } from './i18n.js'
import { AppShell } from './components/layout/AppShell.jsx'
import { BoardStatus } from './components/board/BoardStatus.jsx'
import { Round } from './components/layout/Round.jsx'
import { Button } from './components/ui/Button.jsx'
import styles from './App.module.css'

// Sheet swap: the old drawing set is pulled off the mat, the new one is laid down
// as a drafting line wipes across it.
const sheetOut = { opacity: 0, x: -48, rotate: -1.5, filter: 'blur(4px)' }
const roundMotion = {
  initial: { opacity: 0, x: 40, y: 12, rotate: 1, filter: 'blur(4px)', clipPath: 'inset(-24px 100% -24px -24px)' },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    filter: 'blur(0px)',
    clipPath: 'inset(-24px -24px -24px -24px)',
    transition: { duration: duration.slow * 1.4, ease: easeOut },
  },
  exit: { ...sheetOut, transition: { duration: duration.base, ease: easeOut } },
}
const plainMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.base } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
}

export default function App() {
  const strings = useStrings()
  const reduceMotion = useReducedMotion()
  const round = useGameRound()
  const eras = useEras()
  const { phase, building } = round
  const loading = phase === 'loading'

  let content
  if (phase === 'error') {
    content = <BoardStatus key="error" status="error" onRetry={round.loadNext} />
  } else if (!building) {
    content = <BoardStatus key="loading" status="loading" />
  } else {
    content = <Round key={building.id} round={round} eras={eras} />
  }

  return (
    <AppShell
      actions={
        <Button
          variant="cream"
          icon={Shuffle}
          compact
          aria-label={strings.nextBuilding}
          onClick={round.loadNext}
          disabled={loading}
        >
          {strings.nextBuilding}
        </Button>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={content.key}
          className={styles.sheet}
          variants={reduceMotion ? plainMotion : roundMotion}
          initial="initial"
          animate={loading && building ? { opacity: 0.6, y: 0 } : 'animate'}
          exit="exit"
          inert={loading || undefined}
        >
          {content}
          {!reduceMotion && (
            <motion.span
              className={styles.line}
              aria-hidden="true"
              initial={{ left: '0%', opacity: 1 }}
              animate={{ left: '100%', opacity: [1, 1, 0], transition: { duration: duration.slow * 1.4, ease: easeOut } }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}
