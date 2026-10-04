# UAlberta phonetic markup parity

Audit date: 2026-09-27

Source: the live application at https://ualberta-cmput401.github.io/phonetic-markup/

The public GitHub repository for this project returns 404. Behavior below comes from using the live app and reading its published bundle (`static/js/main.61532b02.chunk.js`), including the About copy and the Draft.js `customStyleMap`. It does not come from the later HTML prototype.

The legacy editor is Draft.js. Most coaching marks are inline styles on text. Draw and Erase are a canvas painted with pointer coordinates over the editor. That canvas is the misalignment bug Milestone 1 must not reproduce. Text-bound marks in the new editor are ProseMirror marks, not a canvas and not fixed X/Y overlays.

Phase 2 implements the text-bound marks whose behavior was verified. Draw and Erase stay excluded.

| Legacy feature | What it does | M1 disposition | Status |
| --- | --- | --- | --- |
| Editable passage | Draft.js surface. Placeholder: "Drag and drop a file or start typing..." | Required. Replaced by the Tiptap document. | Implemented in Phase 1 |
| Vowels palette | Inserts a fixed symbol list at the cursor. See inventory below. | Required. | Implemented in Phase 3 from `src/ipa/ipaData.ts`. |
| Consonants palette | Inserts a fixed symbol list, including `t` + U+032C. | Required. Same data file. | Implemented in Phase 3. |
| Intonation arrows | Inserts ⇑ ⇓ ⇒ ⇗ ⇘ beside words. About text: click an arrow to add it. Styled at 150% bold while the insertion style is active, then the style override is cleared so later typing is normal. | Required as character insertion, not as a range mark. | Implemented in Phase 3 as normal document text. The 150% bold style is not copied. |
| Connect | Toggles a highlight on the selection. Color `#fee9ab`. Click again to remove. The legacy About text does not define a coaching meaning. | Required as its own mark. The highlight is unchanged. Confirmed meaning: Consonant to Consonant. | Implemented in Phase 2. Meaning confirmed 2026-10-02. |
| Glide | Toggles a highlight. Color `#73cad7`. About text: one word ends with a vowel sound and the next begins with a vowel sound, including /w/ and /y/. | Required as its own mark. Confirmed meaning: Vowel to Vowel. | Implemented in Phase 2. Meaning confirmed 2026-10-02. |
| Link | Toggles a highlight. Color `#adc4be`. About text: one word ends with a consonant and the next begins with a vowel, including /w/ and /y/. | Required as its own mark. Confirmed meaning: Consonant to Vowel. | Implemented in Phase 2. Meaning confirmed 2026-10-02. |
| Blend | Toggles a highlight. Color `#fea7a2`. About text: transition between two consonants quickly and smoothly. | Required as its own mark. Confirmed meaning: Assimilation. | Implemented in Phase 2. Meaning confirmed 2026-10-02. |
| Stretch | Button label Stretch. Internal style name `KEYWORD`. Increases letter spacing (`8`) and sets bold on the selection. Click again to remove. About text: make important words longer, clearer, louder, and with a pitch change. The control only changes letter spacing and weight. | Required as a text-bound mark. The letter-spacing treatment is unchanged. Confirmed meaning: lengthening stressed vowels in content words. | Implemented in Phase 2. Spacing uses `em`, not a fixed pixel value. Meaning confirmed 2026-10-02. |
| Reduce | Internal style name `REDUCTION`. Sets letter spacing to `-2`. Click again to remove. About text: make less important words fast, often with schwa. The control only tightens letter spacing. | Required as a text-bound mark. The letter-spacing treatment is unchanged. Confirmed meaning: weakening unstressed syllables and function words. | Implemented in Phase 2. Spacing uses `em`. Meaning confirmed 2026-10-02. |
| Stress | Underline plus bold. Click again to remove. About text: bold and underline the selected text. One stressed syllable per English word. | Required as a text-bound mark. | Implemented in Phase 2 |
| Strike Out | Internal style name `OMIT`. Diagonal strike and faded text. Click again to remove. About text: strike syllables that should not be pronounced. | Required as a text-bound mark. Stored as `strike`. | Implemented in Phase 2. Diagonal tint plus a line-through so the strike stays visible on wrapped lines and over other highlights. |
| My Errors | Internal style name `ERRORS`. Text color `#FE5F55` in a monospace face. Click again to remove. About text: mark common errors. | Required. One M1 `error` mark covers this role. Provisional pale red replaces the legacy red monospace treatment. | Implemented in Phase 2 as `error` |
| Draw | Enables a pen. Strokes are canvas line segments stored as coordinate lists. Seven palette colors. | Excluded from M1. The client explicitly confirmed that Draw was not in the M1 requirements. That statement named Draw. The canvas overlay is also the alignment bug M1 does not reproduce. | Excluded. Client confirmed 2026-10-02. Not implemented. |
| Erase | Enables the eraser for that canvas. About text: click Erase to erase pen strokes, then click again to leave the mode. It does not delete passage text and it does not remove Connect, Stretch, or the other text styles. | Excluded with the freehand canvas workflow, as previously documented. The client's 2026-10-02 statement named Draw and did not separately name Erase. Removing a text mark is requirement 9, through the mark command, not a pen eraser. | Excluded. Not implemented. |
| Per-tool visibility | Eye controls hide a style layer via `INVISIBLE` and `DISABLED_*` styles. | Intentionally excluded. Not one of the 30 requirements. | Excluded |
| Import Text | Separate import action. Shortcut Alt+O in the About table. | Intentionally excluded. M1 paste covers external text. File import is not in the 30 requirements. | Excluded |
| Export as PNG | Present in the header. The capture target was not fully traced in this audit. | Required. M1 exports the annotated document, not the application chrome. | Implemented in `src/export/renderPng.ts` |
| About | Help dialog with the descriptions above, plus keyboard shortcuts. | Intentionally excluded as a product surface. The descriptions are recorded here. | Excluded |
| Keyboard shortcuts | Alt combinations listed in About, including Stretch Alt+K, Reduce Alt+R, Erase Alt+A. | Intentionally excluded. Outside the 30-requirement scope. | Excluded |
| Spellcheck | Draft.js `spellCheck` is on. | Intentionally changed. The new editor turns spellcheck off so IPA and markup are not treated as misspellings. | Done in the foundation editor |

