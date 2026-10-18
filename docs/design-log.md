# Design log

Decisions, in the order they were made (home, game, Daily, Custom), then the visual review of 2026-10-19 and what is still open. Code is the truth for how things work; this file records why. Product context is in `PRODUCT.md`, the visual system in `DESIGN.md`.

Working rule from the owner: for any visual or UX change, three options with previews first, then build the one picked. When the owner dictates the exact result, build it as dictated.

## Home

- **Modes as the levels of a building.** Daily +6.40, Normal +3.20, Custom ±0.00 on an era elevation drawing that cycles; a datum marker glides between levels and tours on its own, held by hover or focus. Chosen over a stair and an axonometric (disliked).
- **One screen, no scroll.** Everything is in rem; `useFitToScreen` shrinks the root size iteratively until `scrollHeight <= innerHeight` at 1024px and up. Phones and narrow windows stack and scroll. Home breakpoints are px because Firefox resolves rem media queries against the root font size.
- **Layout from the owner's mock** (design window 1480×880, 37×22 squares of 2.5rem): labels column 11.25rem, drawing 50rem, sheet column 16.3rem; gaps 2.5rem and 5rem; the title centred at the top (y 40 to 160); Today's sheet starts at the roof and is 8 squares tall; the Daily streak card is 3.5 squares tall (top fixed, the half square grows down); the caption sits 40px under the drawing; the archive aligns with the drawing box; the how-to text is right-aligned under the labels; credits centred on every page.
- **No brown strip on wide screens.** Controls float top right; a 5rem logo slot (placeholder mark) sits top left, level with the title and aligned with the game-options column. No logo on phones.
- **Streak and archive.** Any finished Daily counts for the streak; every revealed building stamps its era in the archive; countries are counted too. History starts at the first visit after shipping.
- **Today's sheet.** A slowly panning crop of today's first drawing (fallback: first photo). Once played it shows the full sheet with an oxblood "Approved" double-border stamp, the date and a signature (replaced a green "Done" stamp), plus the countdown.
- **Title.** Pencil-drawn; in the light theme solid chocolate (`--title-ink`), not faded.
- **Level labels** show the height of their own line (before, every line said ceiling height 3.20 m).

## Game screen

- No strip either on wide screens: the slim header is transparent (menu, place, controls float). Text in it was enlarged (menu and actions 1rem, place 0.875rem, controls 95%) without changing its height.
- The globe sits right under the drawing's note; when the country is found it spins one full turn east, then rests on the country and drops the pin (2.6s, pin at 2.1s).
- **Hint cards.** Text is always palette cream. Dark: the Skywalk render in its own colours under the oxblood to chocolate tint (the owner called it perfect). Light: greyscale render under a cream and camel wash with chocolate text and oxblood icons. Reduced transparency: plain gradient, no image.
- **Guess form fields** use the instrument icons: building (windows light up, door ajar), compass (legs close then open wider), globe (meridian turns), hourglass (flips, sand runs). They play on hover, focus-within and when the answer is correct.
- "Reveal answer" has a veil icon that rolls up on hover and falls away when pressed.

## Daily result and sharing

- **Share** is a popover from the bar button (send-off icon: lines redraw on hover, nodes ripple on press) with the exact post text and Share (native sheet where there is one), Copy and WhatsApp. The text never names the building.
- **Result card** in the reveal summary is a title block: "Daily #N", score, and one ruled row per guess with a round badge (solid accent circle with a self-drawing check for got, quiet outlined circle with an eye for revealed). Chosen over stamps ("slop") and rings.
- Paper cards: hard-edged ruled sheets for documents; soft rounded cards are older and still on the home and guess form (see open items).

## Custom setup

- One drafting sheet in three numbered steps (section-cut ring numbers), corner marks, dimension line under the heading, dashed rules, two columns on wide screens (filters and rounds left, picker right), type about 25% larger than the shared sizes, `useFitToScreen`.
- Filter tabs carry instrument icons: compass (architect), hourglass (era), globe (country), globe with a clock hand (country + era).
- **Picker.** Picked rows are hatched with a bar; picks are accent stamps; a strip above each picker draws a ghost sketch (set square for architects, column for eras, map pin with a ring for countries) that is drawn and rubbed out when empty; each pick draws a solid one (up to ten, then +n). Past five picks the chips fold behind "•••" which opens the full list.
- **Rounds.** Slider 3 to 50 (stored as 3 to 50 or "all", default 10; anything else falls back to 10) with an "All" switch. The animation under it is a colonnade, one column per round, centred and stretching to fill; with "All" it shows as many as there are matches (up to 50). Replaced a skyline at the owner's request; the colonnade's first version was misplaced by Safari (CSS transforms on SVG groups) and now uses `attrX` (see gotchas).
- **Footer** is a title block: the foundation drawing lays one masonry course per matching building up to the ten needed; at ten the roof pops up, a flag rises and Start pulses twice.

