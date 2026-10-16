# Handoff: ideas from lastfm-game, to build in Arch Guesser

Whoever picks this up (Claude Sonnet, Opus, or a person): read `CLAUDE.md` first, then do the first unchecked item below. Tick the box when an item passes its check. Keep batches small and stop for review after each batch (CLAUDE.md working agreement). **Do not commit or push until the user says so.** Leave `.codegraph/` and the root `package-lock.json` untracked.

Source of the ideas: `~/Desktop/myGit/lastfm-game` (read only; never open its `.env` or `scrobble.db`). Do not copy its files: `tilt.js`/`countup.js`/`counter.js` carry an MIT + Commons Clause notice and `gooey.js` has an unchecked licence. Write our own versions.

## Decisions already made by the user

| Topic | Decision |
|---|---|
| Plotter title | Wordmark letters start as outlines and light up one by one with random delays (like `signal.js`), drawn like a plotter. Plain text for screen readers; nothing when reduced motion. |
| Melting selector | Own CSS/SVG version: pill that slides and stretches between choices (SVG goo filter) plus clip-path text inversion. No WebGL. Used by the Custom mode tabs and the rounds choice. Zero idle cost. |
| Sound | Web Audio synthesized, no files. **Off by default**, speaker toggle in the header, choice remembered. Events: a field locks (soft tick), a wrong guess (soft pencil scratch), the reveal (rising two-note chime). |
| Theme change | The new theme spreads in a circle from the toggle (View Transitions, `theme.js`, 600 ms; no animation with reduced motion). The toggle is a sun that turns into a moon (`SunMoonIcon`, rays fold in, a shadow slides over the disc), as in lastfm-game. Done. |
| Dark theme | "Blueprint night": deep chocolate ground, cream ink, camel grid lines. Follows the system, toggle (sun/moon) in the header next to the language switch, choice remembered, no flash on load. |
| Dynamic scaling | Root font size follows the window (1 at about 1470x826, clamp 0.82 to 1.3; phone widths stay 1). Layout is already in `rem`. Must keep the playing screen within one laptop viewport. |
| Lite mode | On weak devices (4 cores or fewer, 4 GB or less, data saver) drop `backdrop-filter` and heavy effects. |
| Digit counter | Numbers roll digit by digit (Daily #N, Custom match count) instead of the current spring tween. Plain number for screen readers, jump with reduced motion. |
| Undo toast | Replaces the native "Leave this session?" confirm. Menu leaves at once; toast "Session ended - Undo" for 7 s; Undo restores the session exactly, otherwise it is deleted. |
| Installable | `manifest.webmanifest`, icons (render from `public/favicon.svg`; a maskable one), `theme-color` following the theme, `manifest-src 'self'` in the CSP (`vercel.json`). No service worker, no offline. |
| Bottom action bar (phones) | In a game, Menu and Another building move to a fixed bar at the bottom (safe-area aware). |
| Pull down for next | After a reveal, pulling the page down moves to the next building (Normal and Custom only). |
| Page transitions | View Transitions API between home, daily, custom and play (same-document, on hash change); fall back to no transition. |
| Idle cost | Check the `ShapeGrid` background stops its loop when settled or hidden (it appears to already); fix if not. |
| Break-it script | `scripts/break-protections.py` (or `.mjs`) that disables each protection on purpose (CSP header, stored-data validation, https-only recap links) and checks a test fails. |
| NOT included | The drifting silhouette frieze on the home page (the user did not pick it). |

## Batches

### Batch 1: global look and feel (done by Claude Sonnet 5.5, awaiting review; theme, scale and lite live in `frontend/public/prepaint.js`)
- [x] Dark theme: tokens under `:root[data-theme='dark']` in `frontend/src/styles/tokens.css`; pre-paint script as an **external file** (`frontend/public/theme.js`, loaded in `index.html` without defer; the CSP is `script-src 'self'`, so no inline script); `ThemeToggle` in `AppShell` actions area; update `meta theme-color`; the `ShapeGrid` canvas cannot read CSS variables, so `PageBackground.jsx` must switch its mirrored colours with the theme. Also check `FlipCard` faces, hint fronts, summary and recap in dark.
- [x] Dynamic scaling: `frontend/public/scale.js` (or a hook) setting `--scale`; root `font-size: calc(100% * var(--scale))` in `base.css`.
- [x] Lite mode: a class on `<html>` set from `navigator.hardwareConcurrency`, `deviceMemory`, `connection.saveData`; CSS removes `backdrop-filter` (header, home cards, setup footer).
- [x] Sound: `frontend/src/game/sound.js` + `SoundToggle` in the header + strings (en, pt-BR); wire to the lock, wrong and reveal moments next to the existing `haptic()` calls in `GuessForm.jsx`.
- [x] Plotter title: wordmark in `AppShell.jsx`; letters split into spans with random delays; reduced motion shows plain text.
- [x] Page transitions: wrap hash-route changes in `document.startViewTransition` (guarded).

### Batch 2: Custom and feedback (done by Claude Sonnet 5.5, awaiting review; ShapeGrid already stops when settled and when off-screen, so no change was needed)
- [x] Melting selector (`components/ui/MeltSelect.jsx` + css): replaces the mode buttons and the rounds buttons in `CustomSetup.jsx`; keyboard and `aria-pressed`/radio semantics preserved.
- [x] Digit counter (`components/ui/RollingNumber.jsx`): use for the match count (`LiveText` in `CustomSetup`) and Daily #N.
- [x] Undo toast: `components/ui/Toast.jsx`; in `Game.jsx` `leave()`: stash the session (`custom.js` helpers), go home, show the toast, restore on Undo; remove `window.confirm` and the `custom.leave` string (or reuse it as the toast text).
- [x] Idle-cost check of `ShapeGrid`.

### Batch 3: phone and tooling
- [ ] Manifest, icons, `theme-color`, CSP `manifest-src 'self'` (and run the break-it check for it).
- [ ] Bottom action bar on phones (`max-width: 40rem`), with safe-area insets.
- [ ] Pull down for the next building after a reveal (touch only; Normal and Custom).
- [ ] `scripts/break-protections.*` and a short note in `CLAUDE.md`.

## Checks (run after every batch)
```
./gradlew test
cd frontend && npx vitest run && npm run lint && npm run build
```
Keep the playing screen within one laptop viewport (about 1470x860 to 956) with no scrolling.

Visual smoke test (no Playwright here; Firefox is installed):
```
cd frontend && npm run build:static
cd dist && python3 -m http.server 4174 &          # not `vite preview`: it proxies /api to :8090
FF=/Applications/Firefox.app/Contents/MacOS/firefox
$FF --headless --no-remote --profile /tmp/ffp --window-size 1470,700 --screenshot /tmp/home.png "http://localhost:4174/#/"
```
`--no-remote --profile` is required because the user's own Firefox is usually open. The shot is taken at the load event, so a screen can be caught mid-animation. Kill only the server you started. Gestures, sound and haptics cannot be tested this way; say so in the report.

## Rules and pitfalls learned in this project
- All UI copy lives in `frontend/src/strings/{en,pt-BR}.js` with identical keys (tested). Colours and spacing come from `tokens.css`.
- CSS Modules per component; Motion (`motion/react`) for springs; `MotionConfig reducedMotion="user"` is set in `main.jsx`. Respect `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast`.
- Browser storage can hold anything: validate on read (see `game/custom.js`, `game/daily.js`).
- `react-hooks/refs` lint rule: do not write a ref during render; use an effect.
- zsh does not word-split unquoted variables; macOS `sed -i` needs `''`.
- Dev backend runs on port 8090 (the user uses 8080 elsewhere); Vite on 5173. Never kill the user's servers.
- Report faithfully: what was verified, and what was not.
