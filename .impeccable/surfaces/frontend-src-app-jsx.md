---
version: 1
slug: "frontend-src-app-jsx"
primary_target: "frontend/src/App.jsx"
related_targets: []
---

# Game screen

Scope: the single-page game screen (board, hint tray, guess form, reveal). Mode: Operate.
Audience/job: architecture students (and enthusiasts) identifying a building from its drawings; stress-free study.
Constraints: brief-pinned palette and drafting-board feel; Motion for transitions; desktop-first; raster drawings with graceful placeholder fallback; alt text never names the answer.
Build path: code-led (no image generation on this machine).

## Direction contract

THESIS: The round is a drawing set on a drafting table. The building is documented the way architects document it, sheet by sheet with a title block, instead of the category default of a centred quiz card with a photo and four answer buttons.

OWN-WORLD: Chocolate (#432818) header rail with cream type; saturated cream (#FFE6A7) drafting-mat ground ruled with a faint camel (#BB9457) grid; paler paper sheets with a hairline inner border frame and a lifted, soft shadow; oxblood (#6F1D1B) for primary actions and selected state; russet (#99582A) for links and focus. Archivo variable: wide uppercase caps for title-block lettering, normal width for UI and body text; tabular numerals for sheet numbers.

STORY: The player sees the sheets, flips between them, leans in to read detail, asks for hints, guesses, and watches the title block fill in cell by cell as each guess locks (canonical spelling plotted in), then reads the monograph.

FIRST VIEWPORT: Header rail on top (wordmark left, "Another building" right). Below it, the board takes about 2/3 of the width: sheet tabs (A-101 Ground floor plan, A-301 Section…) sit above one large landscape sheet whose bottom strip is the title block (PROJECT — Unidentified / ARCHITECT / DRAWING / SHEET n of N). The right third holds the guess worksheet (paper, inner frame, ruled caps strip) above the hint tray. On reveal the board steps back into a left reference column beside a framed monograph sheet; "Back to drawings" swaps back.

FORM: Pinned by the user, not rolled (no concept-seed key). Brief: "Think 'modern digital drafting board'". Approved on the built form: "The drawing board looks and feels fantastic on localhost. The drafting mat styling, the zooming functionality, and the title block fill-in animation are all spot on. Approved!" Signature move: drawing-set sheet numbering + a title block that fills in on reveal; sheets flip directionally like pages in a set; in-place zoom that follows the pointer.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
