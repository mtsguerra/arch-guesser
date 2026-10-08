import { RotateCcw } from 'lucide-react'
import { strings } from '../../strings.js'
import { Button } from '../ui/Button.jsx'
import { Sheet } from './Sheet.jsx'
import boardStyles from './DrawingBoard.module.css'
import styles from './BoardStatus.module.css'

/** Blank sheet shown before the first building arrives, or when the API fails. */
export function BoardStatus({ status, onRetry }) {
  const loading = status === 'loading'

  return (
    <section className={boardStyles.board} aria-busy={loading}>
      <div className={styles.tabsSpacer} aria-hidden="true" />
      <div className={boardStyles.stage}>
        <Sheet className={boardStyles.page}>
          <div className={styles.body} role={loading ? 'status' : 'alert'}>
            {loading ? (
              <>
                <span className={styles.plotter} aria-hidden="true" />
                <p className={styles.message}>{strings.board.loading}</p>
              </>
            ) : (
              <div className={styles.error}>
                <h2 className={styles.errorTitle}>{strings.board.errorTitle}</h2>
                <p className={styles.message}>{strings.board.errorBody}</p>
                <Button icon={RotateCcw} onClick={onRetry}>{strings.board.retry}</Button>
              </div>
            )}
          </div>
        </Sheet>
      </div>
    </section>
  )
}
