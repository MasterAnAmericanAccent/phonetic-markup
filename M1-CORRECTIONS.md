# M1 final corrections

## Adding an IPA character (William)

The maintained configuration is `src/ipa/ipaData.ts`. The `vowelCharacters` and
`consonantCharacters` arrays contain Unicode strings; `intonationCharacters`
contains character/label objects. `ipaSymbols` combines them and generates IDs,
accessible labels, and code point labels. No component changes are needed.

ǣ is now approved and included once in Vowels, using this entry inside `vowelCharacters`:

```ts
  '\u01E3', // ǣ
```

Use `consonantCharacters` for Consonants. For Intonation, use an object inside
`intonationCharacters`, e.g. `{ character: '\u01E3', label: 'Insert ǣ' }`.
Choose the group by choosing the corresponding source array. For future additions, use the same configuration arrays; no palette component changes are required.

Run `npm run dev`, select the group tab, check the symbol button (U+01E3), place
the cursor inside a word, and click it. Confirm the Unicode symbol inserts once,
the cursor follows it, the editor stays focused, and subsequent typing has normal
alignment. Check undo/redo and both exports. Run `npm test` and `npm run test:e2e`.

## Verified UAlberta behavior

Read-only inspection of the published app on 2026-10-21 verified
`IPA: { 'vertical-align': 'super', 'font-size': '150%' }` in:
https://ualberta-cmput401.github.io/phonetic-markup/static/js/main.61532b02.chunk.js

The same script collapses a selected range to its end before inserting IPA,
and clears its inline-style override afterward. ACB uses an editable Tiptap mark
and clears the stored IPA mark after insertion. `line-height: 0` keeps ACB's
existing line spacing while applying the verified font size and vertical alignment.
The reference uses CSS `super`, not a fixed pixel offset; exact pixels depend on font.

HTML export embeds CSS and snapshots the current editor box model and typography.
PNG uses that document-only HTML, full content height, and at least 2x resolution
(subject to the existing canvas size guard). No controls or search decorations are
serialized. Oversized passages produce an error instead of a cropped image.

PNG phonetic strokes are drawn after nested backgrounds using the rendered text's
font metrics and wrapped fragments, avoiding html2canvas decoration occlusion.

## Final validation

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm test`: 117 passed, 0 failed across 11 files.
- `npm run test:e2e`: 28 passed, 0 failed in installed Chrome.
- `npm run build`: PASS; Vite reports a JavaScript chunk over 500 kB.
- `git diff --check`: PASS.

The browser suite includes exports at 700, 1440, and 1920 CSS-pixel viewports,
short and long content, multiple paragraphs, matching exported/live content
height and wrapping, 3x device pixel ratio, both annotation application orders,
independent removal, visible PNG color layers, editable IPA and focus, search,
selection, undo/redo, tooltip placement/fallback/hiding, and document-wide clearing.
The existing regression also exercises annotation attachment under CSS zoom.
Native browser zoom controls and other browser engines were not manually tested.
PNG and editor visual artifacts were inspected for the Connect + Alternative +
Voicing combination and IPA offset. The reference was only read, never modified.

### Changed files

- `src/export/download.ts`: local timestamp filename generated on export.
- `src/export/ExportActions.tsx`: timestamp and current editor layout passed to export.
- `src/export/documentHtml.ts`: IPA serialization and rendered box/typography capture; no template whitespace inside document blocks.
- `src/export/documentCss.ts`: fluid fallback width, editor font, preserved whitespace.
- `src/export/renderPng.ts`: measured full dimensions, DPI scaling, post-background phonetic strokes.
- `src/styles/sharedCss.ts`: independent annotation lanes and shared IPA offset styling.
- `src/ipa/IpaOffset.ts` (new): editable, non-inclusive IPA mark.
- `src/ipa/insertSymbol.ts`: reference-compatible insertion after selection, caret and stored-mark handling.
- `src/editor/createPhoneticExtensions.ts`: registers the IPA mark.
- `src/editor/selection/SelectionMenu.tsx`: above-selection placement, viewport padding, flip/shift/hide.
- `src/editor/commands/clearFormatting.ts`: entire-document text-block normalization and isolated undo step.
- `src/editor/richText.test.ts`: updated full-clear expectations.
- `src/export/export.test.ts`: updated dynamic-width expectations.
- `src/ipa/ipa.test.ts`: verified non-destructive insertion behavior.
- `src/acceptance/m1Corrections.test.ts` (new): targeted correction regression tests.
- `e2e/m1-acceptance.spec.ts`: live-width export expectation.
- `e2e/m1-corrections.spec.ts` (new): browser/export/pixel regression tests.
- `M1-CORRECTIONS.md` (new): William's IPA configuration instructions, reference evidence, validation record.

Git status: 14 modified tracked files, 4 new untracked files. No staged files.
No commits, pushes, deployments, dependency changes, or Git/deployment configuration changes.

## Approved IPA addition: ǣ (U+01E3)

Added `\u01E3` once to `vowelCharacters` in `src/ipa/ipaData.ts`.
All prior symbols and groups are preserved. Future symbols can be added through
the same configuration; no palette, insertion, editor, or export architecture changes were needed.

This follow-up changed only `src/ipa/ipaData.ts`, `src/ipa/ipa.test.ts`,
`src/acceptance/m1Corrections.test.ts`, `e2e/ipa-ae.spec.ts` (new), and this document.

Final verification: typecheck PASS, ESLint PASS, 119 unit/integration tests PASS,
30 Chrome end-to-end tests PASS, production build PASS, and `git diff --check` PASS.
The build still reports its chunk-size warning.

The new browser tests confirm exactly one Vowels button, middle/end sentence
insertion, focus, superscript/150% styling, subsequent normal typing, selection,
replacement editing, undo/redo, Unicode HTML export, and PNG rendering. The PNG
was visually inspected, including the macron and vertical offset. Test setup
separates actions using the history plugin's existing 500ms typing-group window.

All changes remain local. Nothing was staged, committed, pushed, or deployed.
