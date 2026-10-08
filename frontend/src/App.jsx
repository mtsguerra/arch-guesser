import { AnimatePresence, motion } from 'motion/react'
import { Shuffle } from 'lucide-react'
import { useEras } from './game/useEras.js'
import { useGameRound } from './game/useGameRound.js'
import { duration, easeOut } from './motion.js'
import { strings } from './strings.js'
import { AppShell } from './components/layout/AppShell.jsx'
import { BoardStatus } from './components/board/BoardStatus.jsx'
import { DrawingBoard } from './components/board/DrawingBoard.jsx'
import { GuessForm } from './components/guess/GuessForm.jsx'
import { HintTray } from './components/hints/HintTray.jsx'
import { Button } from './components/ui/Button.jsx'
import styles from './App.module.css'

// A new drawing set is laid on the table; the old one is lifted away.
const roundMotion = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easeOut } },
  exit: { opacity: 0, y: -16, transition: { duration: duration.base, ease: easeOut } },
}

function Round({ round, eras }) {
  const { building, phase } = round
  return (
    <div className={styles.workspace}>
      <DrawingBoard building={building} revealed={phase === 'revealed'} />
      <aside className={styles.aside}>
        <GuessForm
          building={building}
          eras={eras}
          phase={phase}
          fields={round.fields}
          attempts={round.attempts}
          outcome={round.outcome}
          onSubmit={round.submitGuess}
          onEdit={round.editField}
          onGiveUp={round.revealAnswer}
          onNext={round.loadNext}
        />
        <HintTray
          hints={building.hints}
          hintLevel={round.hintLevel}
          canReveal={phase === 'playing'}
          onReveal={round.revealHint}
        />
      </aside>
    </div>
  )
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
