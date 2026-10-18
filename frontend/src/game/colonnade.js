export const VIEW_W = 200
const MAX_PITCH = 18 // few columns stand well apart; many close up to fill the width

/** Where the columns of an n-column colonnade stand in a VIEW_W-wide drawing: pitch, column width, first x and total span. */
export function colonnade(n) {
  const pitch = Math.min(MAX_PITCH, (VIEW_W - 8) / n)
  const width = Math.min(6.5, pitch * 0.45)
  const span = (n - 1) * pitch + width
  return { pitch, width, span, start: (VIEW_W - span) / 2 }
}
