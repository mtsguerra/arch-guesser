// Shared motion grammar; mirrors the --ease-out and --dur-* tokens in styles/tokens.css.
export const easeOut = [0.16, 1, 0.3, 1]

export const duration = {
  fast: 0.16,
  base: 0.32,
  slow: 0.56,
}

export const springSoft = { type: 'spring', stiffness: 260, damping: 32, mass: 0.9 }
