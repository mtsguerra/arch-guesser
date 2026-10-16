import ShapeGrid from '../ui/ShapeGrid.jsx'
import { useTheme } from '../../theme.js'
import styles from './PageBackground.module.css'

// The canvas can't read CSS variables, so the brief-pinned palette is mirrored here
// (see styles/tokens.css): camel lines on the cream mat, russet outlines and an oxblood wash under the cursor.
const GRID = {
  light: { lineColor: 'rgb(187 148 87 / 0.42)', hoverColor: '#99582a', hoverFillColor: '#6f1d1b' },
  dark: { lineColor: 'rgb(187 148 87 / 0.22)', hoverColor: '#e2a46a', hoverFillColor: '#e2a46a' },
}

/**
 * The drafting mat: a fixed grid behind the whole app. It sits under the sheets, so it
 * only shows in the margins, and lights up cell by cell under the cursor.
 */
export function PageBackground() {
  const theme = useTheme()
  return (
    <div className={styles.background} aria-hidden="true">
      <ShapeGrid
        shape="square"
        cellSize={40}
        direction="none"
        fade={0}
        radius={1.8}
        trail={1.1}
        glow={0}
        fillOpacity={0.07}
        clickCascade={false}
        {...GRID[theme]}
      />
    </div>
  )
}
