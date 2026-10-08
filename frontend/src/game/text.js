/** Lower-case, strip accents and punctuation, collapse spaces: "Sant'Ivo  alla Sapienza" → "sant ivo alla sapienza". */
export function normalize(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
    .replace(/^the /, '')
}

/** Edit distance where swapping two adjacent letters ("Frnace") costs one edit, like any other typo. */
export function editDistance(a, b) {
  if (a === b) return 0
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[a.length][b.length]
}

/** Typos allowed for a target of this length: none for short words, up to 3 for long names. */
export function typoAllowance(length) {
  if (length <= 4) return 0
  if (length <= 8) return 1
  if (length <= 14) return 2
  return 3
}

export function isCloseTo(guess, target) {
  return editDistance(guess, target) <= typoAllowance(target.length)
}
