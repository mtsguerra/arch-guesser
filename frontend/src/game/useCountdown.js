import { useEffect, useState } from 'react'
import { formatCountdown, msUntilNextDay } from './daily.js'

/** "hh:mm" until the next daily, refreshed every 30 s. */
export function useCountdown() {
  const [ms, setMs] = useState(msUntilNextDay)
  useEffect(() => {
    const timer = setInterval(() => setMs(msUntilNextDay()), 30_000)
    return () => clearInterval(timer)
  }, [])
  return formatCountdown(ms)
}
