/**
 * Round state machine.
 *
 *   loading ─▶ playing ─▶ revealed ─▶ loading …
 *      └─▶ error ─(retry)─▶ loading
 *
 * During `loading`, the previous building stays in state so the board can
 * hand over to the next one with an exit animation instead of a blank flash.
 */
export const initialState = {
  phase: 'loading',
  building: null,
  hintLevel: 0,
  error: null,
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'load/start':
      return { ...state, phase: 'loading', error: null }

    case 'load/success':
      return { phase: 'playing', building: action.building, hintLevel: 0, error: null }

    case 'load/failure':
      return { ...state, phase: 'error', error: action.error }

    case 'hint/reveal':
      if (state.phase !== 'playing' || state.hintLevel >= state.building.hints.length) return state
      return { ...state, hintLevel: state.hintLevel + 1 }

    case 'answer/reveal':
      if (state.phase !== 'playing') return state
      return { ...state, phase: 'revealed' }

    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}
