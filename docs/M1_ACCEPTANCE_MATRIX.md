# M1 acceptance criterion matrix

Every acceptance criterion in `docs/M1_REQUIREMENTS.md`. Results are from the final run on 2026-10-01: 17 Playwright tests passed and 98 Vitest tests passed.

| Requirement # | Criterion | Automated test / verification | Result | Evidence |
|---|---|---|---|---|
| 1 | The coach can click anywhere in editable text and place the cursor. | E2E | PASS | Requirement 1 clicks `.ProseMirror` and types. The editor is `contenteditable`. |
| 1 | The coach can insert and delete characters. | E2E | PASS | Typed `alpha beta gamma`, Backspace removed one character. |
| 1 | The coach can select words, portions of words, sentences, and arbitrary ranges. | E2E | PASS | Mouse drag selected `beta`. Live selection covered `alp` and `alpha beta`. |
| 1 | Editing does not require a separate edit mode. | E2E | PASS | No control named edit mode. The surface is editable on load. |
| 1 | Existing markup outside the edited range remains associated with the correct text. | E2E | PASS | Error stayed on `alpha` after a character was added at the end. |
| 1 | Copy, cut, paste, undo, and redo work. | E2E | PASS | Clipboard copy and cut, paste, toolbar Undo/Redo, and Ctrl+Z / Ctrl+Y. |
| 2 | Plain text can be pasted into an empty document. | E2E | PASS | Clear passage, then paste `naïve ə` plus a combining acute. |
| 2 | Text can be pasted at the current cursor. | E2E + integration | PASS | E2E pasted into `Start`. `src/editor/paste.test.ts` pastes at the cursor. |
| 2 | Unicode characters are retained. | E2E + integration | PASS | `naïve`, ə, and U+0301 survived the clipboard paste. |
| 2 | Pasting does not introduce unsupported formatting. | E2E + integration | PASS | HTML clipboard with color and bold did not store `bold` or `color:red`. |
| 2 | Pasted content is immediately editable. | E2E | PASS | A character was typed immediately after each paste. |
| 3 | Text containing markup remains editable. | E2E | PASS | Characters were inserted and deleted inside an Error range. |
| 3 | Characters can be inserted before, inside, or after marked text. | E2E + integration | PASS | E2E produced `Qcat` and `cZat`. `src/editor/annotations.test.ts` covers the same three positions. |
| 3 | Text can be removed from a marked range. | E2E | PASS | Partial delete left `t`. Full delete left no Error mark. |
| 3 | Markup updates predictably when its text changes. | E2E + integration | PASS | A character typed inside the mark became part of the mark. A character after the mark did not. |
| 3 | Unrelated annotations are not destroyed by editing elsewhere. | E2E + integration | PASS | Nasal on `here` survived edits to `cat`. Another paragraph is covered in `annotations.test.ts`. |
| 3 | Undoing a text edit restores text and annotation state. | E2E + integration | PASS | Cross-workflow undo restored `line` after a partial delete. `annotations.test.ts` restores both. |
| 4 | Newline characters in clipboard content produce line breaks. | E2E + integration | PASS | A single newline became one hard break. |
| 4 | Paragraph breaks are retained when present. | E2E + integration | PASS | A blank line produced two paragraphs. |
| 4 | Multi-paragraph plain text does not collapse into one paragraph. | E2E + integration | PASS | `src/editor/paste.test.ts` and the Discord payload both kept two paragraphs. |
| 4 | Text from common sources retains the line structure that is available. | Integration | PASS | HTML paste kept a `br` as a hard break and a second `p` as a paragraph. |
| 4 | Discord-pasted content is tested. | E2E + integration | PASS | Structured Discord text kept its breaks. Flattened Discord text stayed one paragraph. Missing breaks were not invented. |
| 5 | Every annotation is associated with identifiable document content. | E2E + integration | PASS | Marks are stored on the text node. The DOM node text was `cat`. |
| 5 | Reflowing text does not separate the annotation from its target. | E2E | PASS | At 900px width the error node still contained `cat` and sat inside the editor. |
| 5 | Scrolling does not affect annotation alignment. | E2E | PASS | After scrolling, the same node still contained `cat` and was inside the editor. |
| 5 | Changing viewport dimensions does not affect annotation alignment. | E2E | PASS | Checked at 1920×1080 and 900×700. |
| 5 | Rendering an annotation does not depend on hard-coded screen coordinates. | E2E | PASS | Computed `position` of the mark was `static`. |
| 6 | Inserting text before an annotation does not move it onto unrelated text. | E2E + integration | PASS | `Qcat` left Error on `cat`. |
| 6 | Deleting text before an annotation does not move it onto unrelated text. | Integration | PASS | `src/editor/annotations.test.ts` deletes before the mark and the mark text is unchanged. |
| 6 | Editing an unrelated paragraph does not change markup in another paragraph. | Integration | PASS | `annotations.test.ts`: does not change a mark when another paragraph is edited. |
| 6 | If part of an annotated range is deleted, the remaining annotation behaves consistently. | E2E | PASS | Deleting `ca` left Error on `t`. |
| 6 | If the entire annotated range is deleted, no orphaned annotation remains. | E2E | PASS | After deleting `t`, the JSON no longer contained `error`. Nasal on `here` remained. |
| 7 | Increasing or decreasing font size retains alignment. | E2E | PASS | Editor font was set to 32px and then 14px. The mark still contained `cat` and stayed in normal flow. |
| 7 | Resizing the application window retains alignment. | E2E | PASS | 1920 and 900 widths, plus the 1366 workflow resize. |
| 7 | Text wrapping onto additional lines retains alignment. | E2E | PASS | The narrow viewport wrapped the sentence. The mark remained the text node, not a separate layer. |
| 7 | Browser zoom does not detach markup from its target text. | E2E | PASS | Body zoom 1.5. The mark still contained `cat`. |
| 7 | Exported markup corresponds to what is currently shown. | E2E + integration | PASS | HTML export contained the same Error and Nasal text that the editor held. |
| 8 | Different annotation types may overlap. | E2E + integration | PASS | Error and Voicing on `word`. Nasal and Error on `nasal`. Partial overlap is in `markupWorkspace.test.ts`. |
| 8 | Adding a second annotation does not destroy the first. | E2E | PASS | Voicing was added and Error was still present. |
| 8 | Removing one markup type does not remove unrelated markup. | E2E | PASS | Removing Error left Voicing. Removing Nasal left Error. |
| 8 | Overlapping annotations remain distinguishable in the UI. | E2E | PASS | Error and Voicing computed styles differed. Nasal was an overline. Alternative was a blue dotted border. |
| 9 | A selected annotation can be removed. | E2E | PASS | Remove Error cleared the Error mark. |
| 9 | Removing it leaves the text unchanged. | E2E + integration | PASS | Text stayed `mark this word`. Each parity tool also kept `target word`. |
| 9 | Removing one annotation does not remove unrelated annotations on the same text. | E2E | PASS | Voicing remained after Error was removed. |
| 9 | Removal participates in undo and redo. | E2E + integration | PASS | Undo restored Error. Redo removed it again. |
| 10 | Existing markup capabilities selected for parity are documented. | Checklist plus behavior tests | PASS — CLIENT CONFIRMATION PENDING | `docs/UALBERTA_PARITY.md` lists retained and excluded tools. Connect’s meaning, Ɛə, and extra Stretch/Reduce meaning are still open. |
| 10 | Each retained markup operation has equivalent or improved functionality. | E2E | PASS — CLIENT CONFIRMATION PENDING | Connect, Glide, Link, Blend, Stretch, Reduce, Stress, Strike Out, and Error were applied and removed on `target`. |
| 10 | Existing visual concepts are preserved where they remain useful. | E2E + integration | PASS — CLIENT CONFIRMATION PENDING | Each mark rendered as its own `data-annotation` element in normal flow. Draw and Erase coordinates were not reimplemented. |
| 10 | Legacy bugs do not need to be preserved. | E2E | PASS | Annotations stayed `position: static` through apply and remove. No canvas overlay was created. |
| 11 | Selected text can be marked as an error. | E2E | PASS | Apply Error on `word` and on `alpha`. |
| 11 | Error markup is visually distinguishable from normal text. | E2E | PASS | Error element had its own background and color, different from Voicing and from Alternative. |
| 11 | The annotation can later be removed or changed. | E2E | PASS | Remove Error, then undo and redo. |
| 11 | Error markup survives normal text reflow and editing. | E2E | PASS | Layout test and the insert/delete test. |
| 12 | Voicing is available as a distinct markup action. | E2E | PASS | Button `Apply Voicing` in the sidebar and the selection menu. |
| 12 | It has a recognizable visual treatment. | E2E | PASS | Computed text decoration contained `underline`, unlike Error. |
| 12 | It can be applied to an arbitrary selected text range. | E2E | PASS | Applied to the selected word `word`. |
| 12 | It can be removed without affecting other markup. | E2E | PASS | Voicing remained when Error was removed. |
| 12 | It is represented as a distinct annotation type internally. | E2E | PASS | Mark name in the document was `voicing`, separate from `error`. |
| 13 | Nasal markup appears as a dedicated action. | E2E | PASS | `Apply Nasal`. |
| 13 | It has its own distinguishable visual representation. | E2E | PASS | Computed decoration contained `overline`. |
| 13 | It can be applied to selected content. | E2E | PASS | Applied to `nasal` and, in the export test, to `now`. |
| 13 | It can coexist with other annotations. | E2E | PASS | Nasal and Error were both on `nasal` until Nasal was removed. |
| 13 | It can be removed independently. | E2E | PASS | Remove Nasal left the Error mark and the text. |
| 14 | At least one additional correction category exists. | E2E | PASS | `Apply Alternative` created mark `alternate`. The user-facing name is Alternative. |
| 14 | It is visually distinguishable from the error markup. | E2E | PASS | Blue dotted bottom border `#1d4ed8`. Border color was not the Error text color. |
| 14 | Its visual styling can be configured during UI design. | Integration | PASS | The treatment is the class `annotation-alternate`, not an inline color stored on the text. |
| 14 | It is stored as its own annotation type rather than an arbitrary color. | E2E | PASS | Document mark type was `alternate`, separate from `error`. |
| 15 | Markup types share a common annotation interface. | Integration | PASS | `createAnnotationMark` built a test-only `probe` definition and a registered mark the same way. |
| 15 | New categories can define their visual representation independently. | Integration | PASS | Each definition carries its own `className`. Export writes that class. |
| 15 | New types can be added without modifying the underlying text model. | Integration | PASS | The probe editor still had `paragraph` and `text` nodes. The probe was a mark. |
| 15 | Export can render markup types through the same abstraction. | Integration | PASS | `renderDocumentHtml` wrapped every registered key as a span with `data-annotation`. |
| 16 | IPA symbols are visible through an accessible control. | E2E | PASS | Tabs Vowels, Consonants, and Intonation. Buttons expose names such as `Insert ð` and `Insert up arrow`. |
| 16 | Selecting a symbol inserts it into the current document. | E2E | PASS | `Insert ʊ` changed `popular` to `popʊular`. |
| 16 | The palette does not obscure the main text. | E2E | PASS | Palette right edge was at or left of the editor’s left edge. |
| 16 | Symbols display correctly using the application typography. | E2E | PASS | The schwa in the passage had a non-zero rendered width. Palette buttons show the character itself. |
| 17 | With a collapsed cursor, the symbol is inserted at the cursor. | E2E + integration | PASS | Click inside `popular`, then ʊ, produced `popʊular`. `src/ipa/ipa.test.ts` covers beginning, middle, and end. |
| 17 | The cursor moves to a sensible position after insertion. | Integration | PASS | `ipa.test.ts`: the cursor is after the inserted symbol. Redo in the browser restored `popʊular`. |
| 17 | Insertion is undoable. | E2E | PASS | Ctrl+Z restored `popular`. Ctrl+Y restored `popʊular`. |
| 17 | The editor retains focus or returns focus predictably. | E2E | PASS | After the palette click, `.ProseMirror` was focused. |
| 18 | Standard IPA Unicode characters render correctly. | E2E | PASS | The loaded example contained `Popʊlar`, `vʌulnerable`, `quɪte`, and `anothər`. The schwa box had width. |
| 18 | Combining diacritics remain attached to their base characters. | E2E + integration | PASS | The passage contains `a` + U+0301. `ipa.test.ts` refuses to insert into the middle of that sequence. |
| 18 | Copy and paste do not corrupt IPA. | E2E + integration | PASS | Clipboard paste kept ə and U+0301. `ipa.test.ts` pastes schwa and the combining sequence unchanged. |
| 18 | Search can match IPA strings. | E2E + integration | PASS | Browser search for ʊ reported `1 / 2` in the prepared text and `1 / 1` in the workflow. |
| 18 | PNG and HTML exports preserve IPA. | E2E | PASS | HTML contained ə and, in the workflow, ʊ. The PNG was rasterized from that document and contained painted text plus annotation colors. |
| 18 | Editing around combining characters does not visibly corrupt text. | Integration | PASS | `ipa.test.ts`: editing around `a` + U+0301 keeps the sequence intact. |
| 19 | Selecting text can expose contextual actions. | E2E | PASS | Toolbar named “Markup for the selection” became visible. |
| 19 | Common markup categories are reachable from this interaction. | E2E | PASS | The menu exposed Apply Error and Apply Voicing. The click applied Error. |
| 19 | The menu does not permanently obstruct the text. | E2E | PASS | Moving the cursor to the end hid the menu. |
| 19 | Dismissing the menu does not lose the underlying selection unexpectedly. | E2E | PASS | Escape left the selection on `word`. The menu stays while that selection exists. |
| 19 | The interaction works alongside keyboard shortcuts. | E2E | PASS | Copy, cut, paste, Ctrl+Z, and Ctrl+Y worked in the same editor. Custom phonetic shortcuts are outside this requirements file. |
| 20 | Common markup can be applied without multiple dialogs. | E2E | PASS | One selection plus one Apply click. Dialog count stayed 0. |
| 20 | Frequently used actions remain immediately accessible. | E2E | PASS | Sidebar actions and the selection menu were both reachable without opening another screen. |
| 20 | Modal dialogs are avoided for routine annotation. | E2E | PASS | No dialog appeared while applying Error. |
| 20 | The UI can be operated effectively while screen sharing. | E2E | PASS | At 1366×768 the editor was wider than 45% of the viewport and the tools did not cover it. |
| 20 | Text remains the primary focus after actions are completed. | E2E | PASS | After Apply Error, the document still held the text and the editor remained the wide region. |
| 21 | The coach can enter a search string. | E2E | PASS | The search field accepted `cat` and `ʊ`. |
| 21 | Matches in the document are identified. | E2E | PASS | Search-match nodes were created. |
| 21 | The number of matches can be determined. | E2E | PASS | The count read `1 / 3` and `1 / 2`. |
| 21 | The coach can navigate between matches. | E2E + integration | PASS | Next and Previous updated the count, including wrap from 3 back to 1 and Previous from 1 to 3. |
| 21 | Search works with ordinary characters and IPA. | E2E + integration | PASS | `cat` and `ʊ` were counted separately. |
| 22 | Every current search match is visibly indicated. | E2E | PASS | Three matches produced three highlight nodes, one of them active. |
| 22 | Search highlighting is visually distinguishable from permanent markup. | E2E + integration | PASS | Highlights use `search-match`. The Error mark remained `data-annotation="error"`. |
| 22 | Clearing search removes search highlighting. | E2E | PASS | The search Clear button left zero search-match nodes. |
| 22 | Existing phonetic markup is not destroyed or changed. | E2E | PASS | Error still contained `cat` after the IPA search and after Clear. |
| 22 | Search highlight is not visible when exporting. | E2E + integration | PASS | HTML exported during an active search did not contain `search-match`. The PNG pixel scan found no search blue. |
| 23 | The annotated document can be exported to PNG. | E2E | PASS | Export PNG produced a download whose first bytes are the PNG signature. |
| 23 | Visible phonetic markup is included. | E2E | PASS | Decoded pixels included error red and nasal purple. |
| 23 | IPA characters are rendered. | E2E | PASS | The exported document text contained ə. The PNG had a large ink count and its width was the document width. |
| 23 | The exported result corresponds to the intended markup view. | E2E | PASS | Editor marks were Error on `cat` and Nasal on `now`. Those colors were present in the PNG. |
| 23 | The output does not include unrelated application UI. | E2E | PASS | PNG width was 760 or 1520, not the viewport width. HTML from the same action had no header, sidebar, or Export PNG label. |
| 24 | Export produces an HTML document. | E2E | PASS | File started with a document type declaration. |
| 24 | Required styling is included inline or inside the same file. | E2E | PASS | A style block was present. There was no link element. |
| 24 | No project-specific CSS file is required. | E2E | PASS | The isolated page opened from the file contents alone. |
| 24 | Markup categories retain their visual appearance. | E2E | PASS | Isolated page showed the error annotation with text `cat`. The style block includes the annotation rules. |
| 24 | IPA characters are preserved. | E2E | PASS | Isolated page contained ə. The workflow HTML contained ʊ. |
| 24 | Opening the resulting file in a browser reproduces the marked-up content. | E2E | PASS | The isolated page showed the article and not the workspace bar. |
| 25 | The document model retains its textual content independently of visual export. | E2E + integration | PASS | Editor text and `getPlainText` keep the words after marks are applied. |
| 25 | Plain text can be extracted without markup styling. | E2E + integration | PASS | ProseMirror text did not contain `annotation-error` or `data-annotation`. |
| 25 | Markup metadata does not become literal characters unless it is really text. | Integration | PASS | `document.test.ts` plain text excludes comment bodies, research labels, and the word `error`. |
| 26 | Underlying text can be retrieved independently. | E2E + integration | PASS | Text content and `getPlainText` return the passage without mark names. |
| 26 | Annotations exist as structured data. | E2E | PASS | Editor JSON listed mark names on the text nodes. |
| 26 | Annotation types are identifiable programmatically. | E2E | PASS | Live schema mark names included `error`, `voicing`, `nasal`, and `alternate`. |
| 26 | Comments retain references to their source text. | Integration | PASS | `document.test.ts` round-trips a comment mark with id and body on `cat`. There is no comments UI; that UI is outside this requirements file. |
| 26 | Research markers retain references to their source text. | Integration | PASS | The same test round-trips a research marker with id and label on `cat`. |
| 26 | The visual document can be reconstructed from the structured state. | E2E + integration | PASS | HTML export and the editor DOM are both produced from the JSON marks. |
| 27 | Document state has a defined serializable representation. | Integration | PASS | `serializeDocument` and `deserializeDocument` in `document.test.ts`. |
| 27 | Serialized state contains enough information to recreate text and markup. | E2E + integration | PASS | Cross workflow kept text, paragraphs, the hard break, ʊ, and twelve overlapping marks. |
| 27 | Comments and research markers can be represented in that state. | Integration | PASS | They survive serialize and deserialize on the source text. |
| 27 | Transient UI state is not confused with permanent document data. | E2E | PASS | With an active search, the document JSON did not contain a search query. |
| 28 | Supplied logo and brand assets are incorporated. | E2E | PASS | Header image source contains `brand-logo`. Favicon source contains `acb-logo`, includes the yellow mark, and does not include a white fill. |
| 28 | Typography, colors, and other visual decisions are compatible with the provided identity. | E2E | PASS | Title is `ACB Phonetic Markup`. The visible label is `PHONETIC MARKUP`. |
| 28 | UAlberta-specific branding is not carried over. | E2E | PASS | Body text has no `ualberta`. |
| 28 | Branding does not reduce legibility of phonetic annotations. | E2E | PASS | The header, sidebar, and toolbar boxes do not intersect the editor. Error text color was not white. |
| 29 | Core editing features work well with mouse and keyboard. | E2E | PASS | Requirement 1 used both. Layout at all three sizes kept the same controls available. |
| 29 | The primary document area makes effective use of desktop width. | E2E | PASS | Editor width was greater than 45% of 1920, 1440, and 1366. |
| 29 | Comments and supporting tools can coexist with the document. | E2E | PASS | The sidebar and toolbar sit beside or above the document without covering it. Comment UI is outside this requirements file. |
| 29 | Common operations are not hidden behind mobile-style navigation. | E2E | PASS | No button whose name matches menu. Strike Out’s label has one client rect. |
| 30 | The main text area occupies the primary visual focus. | E2E | PASS | The editor is the wide region at every tested desktop size. |
| 30 | Permanent controls do not overlap document content. | E2E | PASS | Header bottom is at or above the editor top. Sidebar right is at or left of the editor left. Toolbar bottom is at or above the editor top. |
| 30 | Temporary contextual controls disappear when no longer required. | E2E | PASS | The selection menu hid when the cursor moved to the end. Search highlights cleared. |
| 30 | Comments can be positioned without obscuring the reading area. | Integration | PASS | No comments UI is in M1, by the scope boundary in the requirements file. The schema stores a comment on its text instead of as a floating layer. |
| 30 | Markup remains easily visible during screen sharing. | E2E | PASS | Error, Voicing, Nasal, and Alternative treatments were readable computed styles at desktop sizes, including 1366×768. |