## IPA inventory copied from the bundle

Vowels, in order:

`ə ɪ ʊ æ ɑ ɛ ɔ ʌ u e i o a y w aɪy eɪy ɔɪy oʊw aʊw Ɛə ɚ`

`Ɛə` is U+0190 LATIN CAPITAL LETTER OPEN E plus U+0259, not U+025B LATIN SMALL LETTER OPEN E. Phase 3 keeps that exact sequence in `src/ipa/ipaData.ts`. It is still awaiting confirmation. Change the inventory entry when the intended character is known. Do not change UI components to retarget it.

Consonants, in order:

`r ɚ ɫ ð θ z s d t̬ ⌝ ʔ v b m n ŋ ʃ tʃ ʒ dʒ h k t l`

`t̬` is `t` plus U+032C COMBINING CARON BELOW. `⌝` is U+231D.

Intonation characters shown in the UI:

`⇑ ⇓ ⇒ ⇗ ⇘`

## Bugs that will not be copied

- Draw strokes use canvas coordinates (`offsetX` / `offsetY` scaled by the canvas rectangle). They detach when text wraps, the window resizes, or the font changes.
- The draw layer sets `pointer-events` on the Draft editor while the pen is active, which fights text editing.
- IPA and intonation insertion styles force 150% size (and IPA uses superscript). Phase 3 does not copy that. Symbols are inserted in the document font so combining marks stay on their base.

## Not in the legacy app

Voicing, Nasal, and Alternative are new M1 types. They are not UAlberta tools. Alternative marks an acceptable pronunciation or realization that differs from the primary target. It is not an error.

## Confirmed coaching meanings

The client confirmed these meanings on 2026-10-02. The existing mark visuals were not changed.

**Link — Consonant to Vowel.** Moving the final consonant sound of one word onto the beginning vowel sound of the next word so the speech flows continuously. Examples: "Hold on" → "Hol don"; "Stop it" → "Staw pit".

**Glide — Vowel to Vowel.** Transitioning between a word ending in a vowel sound and a word beginning with a vowel sound by naturally inserting a slight /w/ or /y/ glide. Examples: "Go out" → "Go wout"; "See it" → "See yit".

**Connect — Consonant to Consonant.** Joining words across a consonant-to-consonant boundary. When consonants are identical or produced in a similar place, the first consonant may be held or not fully released and flow into the next. Examples: "Gas station" → one continuous /s/; "Bad dog" → one slightly longer /d/. The glossary also describes Connect more broadly as maintaining continuous vocal or air flow across word boundaries within a thought group, using connected-speech processes such as links, glides, and blends.

**Blend — Assimilation.** Merging the final sound of one word and the beginning sound of the next to create a new sound. Examples: /t/ + /y/ → /ch/, "Don't you" → "Don-cha"; /d/ + /y/ → /j/, "Did you" → "Di-ja".

**Stretch.** Intentional lengthening of vowel sounds in stressed syllables of content words such as nouns, main verbs, adjectives, and adverbs. Stretching helps create American English rhythm and emphasizes important information through duration and related prominence. The M1 control remains bold plus wider letter spacing.

**Reduce.** Weakening or shrinking unstressed syllables and grammatical function words. Full vowels commonly reduce toward schwa /ə/ or short /ɪ/. Examples: "for" → /fər/; "to" → /tə/; "can" → /kən/. The M1 control remains tighter letter spacing.

## Awaiting clarification

- Whether `Ɛə` should stay U+0190 or become `ɛə` (U+025B). Phase 3 keeps U+0190 until this is confirmed. This is an IPA inventory question, not an open Requirement 10 markup meaning.
- IPA and arrows are inserted in the document font for M1. The legacy 150% / superscript style is not used. A later request can add a presentation setting.

UAlberta site branding is not copied. The Milestone 1 shell uses the Accent Coach Bianca lockup, the client 2025 Honeybee palette, and the speech-bubble mark as the browser icon.

The rich-text toolbar is an intentional Milestone 1 enhancement. It is not a copy of the UAlberta toolbar. Phonetic Strike Out stays the `strike` annotation. Standard strikethrough is a separate `textStrike` mark.
