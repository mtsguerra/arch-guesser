import { RotateCcw } from 'lucide-react'
import { useStrings } from '../../i18n.js'
import { Button } from '../ui/Button.jsx'
import { PlotLoader } from '../ui/PlotLoader.jsx'
import boardStyles from './DrawingBoard.module.css'
import styles from './BoardStatus.module.css'

/**
 * An empty stage, shown before the first building arrives or when the API fails.
 */
export function BoardStatus({ status, onRetry }) {
  const strings = useStrings()
  const loading = status === 'loading'

  return (
    <section className={styles.status} aria-busy={loading}>
      <div className={boardStyles.stage}>
        <div className={styles.body} role={loading ? undefined : 'alert'}>
          {loading ? (
            <PlotLoader label={strings.board.loading} />
          ) : (
            <div className={styles.error}>
              <h2 className={styles.errorTitle}>{strings.board.errorTitle}</h2>
              <p className={styles.message}>{strings.board.errorBody}</p>
              <Button icon={RotateCcw} onClick={onRetry}>{strings.board.retry}</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
