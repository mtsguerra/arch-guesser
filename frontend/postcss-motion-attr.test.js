import postcss from 'postcss'
import { expect, test } from 'vitest'
import motionAttr from './postcss-motion-attr.js'

const run = (css) => postcss([motionAttr()]).process(css, { from: undefined }).css.replace(/\s+/g, ' ').trim()

test('moves reduced-motion rules under the attribute, for every selector in a list', () => {
  expect(run('@media (prefers-reduced-motion: reduce) { .a, .b { animation: none } }')).toBe(
    "html[data-motion='reduced'] .a, html[data-motion='reduced'] .b { animation: none }",
  )
})

test('leaves other media queries alone', () => {
  expect(run('@media (hover: hover) { .a { x: 1 } }')).toBe('@media (hover: hover) { .a { x: 1 } }')
})
