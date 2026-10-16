const MARK = '\uE000' // a private-use character no sentence contains

/**
 * Splits a number-in-a-sentence formatter at the number, so the digits can roll while the words
 * stay put: `splitFormat(n => `${n} matches`)` is `['', ' matches']`. Null if the number isn't in it once.
 */
export function splitFormat(format) {
  const parts = format(MARK).split(MARK)
  return parts.length === 2 ? parts : null
}
