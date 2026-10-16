import { useCallback, useEffect, useReducer, useRef } from 'react'
import { fetchBuilding, fetchBuildingIds, fetchRandomBuilding } from '../api/buildings.js'
import { useLanguage } from '../i18n.js'
import { dailyHold, dailyId, dailyNumber, readDaily, saveDaily } from './daily.js'
import { gameReducer, initialState } from './gameReducer.js'
import { evaluateGuess } from './matchGuess.js'
import { readSeen, recordSeen } from './seenBuildings.js'

/** @param {'normal' | 'daily'} mode  daily plays today's fixed building once, then shows its saved result. */
export function useGameRound(mode = 'normal') {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const pending = useRef(null)
  const { lang } = useLanguage()
  // Read through a ref so a language switch doesn't recreate loadNext and start a new round.
  const langRef = useRef(lang)
  useEffect(() => {
    langRef.current = lang
  }, [lang])

  const loadNext = useCallback(async () => {
    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller

    dispatch({ type: 'load/start' })
    try {
      if (mode === 'daily') {
        const number = dailyNumber()
        const id = dailyId(await fetchBuildingIds(), number)
        const building = await fetchBuilding(id, controller.signal, langRef.current)
        const saved = readDaily(number)
        dispatch(saved ? { type: 'load/restore', building, saved } : { type: 'load/success', building })
        return
      }
      const seen = readSeen()
      const hold = await dailyHold()
      const building = await fetchRandomBuilding(hold ? [...seen, hold] : seen, controller.signal, langRef.current)
      recordSeen(building.id, seen)
      dispatch({ type: 'load/success', building })
    } catch (error) {
      if (error.name !== 'AbortError') dispatch({ type: 'load/failure', error })
    }
  }, [mode])

  useEffect(() => {
    loadNext()
    return () => pending.current?.abort()
  }, [loadNext])

  const currentId = state.building?.id

  // A finished daily is remembered on this device.
  const { phase, outcome, fields, attempts, hintsUsed } = state
  useEffect(() => {
    if (mode === 'daily' && phase === 'revealed') {
      saveDaily({ number: dailyNumber(), id: currentId, outcome, fields, attempts, hintsUsed })
    }
  }, [mode, phase, outcome, fields, attempts, hintsUsed, currentId])

  // Switching language mid-round swaps the building's text but keeps guesses, hints and phase.
  const currentLang = useRef(lang)
  useEffect(() => {
    if (currentLang.current === lang) return
    currentLang.current = lang
    if (!currentId) return
    const controller = new AbortController()
    fetchBuilding(currentId, controller.signal, lang)
      .then((building) => dispatch({ type: 'building/translate', building }))
      .catch(() => {}) // keep the text we have
    return () => controller.abort()
  }, [lang, currentId])

  const revealHint = useCallback(() => dispatch({ type: 'hint/reveal' }), [])
  const revealAnswer = useCallback(() => dispatch({ type: 'answer/reveal' }), [])
  const editField = useCallback((field) => dispatch({ type: 'guess/edit', field }), [])

  const { building } = state
  const submitGuess = useCallback(
    (values) => dispatch({ type: 'guess/submit', results: evaluateGuess(building, values) }),
    [building],
  )

  return { ...state, loadNext, revealHint, revealAnswer, submitGuess, editField }
}
