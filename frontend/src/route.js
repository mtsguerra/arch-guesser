import { useSyncExternalStore } from 'react'
import { withTransition } from './viewTransition.js'

const ROUTES = { '#/play': 'play', '#/daily': 'daily', '#/custom': 'custom', '#/custom/play': 'customPlay', '#/themed': 'themed', '#/themed/play': 'themedPlay', '#/library': 'library' }

const LIBRARY_BUILDING = /^#\/library\/([a-z0-9-]+)$/

/** The building id in `#/library/<id>`, or null for any other hash. */
export const libraryIdFrom = (hash) => LIBRARY_BUILDING.exec(hash)?.[1] ?? null

/** The hash picks the screen; anything unknown is the homepage. */
export const routeFrom = (hash) => ROUTES[hash] ?? (libraryIdFrom(hash) ? 'libraryBuilding' : 'home')

const subscribe = (notify) => {
  const onChange = () => withTransition(notify)
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export const useRoute = () =>
  useSyncExternalStore(subscribe, () => routeFrom(window.location.hash), () => 'home')
