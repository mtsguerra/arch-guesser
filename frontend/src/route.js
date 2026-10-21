import { useSyncExternalStore } from 'react'
import { withTransition } from './viewTransition.js'

const ROUTES = { '#/play': 'play', '#/daily': 'daily', '#/custom': 'custom', '#/custom/play': 'customPlay', '#/themed': 'themed', '#/themed/play': 'themedPlay' }

/** The hash picks the screen; anything unknown is the homepage. */
export const routeFrom = (hash) => ROUTES[hash] ?? 'home'

const subscribe = (notify) => {
  const onChange = () => withTransition(notify)
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export const useRoute = () =>
  useSyncExternalStore(subscribe, () => routeFrom(window.location.hash), () => 'home')
