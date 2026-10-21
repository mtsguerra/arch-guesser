import { describe, expect, it } from 'vitest'
import { THEME_COVERS } from './themeCovers.js'
import en from '../../strings/en.js'

describe('theme covers', () => {
  it('has one Wikimedia thumbnail for every theme and none extra', () => {
    expect(Object.keys(THEME_COVERS).sort()).toEqual(Object.keys(en.themed.themes).sort())
    for (const url of Object.values(THEME_COVERS)) expect(url).toMatch(/^https:\/\/upload\.wikimedia\.org\/.*\/330px-[^?]*$/)
  })
})
