import { GUESS_FIELDS } from './matchGuess.js'

/**
 * Round state machine.
 *
 *   loading ─▶ playing ─▶ revealed ─▶ loading …
 *      └─▶ error ─(retry)─▶ loading
 *
 * A custom session that runs out of buildings ends in `done`.
 *
 * During `loading`, the previous building stays in state so the board can
 * hand over to the next one with an exit animation instead of a blank flash.
 *
 * `fields` holds each guess field's status: 'idle' | 'wrong' | 'close' | 'correct'.
 * Correct fields lock. `outcome` is 'solved' or 'gaveUp' once revealed.
 */
const idleFields = Object.fromEntries(GUESS_FIELDS.map((f) => [f, 'idle']))

export const initialState = {
  phase: 'loading',
  building: null,
  hintLevel: 0,
  fields: idleFields,
  attempts: 0,
  log: [], // wrong guesses so far: [{ field, text }], newest last
  hintsUsed: 0,
  outcome: null,
  error: null,
}

function reveal(state, outcome) {
  return { ...state, phase: 'revealed', outcome, hintsUsed: state.hintLevel, hintLevel: state.building.hints.length }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'load/start':
      return { ...state, phase: 'loading', error: null }

    case 'load/success':
      return { ...initialState, phase: 'playing', building: action.building }

    case 'load/restore': {
      // A finished daily coming back: straight to the reveal, with the saved result.
      const { fields, outcome, attempts, hintsUsed } = action.saved
      return { ...initialState, phase: 'revealed', building: action.building, fields, outcome, attempts, hintsUsed, hintLevel: action.building.hints.length }
    }

    case 'session/done':
      return { ...state, phase: 'done' }

    case 'building/translate':
      // Same building in another language: only the text changes.
      if (state.building?.id !== action.building.id) return state
      return { ...state, building: action.building }

    case 'load/failure':
      return { ...state, phase: 'error', error: action.error }

    case 'hint/reveal':
      if (state.phase !== 'playing' || state.hintLevel >= state.building.hints.length) return state
      return { ...state, hintLevel: state.hintLevel + 1 }

    case 'guess/submit': {
      if (state.phase !== 'playing') return state
      const fields = { ...state.fields }
      for (const field of GUESS_FIELDS) {
        if (fields[field] === 'correct') continue
        const result = action.results[field]
        fields[field] = result === true ? 'correct' : result === 'close' ? 'close' : result === false ? 'wrong' : 'idle'
      }
      const log = [...state.log]
      for (const field of GUESS_FIELDS) {
        const text = String(action.values?.[field] ?? '').trim()
        const seen = log.some((e) => e.field === field && e.text.toLowerCase() === text.toLowerCase())
        if (state.fields[field] !== 'correct' && action.results[field] === false && text && !seen) log.push({ field, text })
      }
      const next = { ...state, fields, log, attempts: state.attempts + 1 }
      return GUESS_FIELDS.every((f) => fields[f] === 'correct') ? reveal(next, 'solved') : next
    }

    case 'guess/edit':
      // Editing a wrong or close field clears its message; correct fields are locked.
      if (!['wrong', 'close'].includes(state.fields[action.field])) return state
      return { ...state, fields: { ...state.fields, [action.field]: 'idle' } }

    case 'answer/reveal':
      if (state.phase !== 'playing') return state
      return reveal(state, 'gaveUp')

    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}
