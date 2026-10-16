import { useSyncExternalStore } from 'react'

// One message at a time, with an optional action ("Undo"). A new one replaces the old.
let current = null
let nextId = 1
const listeners = new Set()
const emit = () => listeners.forEach((notify) => notify())

export const getToast = () => current

/** @param {{ text: string, actionLabel?: string, onAction?: () => void, duration?: number }} toast */
export function showToast(toast) {
  current = { id: nextId++, ...toast }
  emit()
}

export function dismissToast() {
  current = null
  emit()
}

const subscribe = (notify) => {
  listeners.add(notify)
  return () => listeners.delete(notify)
}

export const useToast = () => useSyncExternalStore(subscribe, getToast, () => null)
