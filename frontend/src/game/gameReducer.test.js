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
