import { useCallback, useEffect, useReducer, useRef } from 'react'
import { fetchRandomBuilding } from '../api/buildings.js'
import { gameReducer, initialState } from './gameReducer.js'
import { readSeen, recordSeen } from './seenBuildings.js'

export function useGameRound() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const pending = useRef(null)

  const loadNext = useCallback(async () => {
    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller

    dispatch({ type: 'load/start' })
    try {
      const seen = readSeen()
      const building = await fetchRandomBuilding(seen, controller.signal)
      recordSeen(building.id, seen)
      dispatch({ type: 'load/success', building })
    } catch (error) {
      if (error.name !== 'AbortError') dispatch({ type: 'load/failure', error })
    }
  }, [])

  useEffect(() => {
    loadNext()
    return () => pending.current?.abort()
  }, [loadNext])

  const revealHint = useCallback(() => dispatch({ type: 'hint/reveal' }), [])
  const revealAnswer = useCallback(() => dispatch({ type: 'answer/reveal' }), [])

  return { ...state, loadNext, revealHint, revealAnswer }
}
