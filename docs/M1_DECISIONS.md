# M1 decisions

These are the working decisions for Milestone 1. Requirements in `docs/M1_REQUIREMENTS.md` win if this file conflicts with them.

## UI reference

draft phonetic markup.html is an approved visual/layout reference for M1, but does not define functional scope or production editor architecture.

Priority when sources disagree:

1. `docs/M1_REQUIREMENTS.md`
2. The approved architecture and this file
3. The UAlberta parity audit
4. `draft phonetic markup.html` for visual direction only

The production editor is React, TypeScript, Vite, and Tiptap / ProseMirror. Annotations are ProseMirror marks on text. The prototype's `contenteditable`, DOM Range, and `<mark>` approach is not used.

The workspace uses the draft’s left tool column and strong borders. The application shell now uses the client’s 2025 Honeybee palette. The header shows the supplied lockup (`src/assets/brand-logo.svg`). The browser icon is the speech-bubble mark (`src/assets/acb-logo.svg`). See Phase 6.

## Scope boundary

M1 is the 30 requirements in `docs/M1_REQUIREMENTS.md`.

Not in this milestone: authentication, accounts, database persistence, saved sessions or history, Discord, member management, hot-seat roulette, timers, recording, cloud storage, dictionary lookup, coach notes, chat, Mark All, Replace All, one-versus-all actions, hold-key interaction, and custom markup keyboard shortcuts.

The document model can represent comments and research markers so later milestones do not need a new editor. Phase 1 stores them as marks with attributes. There is no notes or chat UI.

## Provisional annotation styling

Error, Voicing, and Nasal styles are provisional. Alternative is confirmed. They can change without a document migration because the stored data is the mark type, not the color.

| Key | Display name | Provisional treatment | Role |
| --- | --- | --- | --- |
| `error` | Error | Pale red background, dark red text | M1 error / correction. Also the successor of legacy My Errors. |
| `voicing` | Voicing | Amber underline | New M1 type |
| `nasal` | Nasal | Purple overline | New M1 type |
| `alternate` | Alternative | Blue dotted underline (`#1d4ed8`) | A pronunciation or realization that differs from the primary target but is still acceptable, rather than an error. |

Colors live as variables in `src/styles/sharedCss.ts`. Class names live on the annotation definitions. Overlapping types use different decoration slots (background, underline, overline, dotted underline) so they stay distinguishable. This can change after Bianca's review.

Marks use `inclusive: false`. Typing at either edge does not grow the annotation. Typing inside it keeps the mark. Deleting part of a range leaves the mark on the rest. Deleting the whole range leaves no mark. The same type toggles. A different type does not remove it.

## Alternative identifier

The additional non-red category uses the internal identifier `alternate`.

The user-facing name is Alternative. William confirmed that name, the meaning, and a blue-ish treatment on 2026-10-02. It is its own mark type, not a free color and not Error. The stored key stays `alternate` so existing documents do not need a migration.

## Provisional branding

The client supplied the 2025 Honeybee palette. Those values live in `src/branding/brand.ts` and are applied to the application shell only. The product name is Accent Coach Bianca. `logoSrc` points at the supplied lockup (`src/assets/brand-logo.svg`). The browser icon is `src/assets/acb-logo.svg`. Document export does not include either file.

Shell roles use Eerie Black `#232323` for text, Amber `#FFB800` for hover, and Mustard `#FFE058` for the selected state and focus. The header label is Russet `#7A451B`. UAlberta branding is not used.

Phonetic annotation colors stay in `src/styles/sharedCss.ts` and are unchanged. Document export still uses that file, including the white document surface, and does not include the shell palette. The exported HTML title stays “Phonetic markup”.

## Paste

- A blank line (`\n\n`) starts a new paragraph.
- A single newline becomes a hard line break inside the paragraph.
- Extra blank lines collapse to one paragraph break. Empty wrapper paragraphs from nested HTML are not kept.
- A single trailing newline is dropped, because clipboards often add one. A leading blank line is kept, so pasting a new paragraph at the cursor still breaks the paragraph. Extra blank lines still collapse to one paragraph break.
- External fonts, colors, bold, and other inline formatting are dropped.
- Unicode is stored as pasted. The app does not rewrite NFC/NFD on input.
- A paste that originates inside this editor keeps marks, because ProseMirror copies the slice. External HTML is reduced to paragraphs, hard breaks, and text before parsing.
- If Discord has already removed line breaks, those breaks are not invented.

