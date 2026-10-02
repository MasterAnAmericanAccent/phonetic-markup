# M1 automated acceptance report

**Date:** 2026-10-01  
**Source of truth:** `docs/M1_REQUIREMENTS.md` (30 requirements). The broader backlog was not tested.  
**Production behavior was not changed to make a test pass.**

This report records what the automated checks actually did. A requirement is not treated as accepted only because `npm test` exits 0. Each criterion below was exercised by a browser test, an integration test against the real Tiptap editor, an export artifact, or a schema test.

Open client items remain open for requirement 10. Requirement 14 is confirmed: the user-facing name is Alternative, the stored mark remains `alternate`, and the treatment is blue-ish.

## How to re-run

```text
npm test
npm run test:e2e
npm run typecheck
npm run lint
npm run build
```

`npm run test:e2e` starts the real Vite app and drives it in Chrome. Unit and integration tests use the real editor in Vitest, not a mock editor.

## Requirement summary

| # | Requirement | Criteria | Method | Result | Evidence | Notes |
|---|---|---|---|---|---|---|
| 1 | Editable text | 6/6 | E2E | PASS | `e2e/m1-acceptance.spec.ts` requirement 1 | Click, type, delete, mouse-select a word, range select, copy, cut, paste, toolbar undo/redo, and Ctrl+Z / Ctrl+Y. No edit-mode control. Markup outside the edit stayed on `alpha`. |
| 2 | Paste external text | 5/5 | E2E + integration | PASS | E2E requirement 2; `src/editor/paste.test.ts` | Empty document, paste at the cursor, `naïve`, ə, and `a` + U+0301. HTML clipboard styling was dropped. Pasted text accepted another character. |
| 3 | Edit text after markup | 6/6 | E2E + integration | PASS | E2E requirements 3 and 6; `src/editor/annotations.test.ts` | Insert before, inside, and after a mark. Partial delete. Undo restored the annotation with the text. |
| 4 | Paragraphs and line breaks | 5/5 | E2E + integration | PASS | E2E requirement 4; `src/acceptance/m1Gaps.test.ts`; `src/editor/paste.test.ts` | A Discord-like payload with a blank line and a single newline kept 2 paragraphs and 1 hard break. A flattened Discord line stayed one paragraph. Breaks that are absent were not invented. |
| 5 | Text-bound annotations | 5/5 | E2E + integration | PASS | E2E requirements 5 and 7; `src/editor/annotations.test.ts` | After resize, scroll, zoom, and a font-size change, `[data-annotation="error"]` still contained `cat`, was inside the editor, and its position was `static`. |
| 6 | Stable markup after text edits | 5/5 | E2E + integration | PASS | E2E requirements 3 and 6; `src/editor/annotations.test.ts` | Insert and delete before a mark, edit another paragraph, partial delete, and full delete. No orphan `error` mark remained. |
| 7 | Stable markup during layout changes | 5/5 | E2E + export | PASS | E2E requirements 5 and 7; export tests | 1920, 900-wide, 150% zoom, and 32px/14px font. Exported HTML matched the current marks. |
| 8 | Multiple markup types | 4/4 | E2E + integration | PASS | E2E annotation actions; `src/editor/markupWorkspace.test.ts` | Error and Voicing on the same word. Removing Error left Voicing. Computed styles differed (background versus underline). |
| 9 | Remove markup independently | 4/4 | E2E + integration | PASS | E2E annotation actions; `src/editor/markupWorkspace.test.ts` | Text unchanged. Undo restored the removed mark. Redo removed it again. |
| 10 | UAlberta parity | 4/4 | E2E + documented checklist | PASS — IMPLEMENTED PARITY / CLIENT CONFIRMATION PENDING | E2E requirement 10; `docs/UALBERTA_PARITY.md` | Connect, Glide, Link, Blend, Stretch, Reduce, Stress, Strike Out, and Error were applied and removed. Draw, Erase, and legacy bugs stay excluded. Connect’s meaning, `Ɛə` (U+0190), and any extra Stretch/Reduce meaning are still open. |
| 11 | Error / correction | 4/4 | E2E | PASS | E2E annotation actions and layout test | Pink error treatment, removal, reflow, and editing. |
| 12 | Voicing | 5/5 | E2E + integration | PASS | E2E annotation actions; `src/editor/annotations/definitions.ts` exercised through the UI | Dedicated action, underline treatment, own mark name `voicing`, independent removal. |
| 13 | Nasal | 5/5 | E2E | PASS | E2E annotation actions | Overline treatment. Coexisted with Error. Nasal was removed and Error remained. |
| 14 | Additional non-red correction | 4/4 | E2E + integration | PASS | E2E annotation actions | User-facing name is Alternative. Stored mark remains `alternate`. Blue dotted border `#1d4ed8`, not the Error wash. |
| 15 | Extensible markup system | 4/4 | Integration | PASS | `src/acceptance/m1Gaps.test.ts` | A test-only `probe` mark was created with `createAnnotationMark` and applied without a new text node. Every registered type exports through one `<span data-annotation>` path. |
| 16 | IPA symbol palette | 4/4 | E2E | PASS | E2E requirements 16 and 17 | Vowels, Consonants, and Intonation tabs. Palette box stayed left of the editor. Symbols rendered as button text. |
| 17 | Insert IPA at cursor | 4/4 | E2E + integration | PASS | E2E requirements 16 and 17; `src/ipa/ipa.test.ts` | Cursor inside `popular` produced `popʊular`. Focus returned to the editor. Undo removed it. Redo restored it. |
| 18 | Unicode and diacritics | 6/6 | E2E + integration + export | PASS | E2E requirement 18 and export test; `src/ipa/ipa.test.ts`; `src/search/search.test.ts` | ʊ, ʌ, ɪ, ə, and `a` + U+0301 in the live passage. Search found ʊ. HTML and PNG exports kept IPA. Combining sequences were edited in the integration tests without splitting. |
| 19 | Contextual selection menu | 5/5 | E2E | PASS | E2E requirements 19 and 20 | Menu showed Error and Voicing. Escape left the selection in place. Moving the cursor hid the menu. Custom phonetic shortcuts are outside this 30-requirement file; standard undo, copy, and paste were used with the editor. |
| 20 | Live-coaching efficiency | 5/5 | E2E | PASS | E2E requirements 19 and 20; desktop layout tests | Select, then one Apply click. No dialog. Editor width stayed above 45% of 1920, 1440, and 1366. |
| 21 | Search | 5/5 | E2E + integration | PASS | E2E search test; `src/search/search.test.ts` | `cat` was `1 / 3`, then Next/Previous wrapped. `ʊ` was `1 / 2`. |
| 22 | Highlight all search matches | 5/5 | E2E + integration | PASS | E2E search test; `src/search/search.test.ts`; `src/export/export.test.ts` | Three `.search-match` nodes, one active. Clear removed them. Error remained. HTML export had no `search-match`. |
| 23 | PNG export | 5/5 | E2E artifact | PASS | E2E export test | Real PNG signature, non-zero size, width 760 or 1520 (document width, not the app shell). Pixel scan found error red and nasal purple, and no search blue. |
| 24 | Self-contained HTML export | 6/6 | E2E artifact | PASS | E2E export test; `src/export/export.test.ts` | One HTML file with a `<style>` block, no `<link>`, no `localhost`, no header or sidebar. Opened with `page.setContent`. Error text and ə rendered. |
| 25 | Preserve plain source text | 3/3 | E2E + integration | PASS | E2E export test; `src/document/document.test.ts`; `src/editor/markupWorkspace.test.ts` | Editor text contained the words and ə. It did not contain `annotation-error` or `data-annotation`. |
| 26 | Structured document representation | 6/6 | E2E schema + integration | PASS | E2E structured-state test; `src/document/document.test.ts` | Live schema includes the coaching marks plus `comment` and `researchMarker`. A comment body and research label round-tripped on the source text. There is no comments UI; that UI is outside this requirements file. |
| 27 | Future persistence readiness | 4/4 | E2E + integration | PASS | E2E cross workflow and structured-state test; `src/document/document.test.ts`; `src/acceptance/m1Gaps.test.ts` | Serialize/deserialize kept text, paragraphs, the hard break, IPA, and overlapping marks. Search text was not stored in the document JSON. |
| 28 | Accent Coach Bianca branding | 4/4 | E2E | PASS | E2E desktop layout tests | Header image is `brand-logo` (`1.svg`). Favicon is `acb-logo` (`5.svg`), yellow mark present, white canvas fill absent. Title and label are ACB / PHONETIC MARKUP. Page text has no UAlberta. Error text color was not white. |
| 29 | Desktop-first editor | 4/4 | E2E | PASS | E2E requirement 1 and the three viewport tests | 1920×1080, 1440×900, and 1366×768. Mouse and keyboard editing worked. No menu button. Strike Out label is one line. Sidebar tools sit beside the document. |
| 30 | Text-first interface | 5/5 | E2E | PASS | E2E desktop layout and selection-menu tests | Editor is the wide region. Header, sidebar, and toolbar boxes do not intersect it. The selection menu hid after the cursor moved. Comment placement UI is outside this requirements file. Markup colors were visible on the text. |

