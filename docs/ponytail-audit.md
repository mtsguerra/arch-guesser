# Ponytail audit of the whole repo (2026-10-17)

**What this repo does:** Arch Guesser is a guessing game about famous buildings. A player looks at drawings and photos, opens tips, and guesses the building, architect, country and era. Production is a static site on Vercel (HTML, JS and prebuilt JSON). A small read-only Spring Boot API serves the same data in development.

**Load I assumed:** one person at a time per browser, a few thousand visitors a day at most, no accounts and nothing written to a server. Everything per-user lives in that browser.

**What I read:** all of `frontend/src` (game logic, hooks, components, styles, strings), the static build script, `vercel.json`, the Java package (repository, validator, service, controller, tests), `CLAUDE.md` and `DESIGN.md`. I traced these flows end to end: Normal, Daily, Custom, the reveal, the pencil home page, and the build and deploy path. I wrote scripts to find unused exports, files, CSS classes, strings and icons.

## Must fix

1. **A daily finished after midnight is saved under the wrong day** (`frontend/src/game/useGameRound.js`, the save effect, and the restore in `load`)
   - **What this is:** The Daily gives everyone the same building for a calendar day and remembers on the device that you finished it.
   - **Problem:** When you reveal, the result is saved under `dailyNumber()` as it is at that moment, not the day the building was chosen. Start the daily at 23:58 (day 5) and finish at 00:03: the result is saved as day 6 with day 5's building. On day 6 the home page says "Done", and opening it shows day 6's building already revealed with day 5's guesses. The restore never checks that the saved building is the day's building.
   - **Fix:** Keep the number from when the round loaded (`dailyRef.current = number`) and save with that. On restore also require `saved.id === id`, else ignore the saved result. About five lines.
   - **If we skip it:** Anyone who plays across midnight loses their next daily to a wrong "Done" screen. It is rare, but it is a silent wrong result and it cannot be undone from the page.

## Should fix

2. **Dead code** (`frontend/src/game/countries.js:75`, `strings/{en,pt-BR}.js`, `BuildingSummary.module.css`, `BuildingService.java:21`)
   - **What this is:** Leftovers from earlier versions of screens.
   - **Problem:** `allCountries()` is never called. The strings `language.switchTo`, `hints.allShown` and `guess.revealedValue` are never shown. The `.footer` rule in `BuildingSummary.module.css` styles a footer that no longer exists. `getTheme`, `editDistance` and `typoAllowance` are exported but only used inside their own file. `BuildingService.findById(String)` has no caller (the controller uses the two-argument version).
   - **Fix:** Delete them (about 45 lines). I applied this one: see "Applied" below.
   - **If we skip it:** Readers waste time on code that does nothing, and the string tables have to be translated for text nobody sees.

3. **Docs describe an older app** (`DESIGN.md`, `CLAUDE.md:46`)
   - **What this is:** `CLAUDE.md` tells new readers where the rules are; `DESIGN.md` is the visual system.
   - **Problem:** `DESIGN.md` still describes a chocolate rail over the page, "Check guess" as the only primary action and one light theme. It says nothing about the dark theme, the pencil home page, the slim game header, the reveal bar, the sound and haptics. `CLAUDE.md` lists five "close enough" era pairs; the code has fourteen (`matchGuess.js:20-35`).
   - **Fix:** Update the two paragraphs and point to `silhouettes.js`/`matchGuess.js` instead of copying the list.
   - **If we skip it:** The next person (or the next model) builds against rules that no longer hold.

4. **Translation and catalogue logic is written twice** (`BuildingTranslator.java` and `translate()` in `frontend/scripts/build-static-api.mjs`; `CatalogueEntry.java` and the catalogue block of the same script)
   - **What this is:** The Java side serves the API in development; the script produces the JSON that production serves.
   - **Problem:** The two must behave the same, but only the Java side has a test. If someone changes how the Portuguese overlay is applied in Java only, tests stay green and production keeps the old behaviour. The script also reads the era list out of `Era.java` with a regular expression; two eras on one line would be dropped silently, and only "zero eras" is checked.
   - **Fix:** Add one vitest that builds the static data into a temp folder and compares a few fields of `villa-rotonda` (en and pt-BR) and the era count with what the Java tests assert. No new layer.
   - **If we skip it:** Production and development can drift apart without any test failing.

