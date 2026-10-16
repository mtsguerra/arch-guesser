import { useSyncExternalStore } from 'react'

const ROUTES = { '#/play': 'play', '#/daily': 'daily', '#/custom': 'custom', '#/custom/play': 'customPlay' }

/** The hash picks the screen; anything unknown is the homepage. */
export const routeFrom = (hash) => ROUTES[hash] ?? 'home'

const subscribe = (notify) => {
  window.addEventListener('hashchange', notify)
  return () => window.removeEventListener('hashchange', notify)
}

export const useRoute = () =>
  useSyncExternalStore(subscribe, () => routeFrom(window.location.hash), () => 'home')
