# Milestone 1 acceptance checklist

Audit date: 2026-09-29. Scope is `docs/M1_REQUIREMENTS.md` only.

The later automated run is `docs/M1_ACCEPTANCE_REPORT.md` and `docs/M1_ACCEPTANCE_MATRIX.md` (2026-10-01). Use those files for the current pass/fail record. This checklist keeps the earlier file-level notes.

Statuses:

- **PASS** — the acceptance criteria were checked against the current code, tests, or a browser pass.
- **PASS — PROVISIONAL VISUAL** — the behavior is in place. The final color or treatment is still a client choice, and the current look is the agreed temporary one.
- **PASS — AWAITING CLIENT CONFIRMATION** — the agreed temporary behavior is in place, and a named client decision is still open.
- **BLOCKED** — not used. No requirement is blocked.

## 1. Editable text

**Status:** PASS

**Files:** `src/editor/PhoneticEditor.tsx`, `src/editor/createPhoneticExtensions.ts`, `src/editor/editing.test.ts`

**Criteria:** The passage can be typed, selected, copied, cut, pasted, undone, and redone. Browser QA typed into the passage, used undo, and confirmed the text changed and then restored. Automated tests cover typing, undo, and redo.

**Manual QA:** Typing and undo in the browser. Copy, cut, and paste use the browser editing surface; paste structure is covered by tests.

**Open:** None.

## 2. Paste external text

**Status:** PASS

**Files:** `src/editor/paste.ts`, `src/editor/paste.test.ts`

**Criteria:** Plain text and HTML paste keep paragraphs and hard breaks, keep Unicode, and drop external inline formatting. Internal editor paste keeps marks. Tests cover those cases.

**Manual QA:** Covered by the paste suite. The browser pass did not re-paste a Word document.

**Open:** None.

## 3. Edit text after markup

**Status:** PASS

**Files:** `src/editor/annotations.test.ts`, `src/editor/editing.test.ts`

**Criteria:** Text inside, beside, and through a mark can be edited. Typing at a mark edge does not grow it. Typing inside keeps it. Tests cover those cases.

**Open:** None.

## 4. Preserve paragraphs and line breaks

**Status:** PASS

**Files:** `src/editor/paste.ts`, `src/document/plainText.ts`, `src/editor/paste.test.ts`, `src/document/document.test.ts`

**Criteria:** A blank line is a paragraph. A single line break is a hard break. Plain text uses a blank line between paragraphs and `\n` for a hard break. Tests cover paste and plain-text extraction.

**Open:** None.

## 5. Text-bound annotations

**Status:** PASS

**Files:** `src/editor/annotations/`, `src/styles/sharedCss.ts`

**Criteria:** Marks are ProseMirror marks on text. They are not canvas coordinates and not fixed X/Y overlays. Browser QA confirmed an Error mark stayed on its word.

**Open:** None.

## 6. Stable markup after text edits

**Status:** PASS

**Files:** `src/editor/annotations.test.ts`, `src/editor/markupWorkspace.test.ts`

**Criteria:** Partial deletion keeps the mark on the remainder. Full deletion removes it. Undo restores text and marks together. Tests cover this.

**Open:** None.

## 7. Stable markup during layout changes

**Status:** PASS

**Files:** annotation marks in `src/editor/annotations/`, styles in `src/styles/sharedCss.ts`

**Criteria:** Marks are attached to characters, so wrapping, panel stacking, and browser zoom do not store a new position. Browser QA at a wide window, a 1100px window, and 150% zoom still showed the Error mark on the same word.

**Open:** None.

## 8. Multiple markup types on the same text

**Status:** PASS

**Files:** `src/editor/markupWorkspace.test.ts`, `src/editor/annotations/definitions.ts`

**Criteria:** Different types overlap. The same type toggles. Tests cover overlap, and the example passage shows Error and Voicing together on “pronouncing”.

**Open:** None for the behavior. Visual stacking of Stretch and Reduce is noted under requirement 10.

## 9. Remove markup independently

**Status:** PASS

**Files:** `src/editor/commands/markupActions.ts`, `src/editor/markupWorkspace.test.ts`

**Criteria:** Removing one type leaves the others. Tests cover independent removal.

**Open:** None.

## 10. Reimplement existing UAlberta markup functionality

**Status:** PASS — AWAITING CLIENT CONFIRMATION

**Files:** `src/editor/annotations/definitions.ts`, `docs/UALBERTA_PARITY.md`, `src/editor/markupWorkspace.test.ts`

**Criteria:** Connect, Glide, Link, Blend, Stretch, Reduce, Stress, and Strike are separate marks with the verified legacy visuals. Draw and Erase are excluded. Browser QA applied Connect from the selection menu and removed it from the panel.

