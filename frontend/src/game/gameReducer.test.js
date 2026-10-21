import { describe, expect, it } from 'vitest'
import { gameReducer, initialState } from './gameReducer.js'
import { santIvo, villaSavoye } from './testBuildings.js'

const playing = (building = villaSavoye) => gameReducer(initialState, { type: 'load/success', building })
const submit = (state, results) => gameReducer(state, { type: 'guess/submit', results })

describe('loading', () => {
  it('starts a fresh round on success', () => {
    const state = playing()
    expect(state).toMatchObject({ phase: 'playing', building: villaSavoye, hintLevel: 0, attempts: 0, outcome: null })
    expect(Object.values(state.fields)).toEqual(['idle', 'idle', 'idle', 'idle'])
  })

  it('keeps the previous building while the next one loads', () => {
    const state = gameReducer(playing(), { type: 'load/start' })
    expect(state.phase).toBe('loading')
    expect(state.building).toBe(villaSavoye)
  })

  it('resets guesses and hints when the next building arrives', () => {
    let state = submit(gameReducer(playing(), { type: 'hint/reveal' }), { name: true })
    state = gameReducer(state, { type: 'load/success', building: santIvo })
    expect(state).toMatchObject({ building: santIvo, hintLevel: 0, attempts: 0 })
    expect(state.fields.name).toBe('idle')
  })

  it('records failures', () => {
    const error = new Error('down')
    expect(gameReducer(initialState, { type: 'load/failure', error })).toMatchObject({ phase: 'error', error })
  })
})

describe('hints', () => {
  it('reveals one at a time up to the number of hints', () => {
    let state = playing()
    for (let i = 0; i < 5; i++) state = gameReducer(state, { type: 'hint/reveal' })
    expect(state.hintLevel).toBe(villaSavoye.hints.length)
  })

  it('ignores hint requests outside play', () => {
    expect(gameReducer(initialState, { type: 'hint/reveal' })).toBe(initialState)
  })
})

describe('guessing', () => {
  it('marks fields and counts attempts', () => {
    const state = submit(playing(), { name: true, architect: false, country: null, era: false })
    expect(state.fields).toEqual({ name: 'correct', architect: 'wrong', country: 'idle', era: 'wrong' })
    expect(state.attempts).toBe(1)
    expect(state.phase).toBe('playing')
  })

  it('locks correct fields on later submissions', () => {
    let state = submit(playing(), { name: true })
    state = submit(state, { name: false, era: true })
    expect(state.fields.name).toBe('correct')
    expect(state.fields.era).toBe('correct')
  })

  it('clears an error when the field is edited, but never unlocks a correct one', () => {
    let state = submit(playing(), { name: true, era: false })
    state = gameReducer(state, { type: 'guess/edit', field: 'era' })
    expect(state.fields.era).toBe('idle')
    expect(gameReducer(state, { type: 'guess/edit', field: 'name' })).toBe(state)
  })

  it('marks a close era without locking it, and clears it on edit', () => {
    let state = submit(playing(), { era: 'close' })
    expect(state.fields.era).toBe('close')
    expect(state.log).toEqual([])
    state = gameReducer(state, { type: 'guess/edit', field: 'era' })
    expect(state.fields.era).toBe('idle')
  })

  it('logs wrong guesses once each, skipping blanks and correct fields', () => {
    const send = (state, results, values) => gameReducer(state, { type: 'guess/submit', results, values })
    let state = send(playing(), { name: false, architect: true, country: false }, { name: ' Villa X ', architect: 'Le Corbusier', country: '' })
    expect(state.log).toEqual([{ field: 'name', text: 'Villa X' }])
    state = send(state, { name: false }, { name: 'villa x' })
    expect(state.log).toHaveLength(1)
    state = send(state, { name: false }, { name: 'Villa Y' })
    expect(state.log.map((e) => e.text)).toEqual(['Villa X', 'Villa Y'])
  })

  it('solves the round once all four fields are correct, opening every hint', () => {
    let state = submit(playing(), { name: true, architect: true })
    state = submit(state, { country: true, era: true })
    expect(state).toMatchObject({ phase: 'revealed', outcome: 'solved', attempts: 2, hintLevel: 3 })
  })

  it('ignores guesses after the reveal', () => {
    const revealed = gameReducer(playing(), { type: 'answer/reveal' })
    expect(submit(revealed, { name: true })).toBe(revealed)
  })
})

describe('giving up', () => {
  it('reveals the answer and every hint', () => {
    const state = gameReducer(playing(), { type: 'answer/reveal' })
    expect(state).toMatchObject({ phase: 'revealed', outcome: 'gaveUp', hintLevel: 3 })
  })
})

it('throws on unknown actions', () => {
  expect(() => gameReducer(initialState, { type: 'nope' })).toThrow('Unknown action')
})

describe('building/translate', () => {
  const building = { id: 'a', name: 'A', hints: [{ order: 1, text: 'x' }, { order: 2, text: 'y' }] }

  it('swaps the building text and keeps the round state', () => {
    let state = gameReducer(initialState, { type: 'load/success', building })
    state = gameReducer(state, { type: 'hint/reveal' })
    const next = gameReducer(state, { type: 'building/translate', building: { ...building, name: 'Á' } })
    expect(next.building.name).toBe('Á')
    expect(next.hintLevel).toBe(1)
    expect(next.phase).toBe('playing')
  })

  it('ignores a different building', () => {
    const state = gameReducer(initialState, { type: 'load/success', building })
    expect(gameReducer(state, { type: 'building/translate', building: { ...building, id: 'b' } })).toBe(state)
  })
})

describe('themed rounds', () => {
  it('asks only the given fields and reveals when those are correct', () => {
    let state = gameReducer(initialState, { type: 'load/success', building: villaSavoye, fields: ['name', 'era'] })
    expect(Object.keys(state.fields)).toEqual(['name', 'era'])
    state = gameReducer(state, { type: 'guess/submit', results: { name: true, era: true }, values: {} })
    expect(state.phase).toBe('revealed')
  })
})
