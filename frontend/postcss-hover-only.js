// Wraps every rule that uses :hover in @media (hover: hover), so a tap never leaves a hover state stuck on touch screens.
// A `:is(:hover, :focus-visible)` list keeps its focus half outside the media query.
const stripHover = (s) => s.replace(/:hover\s*,\s*/g, '').replace(/\s*,\s*:hover(?=\s*\))/g, '')

export default function hoverOnly() {
  return {
    postcssPlugin: 'hover-only',
    Rule(rule, { AtRule }) {
      if (rule.parent?.type === 'atrule' && /hover:\s*hover/.test(rule.parent.params)) return
      const hovered = rule.selectors.filter((s) => s.includes(':hover'))
      if (!hovered.length) return
      const plain = rule.selectors.filter((s) => !s.includes(':hover'))
      const focusOnly = hovered.map(stripHover).filter((s) => !s.includes(':hover') && !hovered.includes(s))
      const media = new AtRule({ name: 'media', params: '(hover: hover)' })
      media.append(rule.clone({ selectors: hovered }))
      rule.after(media)
      const kept = [...plain, ...focusOnly]
      if (kept.length) rule.selectors = kept
      else rule.remove()
    },
  }
}
hoverOnly.postcss = true
