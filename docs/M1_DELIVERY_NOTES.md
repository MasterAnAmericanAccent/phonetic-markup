# Milestone 1 delivery notes

Accent Coach Bianca phonetic markup, Milestone 1. This is the coaching editor for a live session: type or paste a passage, format it, mark it, insert IPA, search it, and export PNG or HTML. It does not save an account, a session, or a file on a server.

## Implemented scope

All 30 requirements in `docs/M1_REQUIREMENTS.md` are implemented. The automated acceptance record is `docs/M1_ACCEPTANCE_REPORT.md`. Working decisions are in `docs/M1_DECISIONS.md`. Legacy behavior is in `docs/UALBERTA_PARITY.md`.

The editor opens on a short example passage so the marks are visible during review. Clear passage starts an empty document. Refreshing the browser shows the example again. There is no notice above the passage and no instruction box in the sidebar.

A rich-text toolbar sits above the passage. It can set paragraphs and headings, bold, italic, underline, standard strikethrough, alignment, lists, and blockquotes. That formatting is separate from phonetic marks. Clear formatting removes the standard formatting and leaves coaching annotations in place. Standard strikethrough is not the phonetic Strike Out mark. External paste still drops fonts, colors, and other outside styling.

## How to run

```bash
npm install
npm run dev
```

Vite prints a local URL, usually `http://127.0.0.1:5173/`.

## How to build

```bash
npm run build
```

Output is in `dist/`. `npm run preview` serves that build.

## Tests

```bash
npm test
npm run test:e2e
npm run typecheck
npm run lint
```

`npm test` runs the Vitest suite for editing, paste, annotations, the markup workspace, IPA, search, the document model, and export. `npm run test:e2e` runs the browser acceptance suite against the running app. The recorded result is `docs/M1_ACCEPTANCE_REPORT.md`.

## Architecture

The app is React, TypeScript, and Vite. The passage is a Tiptap / ProseMirror document.

- Paragraphs and hard breaks are document structure.
- Annotations are marks on text. The registry in `src/editor/annotations/` drives the panel, the selection menu, and export class names.
- IPA symbols are normal characters inserted at the selection. The inventory is `src/ipa/ipaData.ts`.
- Search highlights are temporary decorations. They are not marks and they are not saved in the document.
- PNG and HTML export walk the document JSON through one renderer. They do not screenshot the application chrome.
- Colors and annotation CSS live in `src/styles/sharedCss.ts` and are shared by the editor and the export. The product name and logo slot live in `src/branding/brand.ts`.

Document JSON uses version 1. Comment and research-marker marks exist in the schema only.

## Export behavior

Export HTML downloads `phonetic-markup.html`: one file, inlined CSS, no script, escaped text, annotation spans, and no search highlights.

Export PNG downloads `phonetic-markup.png` from that same document. The preferred scale is 2. A passage that would exceed 16384 pixels on one edge is exported at scale 1, or refused if it is still too large. The image is not cropped.

## Known limitations

- Nothing is stored. Refresh restores the example passage.
- PNG export cannot produce one image above 16384 pixels on an edge.
- Search is case-sensitive on purpose so IPA letters stay distinct.
- Overlapping Stretch and Reduce both remain stored. The inner letter-spacing is what you see.
- The production JavaScript bundle is large because PNG export includes `html2canvas`. That size is recorded in the Phase 6 report. It is not treated as an M1 defect.

## Provisional and client confirmation

These stay as implemented until Bianca or William decides otherwise:

- The client supplied the 2025 Honeybee palette, and those colors are now in the application shell. The header uses the supplied lockup (`src/assets/brand-logo.svg`) with the label PHONETIC MARKUP. The browser icon is the speech-bubble mark (`src/assets/acb-logo.svg`). Exports do not include those assets.
- Error, Voicing, and Nasal colors. These annotation colors were not changed when the shell palette was applied.
- Alternative is confirmed: blue dotted underline, stored as `alternate`, displayed as Alternative. It marks an acceptable pronunciation or realization that differs from the primary target. It is not an error.
- Connect’s coaching meaning.
- Whether Stretch and Reduce need a meaning beyond letter-spacing.
- Whether vowel `Ɛə` should stay U+0190 + U+0259 or become U+025B + U+0259.

## Not in Milestone 1

Database persistence, login, saved history, Discord, member management, sessions, hot-seat roulette, timers, recording, comments UI, research-marker UI, Coach Notes, Chat, Dictionary, Apply Markup to All, Replace All, Apply One vs All, custom markup keyboard shortcuts, and hold-key interaction.
