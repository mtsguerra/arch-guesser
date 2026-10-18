import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { MapIcon } from '../ui/icons.jsx'
import { duration, easeOut } from '../../motion.js'
import { useStrings } from '../../i18n.js'
import { DrawingBoard } from '../board/DrawingBoard.jsx'
import { GuessForm } from '../guess/GuessForm.jsx'
import { GuessLog } from '../guess/GuessLog.jsx'
import { HintTray } from '../hints/HintTray.jsx'
import { BuildingSummary } from '../summary/BuildingSummary.jsx'
import { RevealBuild } from '../reveal/RevealBuild.jsx'
import { Button } from '../ui/Button.jsx'
import styles from './Round.module.css'

const layoutTransition = { duration: duration.slow * 1.2, ease: easeOut }
const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.base, ease: easeOut, delay: duration.fast } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
}

/**
 * One round. While playing: board | guess sheet + hints. Once revealed, the
 * board steps back into a reference column beside the summary; the player can
 * swap back to the full drawings at any time. Remount per building.
 */
export function Round({ round, eras, view, onViewChange, daily = false }) {
  const strings = useStrings()
  const { building, phase } = round
  const revealed = phase === 'revealed'
  const [built, setBuilt] = useState(false)
  const reduceMotion = useReducedMotion()
  const summary = revealed && view === 'summary'

  return (
    <LayoutGroup>
      {/* Portalled to the body: the round sits inside a transformed wrapper, which would pin a fixed overlay to it. */}
      {createPortal(
        <AnimatePresence>
          {revealed && !built && !reduceMotion && (
            <RevealBuild key="build" building={building} onDone={() => setBuilt(true)} />
          )}
        </AnimatePresence>,
        document.body,
      )}
      <div className={summary ? styles.summaryLayout : styles.playLayout}>
        <motion.div layout="position" transition={layoutTransition} className={styles.boardSlot}>
          <motion.div layout transition={layoutTransition}>
            <DrawingBoard building={building} revealed={revealed} fields={round.fields} />
          </motion.div>
          {summary ? (
            <motion.div {...fade} className={styles.boardAction}>
              <Button variant="ghost" icon={MapIcon} onClick={() => onViewChange('board')}>
                {strings.summary.showDrawings}
              </Button>
            </motion.div>
          ) : (
            <motion.div {...fade} className={styles.hints}>
              <HintTray
                hints={building.hints}
                hintLevel={round.hintLevel}
                canReveal={phase === 'playing'}
                onReveal={round.revealHint}
              />
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence mode="popLayout" initial={false}>
          {summary ? (
            <motion.div key="summary" exit={fade.exit}>
              <BuildingSummary
                building={building}
                eras={eras}
                fields={round.fields}
                outcome={round.outcome}
                daily={daily ? { fields: round.fields, hintsUsed: round.hintsUsed } : null}
              />
            </motion.div>
          ) : (
            <motion.aside key="aside" className={styles.aside} {...fade}>
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
              />
              <GuessLog log={round.log} eras={eras} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  )
}
