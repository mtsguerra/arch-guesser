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

/** "Modernism · 1920–1970", "Classical Antiquity · 800 BCE–476", "Contemporary · 1990–now". */
export function eraRange({ startYear, endYear }) {
  const year = (y) => (y < 0 ? `${-y} BCE` : String(y))
  return `${year(startYear)}–${endYear == null ? 'now' : year(endYear)}`
}