## Plain text and serialization

`serializeDocument()` / `deserializeDocument()` use version `1` and Tiptap JSON. Search highlights are not part of the document. There is no database.

`getPlainText()` walks the JSON. Paragraphs are separated by a blank line. Hard breaks are `\n`. Mark attributes, including a future comment body, are not written out as characters.

Comment and research-marker marks may carry `id` plus `body` or `label`. The mark range is the reference to the source text. They are excluded from the phonetic annotation registry, so they do not appear as coaching buttons.

## Legacy behavior left unresolved

See `docs/UALBERTA_PARITY.md`.

- Connect's coaching definition is only "highlight the selection."
- The vowel button `Ɛə` uses U+0190, not U+025B. Phase 3 stores that sequence and does not replace it.
- Stretch and Reduce are letter-spacing changes in the legacy app. Draw and Erase are canvas tools and are excluded.

## Phase 2 markup

The left panel and the selection menu both call `toggleAnnotationOnSelection`. There is one registry. A button applies a mark, and the same button removes only that mark. Other marks on the same text stay. Empty selections do nothing. The menu appears only while a range is selected, sits above the selection, and does not stay on screen after the selection is cleared.

Connect is the legacy `#fee9ab` highlight. No coaching definition was added.

Stretch is bold plus wider letter spacing. Reduce is tighter letter spacing. The legacy values were `8px` and `-2px`. Phase 2 stores the amount in `--annotation-stretch-spacing` and `--annotation-reduce-spacing` as `em`, so the spacing stays with the text when the font size changes. The values are not a claim that `0.28em` equals exactly 8 pixels.

Overlapping marks stay nested spans. Backgrounds are translucent so a highlight underneath can still show. Each type also keeps its own cue: underline, overline, dotted border, wavy or double underline, letter spacing, or strike-through. When Stretch and Reduce cover the same characters, both marks remain stored, and the inner span’s letter spacing is the one you see. This presentation is provisional.

Strike Out keeps the legacy diagonal tint and adds a line-through so the strike is still readable when another highlight covers it and when the line wraps.

The sample passage is still the initial document. Clear passage replaces it with an empty paragraph. That text is not saved.

## Phase 3 IPA

The temporary inventory is the verified UAlberta vowel list, consonant list, and the five intonation arrows. It lives in `src/ipa/ipaData.ts`. The draft’s smaller “IPA” tab is not used, because that list was not the verified inventory. The panel tabs are Vowels, Consonants, and Intonation.

`Ɛə` remains U+0190 followed by U+0259. Confirmation is still open. Replacing it means editing that one inventory entry.

Symbols and arrows are inserted with `insertContent` at the editor selection. They use the document font. The legacy 150% superscript style is not applied. No Unicode normalization is applied on insert, paste, or save.

A collapsed cursor that sits inside a grapheme cluster is moved to the end of that cluster before the symbol is inserted, so a combining mark is not split off its base. A non-empty selection is replaced by the symbol, the same as typing a character over a selection.

## Phase 4 search

Search is a ProseMirror plugin, `phoneticSearch`, registered as the `searchHighlight` extension. Matches are inline decorations. They are not annotation marks, they are not in the annotation registry, and they are not written into document JSON.

Setting, changing, or clearing the query dispatches a transaction with `addToHistory: false` and no document steps. Undo and redo do not treat search as an edit. Serialization and plain-text extraction read the document JSON, so search cannot appear there. Export renders that document, not the live editor DOM, so the decoration classes stay out of PNG and HTML.

An active query highlights every match. The active match uses `search-match-active` and is the one Previous and Next move. There is no separate Highlight All mode, and search never applies phonetic markup. Clearing the query removes the decorations immediately.