## Cross-requirement workflow

`e2e/m1-acceptance.spec.ts` “cross-requirement workflow” did all of the following in one Chrome session:

1. Cleared the document.
2. Pasted two paragraphs, a hard break, and ə.
3. Inserted ʊ inside `accent`.
4. Applied Error, Voicing, Nasal, Alternative, Connect, Glide, Link, Blend, Stretch, Reduce, Stress, and Strike Out to the same word.
5. Inserted text before the annotation, deleted part of the annotated range, undid, and redid.
6. Resized to 1366×768.
7. Searched ordinary text and ʊ, then cleared search.
8. Exported HTML and PNG.
9. Confirmed the editor JSON was unchanged by export.

The document stayed consistent. HTML contained ʊ, `annotation-error`, and `<br>`, and did not contain `search-match`. The PNG signature was valid.

## Failure summary

No acceptance criterion failed in the final run.

Earlier browser attempts failed because the test harness grouped rapid keystrokes into one undo step, dragged a selection past the intended word, and expected Alternative to use `text-decoration` when its treatment is a dotted bottom border. Those assertions were corrected in the harness. Production code was not changed.

## Automation coverage

| Item | Count |
|---|---|
| Total M1 requirements | 30 |
| Requirements fully PASS | 29 |
| Requirements FAIL | 0 |
| Requirements BLOCKED | 0 |
| Requirements awaiting client confirmation | 1 (10) |
| Total acceptance criteria | 142 |
| Acceptance criteria automatically tested | 142 |
| Acceptance criteria verified through an architecture or schema test | 8 (requirement 15’s four criteria, requirement 26’s comment and research-marker criteria, and requirement 27’s serializable comment/research representation) |
| Acceptance criteria not automatable | 0 |
| Acceptance criteria failed | 0 |

Those 8 architecture criteria are included in the 142 automated checks. They are not untested, and they are not a substitute for the browser checks on the other criteria.

**Automated acceptance coverage** = 142 / 142 × 100 = **100%**.

## Commands

| Command | Result |
|---|---|
| `npm test` | 98 passed (10 files) |
| `npm run test:e2e` | 17 passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run build` | passed |

The criterion-by-criterion matrix is in `docs/M1_ACCEPTANCE_MATRIX.md`.
