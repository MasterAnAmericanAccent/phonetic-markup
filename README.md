# Accent Coach Bianca Phonetic Markup

Desktop editor for marking a coaching passage. A coach can paste or type text, apply phonetic annotations, insert IPA, search, and export PNG or HTML. Milestone 1 does not save accounts, sessions, or documents.

The Milestone 1 requirements are implemented. Automated acceptance is 30/30 requirements and 142/142 criteria. That is an implementation record, not a claim that the whole milestone has received final client sign-off.

## Stack

React, TypeScript, Vite, and Tiptap / ProseMirror.

## Prerequisites

Node.js and npm. End-to-end tests use the Google Chrome already installed on the machine.

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Vite prints a local URL, usually `http://127.0.0.1:5173/`.

## Tests

```bash
npm test
npm run test:e2e
npm run typecheck
npm run lint
```

`npm test` runs the Vitest suite. `npm run test:e2e` starts the app and runs the browser acceptance tests.

## Production build

```bash
npm run build
npm run preview
```

`npm run build` typechecks and writes `dist/`. `npm run preview` serves that build.

## Project layout

- `src/` application source
- `e2e/` browser acceptance tests
- `docs/` requirements, parity, decisions, delivery notes, and the acceptance record

## Milestone 1 exclusions

Not in this milestone: accounts, database storage, Discord, timers, recording, dictionary lookup, comments UI, bulk replace, custom phonetic shortcuts, Draw, and Erase. Draw was explicitly confirmed as outside Milestone 1. Erase stays out with that canvas workflow.

## Documentation

- Requirements: `docs/M1_REQUIREMENTS.md`
- Acceptance: `docs/M1_ACCEPTANCE_REPORT.md`
- Decisions: `docs/M1_DECISIONS.md`
- Delivery notes: `docs/M1_DELIVERY_NOTES.md`
- UAlberta parity: `docs/UALBERTA_PARITY.md`
