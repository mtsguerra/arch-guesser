import { eraName } from './useEras.js'

/** A logged guess as the player sees it: eras by name, century and decade with their unit. */
export function guessText(field, text, { eras, strings }) {
  if (field === 'era') {
    const era = eras?.find((e) => e.id === text)
    return era ? eraName(era, strings) : text
  }
  if (field === 'century') return strings.themed.century(Number(text))
  if (field === 'decade') return strings.themed.decade(Number(text))
  return text
}
