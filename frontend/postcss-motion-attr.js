// Turns every `@media (prefers-reduced-motion: reduce)` block into rules under html[data-motion='reduced'],
// so the system setting (copied to that attribute by public/prepaint.js) and the in-app toggle drive the same CSS.
export default function motionAttr() {
  return {
    postcssPlugin: 'motion-attr',
    AtRule: {
      media(atRule) {
        if (!/^\(prefers-reduced-motion:\s*reduce\)$/.test(atRule.params.trim())) return
        atRule.walkRules((rule) => {
          rule.selectors = rule.selectors.map((s) => `html[data-motion='reduced'] ${s}`)
        })
        atRule.replaceWith(atRule.nodes)
      },
    },
  }
}
motionAttr.postcss = true
