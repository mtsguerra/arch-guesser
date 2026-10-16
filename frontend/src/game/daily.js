import { fetchBuildingIds } from '../api/buildings.js'
import { GUESS_FIELDS } from './matchGuess.js'

// Daily #1 is the launch day. A day is the player's local calendar day.
const EPOCH = Date.UTC(2026, 9, 16)
const DAY = 86_400_000
const KEY = 'arch-guesser:daily'

const dayStart = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
export const dailyNumber = (date = new Date()) => Math.max(1, Math.round((dayStart(date) - EPOCH) / DAY) + 1)

const hash = (text) => {
  let h = 2166136261
  for (const char of text) h = Math.imul(h ^ char.codePointAt(0), 16777619)
  return h >>> 0
}

/**
 * The same building for everyone on a given day: ids in a fixed pseudo-random order, one per day,
 * repeating after a full cycle. shortcut: adding a building to the catalogue shifts later days, so
 * freeze the order (or curate a calendar) once the daily has a following.
 */
export function dailyId(ids, number) {
  const order = [...ids].sort((a, b) => hash(a) - hash(b) || (a < b ? -1 : 1))
  return order[(number - 1) % order.length]
}

export const msUntilNextDay = (now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now

/** "05:42" (hours:minutes, rounded up). */
export function formatCountdown(ms) {
  const minutes = Math.ceil(ms / 60_000)
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

// localStorage can throw (private modes, blocked storage); the daily then just isn't remembered.
export function readDaily(number) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return saved?.number === number ? saved : null
  } catch {
    return null
  }
}

export function saveDaily(result) {
  try {
    localStorage.setItem(KEY, JSON.stringify(result))
  } catch {
    // Ignore: the daily can be replayed.
  }
}

/** Today's daily id while it is still unfinished (Normal play skips it), else null. */
export async function dailyHold() {
  try {
    const number = dailyNumber()
    return readDaily(number) ? null : dailyId(await fetchBuildingIds(), number)
  } catch {
    return null
  }
}

const ICONS = { name: '🏛️', architect: '👤', country: '🌍', era: '⏳' }

/** The copyable result: never names the building. */
export function shareText({ number, fields, hintsUsed, title, url }) {
  const row = GUESS_FIELDS.map((f) => `${ICONS[f]}${fields[f] === 'correct' ? '✅' : '❌'}`).join(' ')
  return `${title} #${number}\n${row}${hintsUsed ? ` · 💡${hintsUsed}` : ''}\n${url}`
}