5. **No test covers `useGameRound`** (`frontend/src/game/useGameRound.js`, 110 lines)
   - **What this is:** The hook that loads buildings for Normal, Daily and Custom, advances a custom session and saves the daily.
   - **Problem:** Only the pure helpers (`daily.js`, `custom.js`, the reducer) have tests. Finding 1 lives in the untested part, and so does "skipping a custom building counts it as played" and the daily restore path.
   - **Fix:** One test with a fake `fetch` and `localStorage` that plays a daily across a mocked midnight (it fails today, passes after fix 1).
   - **If we skip it:** The riskiest state logic in the app changes without any check.

6. **Seven hand-written copies of "does the user want less motion"** (`theme.js:23`, `viewTransition.js:9`, `game/haptics.js:5`, `components/ui/icons.jsx:31`, `SoundToggle.jsx:24`, `ShapeGrid.jsx:320`, `home/pencil.js:7`)
   - **What this is:** Each animation or buzz checks the reduced-motion setting before it runs.
   - **Problem:** Seven copies of the same `matchMedia` line. A change (for example also honouring a future setting) has to be made seven times.
   - **Fix:** One `prefersReducedMotion()` in `src/motion.js` (which already holds the shared motion values) and use it in the seven places.
   - **If we skip it:** One of them gets forgotten the next time the rule changes.

7. **`ShapeGrid` carries about 400 lines nobody uses** (`components/ui/ShapeGrid.jsx`, 767 lines)
   - **What this is:** The page background grid, adapted from a component library.
   - **Problem:** The app draws one thing: `shape="square"`, `direction="none"`. The file also implements eight shapes (hexagon, triangle, diamond, circle, cross, dot, tile), a 3D tilt matrix, rainbow colours, twinkle, click cascades, an intro and travelling directions. None is reachable.
   - **Fix:** Cut it to the square-grid, hover-lit path (a visual check against a screenshot is needed, because no test covers the canvas).
   - **If we skip it:** About 400 lines to read, and any bug hunt in the background can wander into code that never runs.

## Nice to have

8. **`FlipCard` has drag and axis code the hints never use** (`components/ui/FlipCard.jsx`, 272 lines)
   - **What this is:** The flip animation of the hint cards, adapted from a component library.
   - **Problem:** `HintTray` passes `draggable={false}` and the default axis, so the drag, velocity and x-axis code (about 90 lines) never runs.
   - **Fix:** Remove drag and the x axis when touching this file next; keep the controlled flip, tilt and glare.
   - **If we skip it:** Only extra reading.

9. **Home loads the catalogue in two places** (`components/home/Home.jsx`)
   - **What this is:** The home page shows the saved Custom summary and the collection count.
   - **Problem:** Two effects ask for the same list; the request itself is cached, so only the code is doubled.
   - **Fix:** Fetch once in `Home` and pass the list to `useCustomSummary`.
   - **If we skip it:** Nothing breaks.

10. **The hide-on-scroll listener runs on every screen** (`components/layout/AppShell.jsx`)
    - **What this is:** The slim game header tucks away while scrolling.
    - **Problem:** `useAutoHide()` is called for every `AppShell`, including home and the Custom setup, which have no slim header. It only costs one passive scroll listener.
    - **Fix:** Call it only when `slim` is set (move the hook into a small component).
    - **If we skip it:** One idle listener.

At most 20 findings are listed; I left out nothing larger than these. Smaller things I did not list: the `lite` heuristic also catches ordinary 4-core laptops; the Java `ids` and `catalogue` endpoints rebuild a 280-item list per request (about a millisecond, development only).

**Verdict:** Healthy. Fix finding 1 first (five lines, wrong "Done" after midnight), and add its test (5). Findings 3 and 4 are about the code telling the truth: docs and a second copy of the build logic.

**Lean:** -560 lines, -0 dependencies possible (about 45 of dead code now; about 400 in `ShapeGrid`; about 90 in `FlipCard`; about 25 from merging the seven checks).

**Not checked:** A real browser (gestures, sound, haptics, the pencil and the Safari behaviour). The Java dependency vulnerability scan (see `docs/security-checklist.md`). I did not read `ShapeGrid`'s drawing code line by line (only what the app can reach); the data files (`buildings.json`, the pt-BR overlays) were checked by the validator and the link tests, not read.

## Applied overnight (only the clearly safe cleanups)

Finding 2 was applied, as dead code only: one commit for the frontend leftovers and one for the unused Java method, each with the tests, lint and builds passing. Findings 1, 3 to 10 were left for review because they change behaviour, text or visuals that I cannot check without a browser.
