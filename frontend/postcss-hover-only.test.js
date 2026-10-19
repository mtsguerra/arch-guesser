import postcss from 'postcss'
import { expect, test } from 'vitest'
import hoverOnly from './postcss-hover-only.js'

const run = (css) => postcss([hoverOnly()]).process(css, { from: undefined }).css.replace(/\s+/g, ' ').replace(/\s*([{}])\s*/g, ' $1 ').replace(/\s+/g, ' ').trim()

test('wraps a hover rule', () => {
  expect(run('.a:hover { color: red }')).toBe('@media (hover: hover) { .a:hover { color: red } }')
})

test('keeps the focus half of an :is(:hover, :focus-visible) list outside the query', () => {
  const out = run(':is(button):is(:hover, :focus-visible) { --on: 1 }')
  expect(out).toContain(':is(button):is(:focus-visible) { --on: 1 }')
  expect(out).toContain('@media (hover: hover) { :is(button):is(:hover, :focus-visible) { --on: 1 } }')
})

test('keeps non-hover selectors of a list and is idempotent', () => {
  const once = run('.a:hover, .a:focus-visible { x: 1 }')
  expect(once).toBe('.a:focus-visible { x: 1 } @media (hover: hover) { .a:hover { x: 1 } }')
  expect(run(once)).toBe(once)
})