Matching is exact and case-sensitive on the stored UTF-16 text. `Ɛ` (U+0190) and `ɛ` (U+025B) stay different. The document is not normalized. A match may cross mark boundaries inside one paragraph. It does not cross a paragraph boundary or a hard break. The highlighted range is widened to the grapheme cluster when a match would otherwise start or end between a base character and a combining mark. That widening is only the decoration; the stored characters stay as they are.

When matches exist, the count reads `1 / 3`, using the active match. An unmatched query reads `No matches`. An empty query shows no count. Next on the last match returns to the first. Previous on the first match returns to the last. Editing the document while a query is active recomputes the matches and keeps the active match when that text is still there.

## Phase 5 export

PNG and HTML are both built from `renderDocumentHtml()`, which walks the document JSON. The live application DOM is not the source. The export contains the passage only: no header, search bar, search decorations, IPA palette, markup panel, selection menu, or buttons.

Both formats use `documentExportCss()`. That string inlines `tokensCss` and `annotationCss` from `src/styles/sharedCss.ts`, the same text the editor injects, plus a document shell. The shell sets an explicit white background from `--surface` and a fixed column width of 760px. The coach’s window width does not change the export. Empty paragraphs keep a line of height so a blank line does not collapse. The typeface is Segoe UI with a generic sans-serif fallback. No webfont is downloaded.

HTML is one file with a `<style>` block and no script. Text is escaped. Annotation spans use only registry class names and keys. Comment and research-marker attributes are not written out; their text still is. Opening the file does not need the application, Vite, or localhost.

PNG parses that HTML and mounts only the document article off-screen, then paints it with `html2canvas`. An SVG foreignObject was tried first and not kept: in this browser the resulting canvas is tainted, so the PNG cannot be saved. `html2canvas` paints the document element directly. The canvas background is white. The capture uses the document’s full scroll height, not the visible editor viewport. The preferred scale is 2. If that scale would pass 16384 pixels on either edge, the scale drops to 1. If the document is still taller or wider than 16384 pixels, export stops with “This passage is too long to export as one PNG.” It does not crop. A failed export does not change the document, the marks, or the search query. Other failures show “PNG export failed.” and not a stack trace.

Unicode is copied as stored. Export does not normalize. `getPlainText()` is unchanged and still omits mark names, class names, and comment metadata.

Downloads are named `phonetic-markup.html` and `phonetic-markup.png`.

## Phase 6 shell

The header shows the complete supplied `1.svg` lockup, with Phonetic Markup directly underneath. Hover is Amber and the selected state is Mustard. The browser title stays ACB Phonetic Markup. The shell colors are the client Honeybee palette. A later visual pass uses the Canva mockup for spacing and control styling: warm hairline borders (`#dfd6cb`, `#cfc2b4`), a near-white control surface, and a compact 225px sidebar. Those neutrals are shell-only. Annotation colors are unchanged. Desktop layout keeps the tools in the header and the left column at normal widths. Below 860px the column stacks above the passage and is limited to about 42% of the viewport so the text stays reachable. Common controls are not placed in a hamburger menu.

The editor opens on the example passage in `src/document/layoutFixture.ts` so a review can see marks immediately. Clear passage replaces it with one empty paragraph. Refreshing the page shows the example again. Nothing is written to storage. The passage has no instructional notice above it, and the sidebar has no instruction box between the IPA palette and Feedback.

## Rich-text toolbar

The toolbar above the passage is an intentional Milestone 1 enhancement. It is not a copy of the UAlberta toolbar, and it does not replace the IPA palette or the phonetic markup controls.

Standard formatting uses Tiptap nodes and marks: paragraph (shown as Normal), heading levels 1–3, bold, italic, underline, `textStrike`, left/center/right/justify alignment, bullet list, ordered list, and blockquote. Phonetic annotations stay on their own marks. Standard strikethrough is `textStrike`. Phonetic Strike Out remains `strike`. Clear formatting removes only the standard formatting. External paste still reduces clipboard HTML to paragraphs, hard breaks, and text.

Keyboard shortcuts that ship with those Tiptap extensions, such as Ctrl+B, Ctrl+I, Ctrl+U, and undo, are available. There are no custom phonetic-markup shortcuts.

## Example passage

The screen opens on a short passage that already contains provisional marks. It is example content for review, not saved session data. Clear passage removes it.