**Open:** Connect’s coaching meaning is not defined. Stretch and Reduce are letter-spacing only, which matches the legacy control, and no extra meaning has been confirmed.

## 11. Error / correction markup

**Status:** PASS — PROVISIONAL VISUAL

**Files:** `src/editor/annotations/definitions.ts`, `src/styles/sharedCss.ts`

**Criteria:** Error is its own mark, pale red background and dark red text. It also covers the legacy My Errors role. The color is provisional.

**Open:** Final Error color.

## 12. Voicing markup

**Status:** PASS — PROVISIONAL VISUAL

**Files:** `src/editor/annotations/definitions.ts`, `src/styles/sharedCss.ts`

**Criteria:** Voicing is its own mark with an amber underline. The color is provisional.

**Open:** Final Voicing treatment.

## 13. Nasal markup

**Status:** PASS — PROVISIONAL VISUAL

**Files:** `src/editor/annotations/definitions.ts`, `src/styles/sharedCss.ts`

**Criteria:** Nasal is its own mark with a purple overline. The color is provisional.

**Open:** Final Nasal treatment.

## 14. Additional non-red correction markup

**Status:** PASS

**Files:** `src/editor/annotations/definitions.ts`, `src/styles/sharedCss.ts`

**Criteria:** The user-facing name is Alternative. It is its own mark, stored as `alternate`, with a blue dotted underline. It is not a free color picker and it is not Error.

**Open:** None. William confirmed the name, the acceptable-but-different meaning, and the blue-ish treatment on 2026-10-02.

## 15. Extensible markup system

**Status:** PASS

**Files:** `src/editor/annotations/registry.ts`, `src/editor/annotations/types.ts`, `src/editor/selection/MarkupPanel.tsx`

**Criteria:** The panel, selection menu, and export class names come from the registry. Adding a mark is a definition change, not a new editor.

**Open:** None.

## 16. IPA symbol palette

**Status:** PASS — AWAITING CLIENT CONFIRMATION

**Files:** `src/ipa/ipaData.ts`, `src/ipa/IpaPalette.tsx`, `src/ipa/ipa.test.ts`

**Criteria:** Vowels, consonants, and intonation are tabs. The inventory matches the verified legacy lists, including the unresolved `Ɛə` entry. Buttons have accessible names. Browser QA inserted schwa from the Vowels tab.

**Open:** `Ɛə` is U+0190 plus U+0259 until Bianca or William confirms it should be U+025B.

## 17. Insert IPA at cursor

**Status:** PASS

**Files:** `src/ipa/insertSymbol.ts`, `src/ipa/ipa.test.ts`

**Criteria:** Insertion uses the editor selection. A cursor inside a grapheme moves to the end of the cluster. A selection is replaced. Undo removes the insertion. Tests cover this. Browser QA inserted schwa and undid it.

**Open:** None.

## 18. Unicode and diacritic support

**Status:** PASS

**Files:** `src/ipa/insertSymbol.ts`, `src/editor/paste.ts`, `src/ipa/ipa.test.ts`, `src/search/search.test.ts`, `src/export/export.test.ts`

**Criteria:** Stored text is not NFC/NFD normalized. Combining marks stay on their base during insertion, search highlighting, and export. Tests cover schwa, `t` + U+032C, and a combining acute.

**Open:** The `Ɛə` code point is recorded under requirement 16. It is not normalized away.

## 19. Contextual selection menu

**Status:** PASS

**Files:** `src/editor/selection/SelectionMenu.tsx`, `src/editor/markupWorkspace.test.ts`

**Criteria:** The menu appears for a non-empty selection and is not shown for a caret. It uses the same actions as the panel. Browser QA opened it by selecting “accent” and closed it when the selection collapsed.

**Open:** None.

## 20. Live-coaching interaction efficiency

**Status:** PASS

**Files:** `src/editor/selection/MarkupPanel.tsx`, `src/editor/selection/MarkupButton.tsx`, `src/ipa/IpaPalette.tsx`

**Criteria:** Markup and IPA buttons prevent the default mouse down so the passage selection stays put. Repeated IPA insertion does not require reselecting the caret. This is the M1 efficiency scope. Custom shortcuts and hold-key are excluded.

**Open:** None.

## 21. Search document text

**Status:** PASS

**Files:** `src/search/findMatches.ts`, `src/search/SearchBar.tsx`, `src/search/search.test.ts`

**Criteria:** Search is case-sensitive and exact. Previous and Next wrap. No matches and an empty query are distinct. Search does not enter undo. Browser QA searched “accent”, moved to the next match, and cleared the query.

**Open:** None.

