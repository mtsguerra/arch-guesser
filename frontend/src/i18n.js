import { createContext, useContext } from 'react'
import { LANGUAGES, bundles } from './strings/index.js'

export const LanguageContext = createContext({ lang: 'en', setLang() {}, strings: bundles.en })

/** Saved choice, else the browser's language (any pt-* → pt-BR), else English. */
export function detectLanguage(saved, browser) {
  if (LANGUAGES.includes(saved)) return saved
  return browser?.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en'
}

export const useLanguage = () => useContext(LanguageContext)
export const useStrings = () => useContext(LanguageContext).strings
