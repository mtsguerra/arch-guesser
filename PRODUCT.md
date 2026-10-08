# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: architecture students revising architectural history (names, architects, places, eras) who already read plans and sections and want low-pressure recall practice. Secondary: curious enthusiasts who love buildings but have no formal training; the app must welcome them without slowing students down.

Played mostly on desktop, where technical drawings are readable at size. Mobile must be fully usable but is secondary.

## Product Purpose

An educational guessing game: the player studies technical drawings (floor plans, sections, elevations) of a famous building and guesses its name, architect(s), country and era. Success is learning and appreciation, not winning: every round ends in a short educational summary of the building and its architects.

## Positioning

The puzzle is the drawing itself. Players learn to read buildings the way architects document them (plan and section first) and only then see photographs, which reverses the usual photo-first quiz.

## Operating Context

A stress-free study session, one building at a time. No scores, no timers, no streaks. A round goes: drawings only, then optional progressive hints (interior photo, historical fact, exterior photo), then guesses that can be retried, then the reveal summary. Buildings don't repeat within a browser-tab session.

## Capabilities and Constraints

- Guess fields: building name, architect(s), country, era. Era is picked from a fixed list served by `GET /api/eras`; text fields match case- and accent-insensitively against aliases.
- Submit all four at once; correct fields lock; the player may retry, open more hints, or reveal at any time.
- Hints stack in a tray beside the drawings; drawings are shown one sheet at a time with tabs and a zoom view.
- Every building has at least 2 hints and at least 1 drawing (enforced by the backend).
- Drawings are raster scans (PNG/JPG), not SVG.
- Real image assets are still being gathered; the UI must fall back gracefully to a placeholder when an image is missing.
- Alt text describes drawings and photos without naming the building, so screen-reader users don't see the answer early.
- Open: how forgiving era matching should be ("close enough" eras) is deferred until the core loop is playable.

## Stack

React 19 + Vite (JSX, CSS Modules) with Motion (`motion/react`) for transitions; Spring Boot 4 REST API (Java) serving building data as JSON. Images live in `frontend/public/buildings/{id}/`.

## Brand Commitments

- Binding palette: `#6F1D1B` oxblood, `#BB9457` camel, `#432818` chocolate, `#99582A` russet, `#FFE6A7` cream. Light colours for backgrounds and paper; dark reds and browns for type and UI accents.
- Feel: "modern digital drafting board"; clean academic meets playful; transitions must be exceptionally smooth.

## Evidence on Hand

Five dummy buildings in `src/main/resources/data/buildings.json` with real facts but placeholder image paths and "Placeholder — source TBD" credits. No real images, testimonials or usage data exist yet; do not fabricate them.

## Product Principles

1. Learning over winning: no element should create time pressure or a sense of failure.
2. Drawings first: the technical drawing is the hero; photographs are a reward, not the starting point.
3. Every round teaches: the reveal is the payoff and must be worth reading.
4. Rigor without gatekeeping: accurate terminology for students, with plain explanations within reach for enthusiasts.

## Accessibility & Inclusion

Alt text never names the answer. Respect `prefers-reduced-motion`. Copy is English for now, with all UI strings kept centralized so translation later is cheap.
