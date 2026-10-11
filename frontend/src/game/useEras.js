import { useEffect, useState } from 'react'
import { fetchEras } from '../api/buildings.js'

/** The era list for the picker. Loaded once; `null` until it arrives, `[]` if it failed. */
export function useEras() {
  const [eras, setEras] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchEras(controller.signal)
      .then(setEras)
      .catch((error) => error.name !== 'AbortError' && setEras([]))
    return () => controller.abort()
  }, [])

  return eras
}

const ENGLISH_YEARS = { bce: 'BCE', now: 'now' }

/** 1920 → "1920"; -415 → "415 BCE" ("415 a.C." in Portuguese). */
export function formatYear(y, years = ENGLISH_YEARS) {
  return y < 0 ? `${-y} ${years.bce}` : String(y)
}

/** "1920–1970", "800 BCE–476", "1990–now". */
export function eraRange({ startYear, endYear }, years = ENGLISH_YEARS) {
  return `${formatYear(startYear, years)}–${endYear == null ? years.now : formatYear(endYear, years)}`
}

/** The era's name in the current language; falls back to the API's English label. */
export function eraName(era, strings) {
  return strings.eras?.[era.id] ?? era.label
}
