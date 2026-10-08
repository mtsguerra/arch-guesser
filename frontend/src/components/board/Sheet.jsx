import styles from './Sheet.module.css'

const COLUMNS = ['1', '2', '3', '4', '5', '6']
const ROWS = ['A', 'B', 'C', 'D']

/** A drawing sheet: paper, zone references in the margin, border frame, and a title block strip. */
export function Sheet({ titleBlock, children, as: Tag = 'div', className = '', ...props }) {
  return (
    <Tag className={`${styles.sheet} ${className}`} {...props}>
      <div className={styles.zonesTop} aria-hidden="true">
        {COLUMNS.map((c) => <span key={c}>{c}</span>)}
      </div>
      <div className={styles.zonesSide} aria-hidden="true">
        {ROWS.map((r) => <span key={r}>{r}</span>)}
      </div>
      <div className={styles.frame}>
        <div className={styles.content}>{children}</div>
        {titleBlock}
      </div>
    </Tag>
  )
}