## Gotchas learned

- The owner views in Safari. CSS transforms on SVG groups inside a viewBox are read differently (pivots and units), so animate attributes (`attrX`), use `transform-box: fill-box`, or transform the whole `<svg>`. The compass went through four animations because of this and taste.
- Dark mode is only `data-theme="dark"` on `<html>`; CSS media queries for dark do not exist.
- Headless Chromium here cannot render the game page; verify game, reveal and Daily states in Safari.
- In a stacking context a child with a negative z-index paints above the element's own background: tints must be a pseudo-element above the image pseudo-element.

## Visual review (2026-10-19)

Method: screenshots of the home (desktop and phone) and Custom (phone), the owner's Safari screenshots of the game in both themes, plus a read of tokens and CSS. The game, reveal, Daily and Recap states were not rendered by the reviewer.

Strengths: one consistent drafting identity; a disciplined palette with both themes designed (chocolate on cream 11:1, oxblood on cream 9.2:1, dark accent on dark 6.7:1); motion that means something; fit-to-screen works.

Problems, by weight:
1. **Phone Custom is broken.** The "Country + Era" tab is cut off (the tab row cannot wrap); the sticky footer covers rows of the list; the strip, logo and menu are cramped. Fix: 2×2 tabs, a fixed list height, a one-row footer.
2. **Type is too small in places.** 0.5625rem and 0.625rem appear (thumbnail numbers, badges); the common label size is 0.6875rem (11px); the home how-to text is about 12px and grey; the game's notes column is about 14px in a soft tone. Floor: 12px for labels, 15 to 16px for reading text.
3. **The grid mat competes with content.** The ShapeGrid hover glow squares and the major lines run through text (seen at the globe caption and under the thumbnails). Fade or limit them under reading areas.
4. **Home dead space.** The lens often shows blank sky (it takes the first image, not the most detailed crop); the streak card has empty space under its tiles; the left column is half empty; in the light theme the selected EN/PT pill covers "PT".
5. **Two component languages.** Hard-edged title blocks (Daily card, Custom sheet and footer) beside older 12px rounded cards (home cards, hint cards, guess form, share card). Radii 2px, 6px, 0.75rem, pill and circle all appear. `Button`, `SlimButton` and about four one-off buttons (`.cta`, `.secondary`, `.whatsapp`, `.link`) overlap. Icons come from lucide, `icons.jsx` and the instrument set with different stroke weights.
6. **Animation needs a budget.** Home runs title pencil, elevation draw, marker, tour, lens pan, streak and stamps together. Instrument icons need hover, so touch users rarely see them. The spring curve `0.34, 1.4, 0.5, 1` is pasted about 15 times and differs from motion's `springSoft`. Only 14 of 28 CSS files that animate mention reduced motion.
7. **Touch targets.** Top-bar controls are about 28 to 32px; chips and tabs are small on phones (WCAG minimum 24px passes; 44px is the touch target). Russet links on cream are 4.5:1, only just; camel on cream is 2.3:1 and must stay for lines only.
8. **Page notes.** Custom's left column has a gap between the tabs and the rounds step and the foundation drawing is only about 4rem wide; the reveal summary is long and dense; Custom picker lists are blank until the catalogue loads (a skeleton would help); the logo is a placeholder; the title filter and the canvas grid may stutter on old phones (not measured).

Suggested order: quick wins (phone Custom, 12px floor, a global reduced-motion rule, `--ease-spring` token, the PT pill, the streak card height); then the paper-versus-control card rule, calming the grid under text, a better lens crop and instrument animations on tap; then polish (real logo, skeletons, a summary table of contents, a motion budget per screen).

## Open items

- None of the review has been acted on yet; the owner has not picked a starting point.
- The final logo replaces the placeholder mark in the logo slot.
- Portuguese labels in the 11.25rem home label column and Custom are unverified (long words may crowd).
- The batch-1 security review never ran (HTTP 429).
- The lens card may still show blank sky when today's building only has a photo.
