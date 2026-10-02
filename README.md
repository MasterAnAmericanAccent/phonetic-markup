# Phonetic Markup

Desktop editor for Accent Coach Bianca phonetic markup. A coach can paste or type a passage, apply phonetic annotations, insert IPA, search the text, and export PNG or HTML. Milestone 1 does not save documents, accounts, or sessions.

## Prerequisites

Node.js and npm. End-to-end tests use the Google Chrome already installed on the machine. They do not download a separate Playwright browser.

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Vite prints a local URL, usually `http://127.0.0.1:5173/`.

## Production build

```bash
npm run build
npm run preview
```

`npm run build` typechecks and writes `dist/`. `npm run preview` serves that build.

## Tests

```bash
npm test
npm run test:e2e
npm run typecheck
npm run lint
```

`npm test` runs the Vitest suite. `npm run test:e2e` starts the app and runs the Milestone 1 browser acceptance tests.

## Documentation

- Requirements: `docs/M1_REQUIREMENTS.md`
- Automated acceptance: `docs/M1_ACCEPTANCE_REPORT.md` and `docs/M1_ACCEPTANCE_MATRIX.md`
- Decisions: `docs/M1_DECISIONS.md`
- Delivery notes: `docs/M1_DELIVERY_NOTES.md`
- Legacy parity: `docs/UALBERTA_PARITY.md`
