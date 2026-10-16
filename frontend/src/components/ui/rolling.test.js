import { describe, expect, it } from 'vitest'
import { splitFormat } from './splitFormat.js'
import { dismissToast, getToast, showToast } from './toast.js'

describe('splitFormat', () => {
  it('splits a sentence around its number', () => {
    expect(splitFormat((n) => `${n} buildings match`)).toEqual(['', ' buildings match'])
    expect(splitFormat((n) => `Daily #${n}`)).toEqual(['Daily #', ''])
  })

  it('gives up when the number is not in the text exactly once', () => {
    expect(splitFormat(() => 'nothing here')).toBeNull()
    expect(splitFormat((n) => `${n} of ${n}`)).toBeNull()
  })
})

describe('toast', () => {
  it('replaces the current message and can be dismissed', () => {
    showToast({ text: 'one' })
    const first = getToast().id
    showToast({ text: 'two', actionLabel: 'Undo', onAction: () => {} })
    expect(getToast()).toMatchObject({ text: 'two', actionLabel: 'Undo' })
    expect(getToast().id).toBeGreaterThan(first)
    dismissToast()
    expect(getToast()).toBeNull()
  })
})
