import { useEffect, useState } from 'react'
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
const CELL_REM = 2.5

// One grid cell is 2.5rem, so the page's rem sizes (and the homepage's storeys, three cells each) stay on the grid at any text scale.
function useCellSize() {
  const read = () => Math.round(parseFloat(getComputedStyle(document.documentElement).fontSize) * CELL_REM) || 40
  const [cell, setCell] = useState(read)
  useEffect(() => {
    // --scale and --fit are set on the root element's style, which is also what changes its font size.
    const watch = new MutationObserver(() => setCell(read()))
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
    return () => watch.disconnect()
  }, [])
  return cell
}

export function PageBackground() {
  const theme = useTheme()
  const cellSize = useCellSize()
  return (
    <div className={styles.background} aria-hidden="true">
      <ShapeGrid
        shape="square"
        cellSize={cellSize}
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
