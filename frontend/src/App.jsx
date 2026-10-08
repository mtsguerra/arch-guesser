import { AnimatePresence, motion } from 'motion/react'
import { Shuffle } from 'lucide-react'
import { useEras } from './game/useEras.js'
import { useGameRound } from './game/useGameRound.js'
import { duration, easeOut } from './motion.js'
import { strings } from './strings.js'
import { AppShell } from './components/layout/AppShell.jsx'
import { BoardStatus } from './components/board/BoardStatus.jsx'
import { Round } from './components/layout/Round.jsx'
import { Button } from './components/ui/Button.jsx'

// A new drawing set is laid on the table; the old one is lifted away.
const roundMotion = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easeOut } },
  exit: { opacity: 0, y: -16, transition: { duration: duration.base, ease: easeOut } },
}

export default function App() {
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
        <Button variant="rail" icon={Shuffle} onClick={round.loadNext} disabled={loading}>
          {strings.nextBuilding}
        </Button>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={content.key}
          variants={roundMotion}
          initial="initial"
          animate={loading && building ? { opacity: 0.6, y: 0 } : 'animate'}
          exit="exit"
          inert={loading || undefined}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}
