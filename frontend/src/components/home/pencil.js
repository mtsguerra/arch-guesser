import { shuffle } from '../../game/custom.js'
import { BY_ERA, silhouettes } from '../reveal/silhouettes.js'
import { isReduced } from '../../motionPref.js'

/** True for people who asked for less motion (phones get the pencil too). */
export function skipsPencil() {
  return isReduced()
}

// The era drawings of the reveal, without their dimension lines (a dash pattern can't also be a drawing animation).
export const DRAWINGS = Object.values(silhouettes).map((s) => s.strokes.filter((stroke) => stroke.tone !== 'dimension'))
// The era each drawing stands for, to caption it (the civic front is the classical fallback).
export const DRAWING_ERAS = Object.values(silhouettes).map((s) => Object.keys(BY_ERA).find((era) => BY_ERA[era] === s) ?? 'CLASSICAL')
export const length = (strokes) => Math.max(...strokes.map((s) => s.delay + s.duration))

/** A new random order that doesn't open with the drawing that just closed the last one. */
export function order(last) {
  const next = shuffle(DRAWINGS.map((_, i) => i))
  if (next[0] === last) next.push(next.shift())
  return next
}

