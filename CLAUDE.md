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
- Data: `src/main/resources/data/buildings.json` (90 buildings: 50 world catalogue, 40 Portugal so far), loaded once at startup.
- API: `GET /api/buildings/random?exclude=a,b`, `GET /api/buildings/{id}`, `GET /api/eras`. Errors are RFC 9457 problem+json.

## Data rules (enforced by `BuildingValidator`; the app refuses to start if any fail)

- ids are unique kebab-case; at least one architect with name and bio.
- `drawings` (cuts) are optional, but every `src` must be real: an `https://upload.wikimedia.org/` URL (or a local `/buildings/{id}/` path). Never a placeholder or null.
- `photos`: at least one `EXTERIOR` and one `INTERIOR`.
- `hints`: at least 2, text only, `order` 1..n. We write exactly 3, and they must not depend on looking at the photos.
- Optional `crop` `{x, y, w, h}` (fractions) on drawings and photos hides anything that names the building or architect (title blocks, captions, signatures, façade lettering). Check every image for spoilers.
- `credit` + `source` (Commons file page) on every image; credits are shown only after the reveal.
- `yearCompleted` may be null for unfinished works.
- Unknown JSON fields are rejected.

## Image sourcing

- Wikimedia Commons only, public domain or CC licences. Store `upload.wikimedia.org` URLs without `?utm_*` parameters; small originals may need the full-file URL instead of a thumbnail.
- Use the User-Agent `ArchGuesserBot/1.0 (https://github.com/mtsguerra/arch-guesser)` and keep 2 s between requests.
- Interiors of copyrighted buildings are a "lenient" grey zone the user accepted. On the frontend, a tab whose image fails to load removes itself; there is no placeholder UI anywhere.
- Facts come from Wikipedia pages fetched while writing; drop claims that can't be sourced.

## Game logic (frontend `src/game/`)

- `gameReducer.js`: phases loading → playing → revealed (or error); correct fields lock and show the canonical answer.
- `matchGuess.js`: typo-tolerant name matching (aliases, distinctive words, surnames only for people); any one architect counts; countries resolved through `Intl` (`countries.js`); "close enough" eras (Modernism/Brutalism/Contemporary, Postmodernism/Contemporary, Historicism/Art Nouveau, Art Deco/Modernism, Neoclassical/Historicism).
- Board tabs (`components/board/sheets.js`): cuts first, numbered A-1xx plans, A-2xx elevations, A-3xx sections, A-0xx site plans; then P-1 exterior, P-2 interior.
- Seen buildings are stored in `sessionStorage` and sent as `exclude`.

## Design

`DESIGN.md` and `.impeccable/design.json` describe the visual system (drafting-mat grid, paper sheets, title blocks, brief-pinned palette `#6F1D1B #BB9457 #432818 #99582A #FFE6A7`). Use tokens from `frontend/src/styles/tokens.css`; all UI copy lives in `frontend/src/strings.js`. `PRODUCT.md` holds product context.

## Working agreement

- Build in small batches; ask about logic requirements before starting a new component, and pause for review after each batch.
- Commit only when the user approves; leave the stray root `package-lock.json` untracked.