## 22. Highlight all search matches

**Status:** PASS

**Files:** `src/search/searchExtension.ts`, `src/styles/editor.css`

**Criteria:** An active query highlights every match. The active match is outlined. Highlights are decorations, not marks, and they are not exported. Browser QA showed more than one “accent” highlight, then none after Clear.

**Open:** None.

## 23. PNG export

**Status:** PASS

**Files:** `src/export/renderPng.ts`, `src/export/ExportActions.tsx`, `src/export/export.test.ts`

**Criteria:** PNG is painted from the document renderer, includes marks and IPA, excludes search, and does not crop. Scale is 2 until an edge would pass 16384 pixels. Browser QA downloaded a PNG while search was active; the preview showed the Error mark and no search wash. The editor text was unchanged.

**Open:** Passages taller than 16384 pixels at scale 1 cannot be exported as one PNG.

## 24. Self-contained HTML export

**Status:** PASS

**Files:** `src/export/documentHtml.ts`, `src/export/documentCss.ts`, `src/export/export.test.ts`

**Criteria:** One HTML file, inlined CSS, escaped text, no script, no app chrome, marks and IPA included, search excluded. Browser QA opened the download in an iframe and confirmed those points. The editor was unchanged.

**Open:** None.

## 25. Preserve plain source text

**Status:** PASS

**Files:** `src/document/plainText.ts`, `src/document/document.test.ts`, `src/export/export.test.ts`

**Criteria:** `getPlainText()` returns paragraphs and breaks without mark names or search query. Tests cover this, including after export.

**Open:** None.

## 26. Structured document representation

**Status:** PASS

**Files:** `src/document/serialize.ts`, `src/document/types.ts`, `src/document/document.test.ts`

**Criteria:** The editor state serializes to versioned JSON and deserializes back, including marks and hard breaks. Tests cover a round trip.

**Open:** None.

## 27. Prepare document model for future persistence

**Status:** PASS

**Files:** `src/document/serialize.ts`, `src/editor/extensions/futureMarks.ts`

**Criteria:** Document JSON is the persistence shape. Comment and research-marker marks can be stored and are not shown in the UI or written as export attributes. No database was added.

**Open:** None. Persistence itself is a later milestone.

## 28. Accent Coach Bianca branding

**Status:** PASS — AWAITING CLIENT CONFIRMATION

**Files:** `src/branding/brand.ts`, `src/styles/editor.css`, `src/editor/PhoneticEditor.tsx`, `index.html`

**Criteria:** The shell uses the light screenshot treatment, with Honeybee colors for interaction. The header shows the complete `1.svg` lockup and the label Phonetic Markup. Hover is Amber, selected controls are Mustard, and focus is Mustard. UAlberta branding is absent. Annotation colors are separate and were not recolored. Document export does not include the application shell or the logo.

**Open:** Final client approval of the shell. Annotation colors remain a separate confirmation.

## 29. Desktop-first editor

**Status:** PASS

**Files:** `src/styles/editor.css`, `src/editor/PhoneticEditor.tsx`

**Criteria:** At a wide desktop width the passage uses the remaining column, tools stay in the header and left panel, and nothing is behind a mobile menu. Mouse selection, markup, IPA, search, and export work together. At 1100px the tools wrap and the panel stays beside the passage. Below 860px the panel stacks above the passage and does not cover it. Browser QA checked about 1920px, 1400px at 150% zoom, 1100px, and 780px.

**Open:** None. A full phone layout is not required.

## 30. Text-first interface

**Status:** PASS

**Files:** `src/styles/editor.css`, `src/editor/selection/SelectionMenu.tsx`

**Criteria:** The passage is the largest region. The IPA palette and markup list sit in the side column. Search is one compact field. Export buttons are compact. The selection menu is absent when the caret is collapsed. There is no Coach Notes or Chat column. Browser QA confirmed the menu disappeared after the selection collapsed, and the passage remained readable at 150% zoom.

**Open:** None. Comment placement in the acceptance text is a later UI. The model can store a comment, and this milestone does not draw one.

## Sample passage

**Status:** PASS

The editor opens on `layoutFixture`. Clear passage removes that text. Refresh shows the example again. No storage was added. There is no notice above the passage and no instruction box in the sidebar.

## Rich-text toolbar enhancement

This is an intentional Milestone 1 enhancement. It does not change the 30 requirements above.

The toolbar above the passage provides paragraph and heading styles, bold, italic, underline, standard strikethrough, alignment, lists, blockquote, undo, redo, and clear formatting. Phonetic marks stay independent. Clear formatting does not remove them. `textStrike` is not the phonetic `strike` mark. Tests live in `src/editor/richText.test.ts`.
