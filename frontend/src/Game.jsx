import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown, LayoutGrid, Shuffle } from 'lucide-react'
import { dailyNumber } from './game/daily.js'
import { clearSession, readSession, restoreSession } from './game/custom.js'
import { showToast } from './components/ui/toast.js'
import { useEras } from './game/useEras.js'
import { usePullToNext } from './game/usePullToNext.js'
import { useGameRound } from './game/useGameRound.js'
import { duration, easeOut, springSoft } from './motion.js'
import { useStrings } from './i18n.js'
import { AppShell } from './components/layout/AppShell.jsx'
import { BoardStatus } from './components/board/BoardStatus.jsx'
import { DailyDone } from './components/daily/DailyDone.jsx'
import { Recap } from './components/custom/Recap.jsx'
import { MenuButton } from './components/layout/MenuButton.jsx'
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
    // Position springs (it can be redirected mid-flight); the wipe and blur are timed.
    transition: {
      x: springSoft,
      y: springSoft,
      rotate: springSoft,
      opacity: { duration: duration.base, ease: easeOut },
      filter: { duration: duration.slow, ease: easeOut },
      clipPath: { duration: duration.slow * 1.4, ease: easeOut },
    },
  },
  exit: { ...sheetOut, transition: { x: springSoft, rotate: springSoft, opacity: { duration: duration.base, ease: easeOut }, filter: { duration: duration.base } } },
}
const plainMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.base } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
}

/** @param {'normal' | 'daily' | 'custom'} mode */
export default function Game({ mode = 'normal' }) {
  const strings = useStrings()
  const reduceMotion = useReducedMotion()
  const daily = mode === 'daily'
  const round = useGameRound(mode)
  const eras = useEras()
  const { phase, building } = round
  const loading = phase === 'loading'
  // After a reveal, pulling the page down moves to the next building (Normal and Custom, on touch).
  const pullIndicator = usePullToNext(phase === 'revealed' && !daily, round.loadNext)

  // Leaving a custom session ends it at once; for a few seconds Undo puts it back where it was
  // (the building you were on, though not the guesses you had typed for it).
  const leave = () => {
    const session = mode === 'custom' && phase !== 'done' ? readSession() : null
    if (session) {
      clearSession()
      showToast({
        text: strings.custom.ended,
        actionLabel: strings.custom.undo,
        onAction: () => {
          restoreSession(session)
          window.location.hash = '#/custom/play'
        },
      })
    }
    window.location.hash = '#/'
  }

  let content
  if (phase === 'error') {
    content = <BoardStatus key="error" status="error" onRetry={round.reload} />
  } else if (phase === 'done') {
    content = <Recap key="recap" onAgain={round.reload} />
  } else if (!building) {
    content = <BoardStatus key="loading" status="loading" />
  } else {
    content = (
      <div key={building.id}>
        <Round
          round={round}
          eras={eras}
          onNext={daily ? () => (window.location.hash = '#/play') : round.loadNext}
          nextLabel={daily ? strings.daily.playGuesser : undefined}
        />
        {daily && phase === 'revealed' && <DailyDone fields={round.fields} hintsUsed={round.hintsUsed} />}
      </div>
    )
  }

  return (
    <AppShell
      place={daily ? strings.daily.title(dailyNumber()) : mode === 'custom' ? strings.places.custom : strings.places.normal}
      actions={
        <span className={styles.desktopOnly}>
          <MenuButton onClick={leave} />
          {!daily && phase !== 'done' && (
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
          )}
        </span>
      }
    >
      {/* On phones the same controls sit in a bar within thumb reach. */}
      <div className={styles.bar}>
        <Button variant="ghost" icon={LayoutGrid} onClick={leave}>
          {strings.menu}
        </Button>
        {!daily && phase !== 'done' && (
          <Button icon={Shuffle} onClick={round.loadNext} disabled={loading}>
            {strings.nextBuilding}
          </Button>
        )}
      </div>
      <div className={styles.barSpacer} aria-hidden="true" />
      <div ref={pullIndicator} className={styles.pull} aria-hidden="true">
        <ChevronDown strokeWidth={2} />
        <span className={styles.pullHint}>{strings.pull.hint}</span>
        <span className={styles.pullRelease}>{strings.pull.release}</span>
      </div>
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
