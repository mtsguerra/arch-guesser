# Arch Guesser

Educational guessing game on architectural history. The player sees a building's drawings and photos as numbered sheets on a "drafting board", opens text tips, and guesses building, architect, country and era. No scores, no timers. A reveal shows an educational summary.

## Run

```
./gradlew bootRun            # Spring Boot API on :8080
cd frontend && npm run dev   # Vite on :5173, proxies /api to :8080
```

Checks before committing: `./gradlew test` and, in `frontend/`, `npx vitest run`, `npm run lint`, `npm run build`.

## Stack and layout

- Backend: Spring Boot 4 (Java 21 target, Jackson 3), Gradle 9 at the repo root (`src/`). Package `com.mtsguerra.archguesser`.
- Frontend: React 19 + Vite in `frontend/`, plain JSX, CSS Modules, Motion (`motion/react`), lucide icons, Archivo variable font.
- Data: `src/main/resources/data/buildings.json` (260 buildings: 50 world catalogue, 50 Portugal, 70 era/canon additions, 40 world icons, 50 works by named architects), loaded once at startup.
- i18n: UI copy in `frontend/src/strings/{en,pt-BR}.js` (same keys, tested); building text translated in `src/main/resources/data/pt-BR/*.json` (id → overlay of names, aliases, bios, labels, alts, hints, summary; list sizes must match the source). API takes `?lang=pt-BR`; the static build writes `public/api/pt-BR/`.
- API: `GET /api/buildings/random?exclude=a,b`, `GET /api/buildings/{id}`, `GET /api/eras`. Errors are RFC 9457 problem+json.

## Data rules (enforced by `BuildingValidator`; the app refuses to start if any fail)

- ids are unique kebab-case; at least one architect with name and bio.
- `drawings` (cuts) are optional, but every `src` must be real: an `https://upload.wikimedia.org/` URL (or a local `/buildings/{id}/` path). Never a placeholder or null.
- `photos`: at least one `EXTERIOR`, plus an `INTERIOR` or a second `EXTERIOR` (when no free interior exists).
- `hints`: at least 2, text only, `order` 1..n. We write exactly 3, and they must not depend on looking at the photos.
- Optional `crop` `{x, y, w, h}` (fractions) on drawings and photos hides anything that names the building or architect (title blocks, captions, signatures, façade lettering). Check every image for spoilers.
- `credit` + `source` (Commons file page) on every image; credits are shown only after the reveal.
- `yearCompleted` may be null for unfinished works.
- `wikipedia` is required: the article URL (`https://en.wikipedia.org/wiki/...`, or `pt.wikipedia.org` when no English article exists), shown after the reveal as further reading. The pt-BR overlay may carry its own `wikipedia` URL.
- `era` is the style the building is known for, not its date (a 2015 building can be Brutalist). Non-Western works use `ANCIENT_EGYPTIAN`, `PRE_COLUMBIAN`, `INDIC`, `EAST_ASIAN` or `ISLAMIC`.
- Unknown JSON fields are rejected.

## Image sourcing

- Wikimedia Commons only, public domain or CC licences. Store `upload.wikimedia.org` URLs without `?utm_*` parameters; small originals may need the full-file URL instead of a thumbnail.
- Use the User-Agent `ArchGuesserBot/1.0 (https://github.com/mtsguerra/arch-guesser)` and keep 2 s between requests.
- Interiors of copyrighted buildings are a "lenient" grey zone the user accepted. On the frontend, a tab whose image fails to load removes itself (no error placeholder); while an image is still loading, the sheet shows `PlotLoader` (a drawing plotting itself).
- Facts come from Wikipedia pages fetched while writing; drop claims that can't be sourced.

## Game logic (frontend `src/game/`)

- `gameReducer.js`: phases loading → playing → revealed (or error); correct fields lock and show the canonical answer.
- `matchGuess.js`: typo-tolerant name matching (aliases, distinctive words, surnames only for people); any one architect counts; countries resolved through `Intl` (`countries.js`); "close enough" eras (Modernism/Brutalism/Contemporary, Postmodernism/Contemporary, Historicism/Art Nouveau, Art Deco/Modernism, Neoclassical/Historicism).
- Gallery (`components/board/DrawingBoard.jsx`, frameless carousel: stage, thumbnail strip, side notes with the image's `alt`/`caption`, and the credit after the reveal). Order from `sheets.js`: cuts first, numbered A-1xx plans, A-2xx elevations, A-3xx sections, A-0xx site plans; then P-1 exterior, P-2 interior.
- Seen buildings are stored in `sessionStorage` and sent as `exclude`.

## Design

`DESIGN.md` and `.impeccable/design.json` describe the visual system (drafting-mat grid drawn by `ShapeGrid` in `PageBackground`, the frameless gallery, `EraCombobox` (type a name or year, or browse the list) for the era guess, the one-row `HintTray` under the gallery, `RevealBuild` (the blueprint-rises reveal animation), brief-pinned palette `#6F1D1B #BB9457 #432818 #99582A #FFE6A7`). The playing screen is sized to fit one laptop viewport (about 1470×860 to 956) without scrolling; keep it that way. Use tokens from `frontend/src/styles/tokens.css`; all UI copy lives in `frontend/src/strings/`. `PRODUCT.md` holds product context.

## Working agreement

- Build in small batches; ask about logic requirements before starting a new component, and pause for review after each batch.
- Commit only when the user approves; leave the stray root `package-lock.json` untracked.
