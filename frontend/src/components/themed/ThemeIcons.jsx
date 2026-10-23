// Line icons for themes lucide has no good picture for, drawn like its set: 24 box, round caps, stroke from the CSS.
function Icon({ children, strokeWidth = 2, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  )
}

/** A lattice tower: tapering legs, cross bracing, a deck and a spire. */
export function TowerIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 2v5" />
      <path d="M10.5 7h3" />
      <path d="M10.5 7 8 21M13.5 7 16 21" />
      <path d="M9 14h6" />
      <path d="M7 21h10" />
      <path d="M9 14l5.5 7M15 14l-5.5 7" />
    </Icon>
  )
}

/** Ancient ruins: one standing column with its capital, one broken off, and stone fallen at its foot. */
export function RuinsIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 21h18" />
      <path d="M3.5 6h7M4.5 6v2M9.5 6v2" />
      <path d="M5.5 8v13M8.5 8v13" />
      <path d="M13.5 21V13l1.5-1.5 1.5 1.5 1-2 1.5 2.5.5-.5V21" />
      <path d="M11 21l1.5-2h2" />
      <path d="M10 21v-1.5l1-1" />
    </Icon>
  )
}
