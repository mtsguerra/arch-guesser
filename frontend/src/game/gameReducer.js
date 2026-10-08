import { GUESS_FIELDS } from './matchGuess.js'

/**
 * Round state machine.
 *
 *   loading ─▶ playing ─▶ revealed ─▶ loading …
 *      └─▶ error ─(retry)─▶ loading
 *
 * During `loading`, the previous building stays in state so the board can
 * hand over to the next one with an exit animation instead of a blank flash.
 *
 * `fields` holds each guess field's status: 'idle' | 'wrong' | 'correct'.
 * Correct fields lock. `outcome` is 'solved' or 'gaveUp' once revealed.
 */
const idleFields = Object.fromEntries(GUESS_FIELDS.map((f) => [f, 'idle']))

export const initialState = {
  phase: 'loading',
  building: null,
  hintLevel: 0,
  fields: idleFields,
  attempts: 0,
  outcome: null,
  error: null,
}

function reveal(state, outcome) {
  return { ...state, phase: 'revealed', outcome, hintLevel: state.building.hints.length }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'load/start':
      return { ...state, phase: 'loading', error: null }

    case 'load/success':
      return { ...initialState, phase: 'playing', building: action.building }

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
        fields[field] = result === true ? 'correct' : result === false ? 'wrong' : 'idle'
      }
      const next = { ...state, fields, attempts: state.attempts + 1 }
      return GUESS_FIELDS.every((f) => fields[f] === 'correct') ? reveal(next, 'solved') : next
    }

    case 'guess/edit':
      // Editing a wrong field clears its error; correct fields are locked.
      if (state.fields[action.field] !== 'wrong') return state
      return { ...state, fields: { ...state.fields, [action.field]: 'idle' } }

    case 'answer/reveal':
      if (state.phase !== 'playing') return state
      return reveal(state, 'gaveUp')

    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}
