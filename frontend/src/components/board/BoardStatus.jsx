import { RotateCcw } from 'lucide-react'
import { strings } from '../../strings.js'
import { Button } from '../ui/Button.jsx'
import { Sheet } from './Sheet.jsx'
import { TitleBlock } from './TitleBlock.jsx'
import boardStyles from './DrawingBoard.module.css'
import tabStyles from './SheetTabs.module.css'
import styles from './BoardStatus.module.css'

const { unknown } = strings.titleBlock
const blankTitle = [
  { key: 'project', label: strings.titleBlock.project, value: unknown, muted: true, wide: true },
  { key: 'architect', label: strings.titleBlock.architect, value: unknown, muted: true },
  { key: 'drawing', label: strings.titleBlock.drawing, value: unknown, muted: true },
  { key: 'sheet', label: strings.titleBlock.sheet, value: unknown, muted: true },
]

/**
 * An empty drawing set (one blank tab, blank title block), shown before the
 * first building arrives or when the API fails.
 */
export function BoardStatus({ status, onRetry }) {
  const loading = status === 'loading'

  return (
    <section className={boardStyles.board} aria-busy={loading}>
      <div className={tabStyles.tabs} aria-hidden="true">
        <span className={`${tabStyles.tab} ${tabStyles.selected}`}>
          <span className={tabStyles.paper} />
          <span className={tabStyles.number}>A-···</span>
        </span>
      </div>
      <div className={boardStyles.stage}>
        <Sheet className={boardStyles.page} titleBlock={<TitleBlock fields={blankTitle} />}>
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
