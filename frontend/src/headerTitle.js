import { useSyncExternalStore } from 'react'

// The building name the game's header shows in place of the page label while the summary's own title is scrolled away.
let name = null
const listeners = new Set()

export function setHeaderTitle(next) {
  if (next === name) return
  name = next
  listeners.forEach((notify) => notify())
}

const subscribe = (notify) => {
  listeners.add(notify)
  return () => listeners.delete(notify)
}

export const useHeaderTitle = () => useSyncExternalStore(subscribe, () => name, () => null)
