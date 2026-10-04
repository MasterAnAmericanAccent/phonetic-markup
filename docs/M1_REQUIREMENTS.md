# Accent Coach Bianca — Phonetic Markup
## Milestone 1 Requirements

**Status:** Ready  
**Milestone:** M1  
**Total requirements:** 30

> This file is the authoritative implementation scope for Milestone 1.  
> Do not add requirements from the broader 41-requirement backlog unless they are explicitly moved into M1.

---

## 1. Editable text

**Status:** Ready  
**Domain/Epic:** Text Editor

### Description
The main workspace must behave as an editable text document rather than as a static rendering. The coach must be able to place the cursor anywhere, insert characters, delete characters, select ranges, and modify text normally.

### Acceptance Criteria
- The coach can click anywhere in editable text and place the cursor.
- The coach can insert and delete characters.
- The coach can select words, portions of words, sentences, and arbitrary ranges.
- Editing does not require switching to a separate "edit mode."
- Existing markup outside the edited range remains associated with the correct text.
- Standard OS/browser editing behavior such as copy, cut, paste, undo, and redo is supported.

### Engineer Notes
This editor is primarily intended for Bianca as the coach rather than students interacting with the document themselves.

---

## 2. Paste external text

**Status:** Ready  
**Domain/Epic:** Text Editor

### User Story
As the coach, I want to paste text from Discord, websites, documents, and other applications so that I can quickly begin marking up material provided by a student.

### Description
The editor must accept pasted text from common external sources and convert it into editable content.

### Acceptance Criteria
- Plain text can be pasted into an empty document.
- Text can be pasted into an existing document at the current cursor position.
- Unicode characters are retained.
- Pasting does not introduce unsupported or invisible formatting that interferes with markup.
- The pasted content becomes immediately editable.

### Engineer Notes
The markup editor should favor preserving meaningful textual structure rather than arbitrary visual formatting from the source application.

---

## 3. Edit text after markup

**Status:** Ready  
**Domain/Epic:** Text Editor

### User Story
As the coach, I want to continue correcting the text after applying phonetic markup so that discovering a typo or changing a sentence does not force me to start over.

### Description
Markup must coexist with a fully editable text document. Applying markup must never convert the text into a static graphic or otherwise lock it.

### Acceptance Criteria
- Text containing markup remains editable.
- Characters can be inserted before, inside, or after marked text.
- Text can be removed from a marked range.
- Markup updates predictably when its associated text changes.
- Unrelated annotations are not destroyed by editing elsewhere in the document.
- Undoing a text edit restores both text and associated annotation state where applicable.

---

## 4. Preserve paragraphs and line breaks

**Status:** Ready  
**Domain/Epic:** Text Editor

### User Story
As the coach, I want pasted text to retain its paragraph structure so that I do not have to manually reconstruct the student's original text before coaching.

### Description
The current workflow has a known problem when Discord acts as an intermediary: paragraph boundaries and line breaks can be lost when content is copied from Discord into the markup application. The new editor should preserve recoverable paragraph and line-break information and avoid collapsing text unnecessarily.

### Acceptance Criteria
- Standard newline characters in clipboard content produce line breaks in the editor.
- Paragraph breaks are retained when present in the clipboard payload.
- Pasting multi-paragraph plain text does not collapse everything into one paragraph.
- Text copied directly from common sources retains its meaningful line structure where that structure is available.
- Discord-pasted content is tested specifically as part of QA.

### Engineer Notes
The application cannot recreate line breaks that Discord itself has completely removed from the clipboard data. The requirement is to preserve the structure that is available and avoid the legacy application's additional loss of structure.

---

## 5. Text-bound annotations

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the coach, I want markup to stay attached to the text it describes so that corrections remain accurate even when the document changes.

### Description
Annotations must be represented as properties of text ranges or equivalent semantic editor entities. They must not be implemented primarily as graphical objects positioned at fixed X/Y coordinates over the text. The legacy application has a known problem where annotation colors are positioned independently of the text, causing them to become misaligned as content or font sizing changes.

### Acceptance Criteria
- Every annotation is associated with identifiable document content.
- Reflowing text does not separate the annotation from its target.
- Scrolling does not affect annotation alignment.
- Changing viewport dimensions does not affect annotation alignment.
- Rendering an annotation does not depend on hard-coded screen coordinates.

### Engineer Notes
The exact technical representation may use editor nodes, marks, ranges, decorations, or another robust model. Raw character offsets are not mandated.

---

## 6. Stable markup after text edits

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the coach, I want annotations to remain on the intended words after I edit text elsewhere so that corrections do not silently become wrong.

### Description
When document content changes, the annotation model must update with those changes.

### Acceptance Criteria
- Inserting text before an annotation does not move the annotation onto unrelated text.
- Deleting text before an annotation does not move the annotation onto unrelated text.
- Editing an unrelated paragraph does not change markup in another paragraph.
- If part of an annotated range is deleted, the remaining annotation behaves consistently.
- If the entire annotated range is deleted, no orphaned visual annotation remains.

### Engineer Notes
Detailed behavior for annotations whose own target text is heavily rewritten should be defined by the selected editor framework, but it must remain deterministic.

---

## 7. Stable markup during layout changes

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the coach, I want markup to remain correctly positioned when I resize text or the application window so that I can adapt the display during screen sharing without breaking the document.

### Description
Changing presentation must not change the semantic relationship between markup and text. This directly addresses the misalignment problem described in the current implementation.

### Acceptance Criteria
- Increasing or decreasing font size retains alignment.
- Resizing the application window retains alignment.
- Text wrapping onto additional lines retains alignment.
- Browser zoom does not detach markup from its target text.
- Exported markup corresponds to what is currently shown in the editor.

---

## 8. Multiple markup types on the same text

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the coach, I want the same sound or text range to carry multiple phonetic observations when necessary so that the annotation system does not artificially limit my analysis.

### Description
The document model should support more than one annotation associated with the same or overlapping text.

### Acceptance Criteria
- Different annotation types may overlap where their representation permits it.
- Adding a second annotation does not automatically destroy the first.
- Removing one markup type does not remove unrelated markup.
- Overlapping annotations remain distinguishable in the UI.

### Engineer Notes
The precise visual representation of overlapping annotations will require UI design.

---

## 9. Remove markup independently

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the coach, I want to remove a correction without deleting the student's text so that I can revise my analysis.

### Description
Annotations are independent entities from the underlying content.

### Acceptance Criteria
- A selected annotation can be removed.
- Removing it leaves the text unchanged.
- Removing one annotation does not remove unrelated annotations on the same text.
- Removal participates in undo/redo.

---

## 10. Reimplement existing UAlberta markup functionality

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the coach, I want the useful markup tools from the existing UAlberta Phonetic Markup application to remain available so that the replacement does not lose the functionality of the current workflow.

### Description
The new editor is intended to reimplement and extend the current UAlberta application rather than introduce an unrelated annotation workflow. The existing editor therefore acts as the behavioral baseline for relevant phonetic-markup features.

### Acceptance Criteria
- Existing markup capabilities selected for parity are documented before implementation.
- Each retained markup operation has equivalent or improved functionality in the new editor.
- Existing visual concepts are preserved where they remain useful.
- Legacy bugs do not need to be preserved for behavioral parity.

### Engineer Notes
The parity checklist is `docs/UALBERTA_PARITY.md`. On 2026-10-02 the client confirmed the coaching meanings for Link, Glide, Connect, Blend, Stretch, and Reduce. Draw is explicitly outside M1. Erase stays excluded with the freehand canvas workflow. The mark visuals were not changed for this confirmation.

---

## 11. Error / correction markup

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the coach, I want to mark text as containing a pronunciation problem so that the relevant point is immediately visible while discussing it.

### Description
The new editor should retain an explicit visual mechanism for pronunciation errors or corrections.

### Acceptance Criteria
- Selected text can be marked as an error/correction.
- Error markup is visually distinguishable from normal text.
- The annotation can later be removed or changed.
- Error markup survives normal text reflow and editing.

---

## 12. Voicing markup

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the coach, I want a dedicated markup for voicing so that I can communicate voicing corrections without relying on generic annotations.

### Description
"Voicing" is explicitly requested as a new markup feature.

### Acceptance Criteria
- Voicing is available as a distinct markup action.
- It has a recognizable visual treatment.
- It can be applied to an arbitrary selected text range.
- It can be removed without affecting other markup.
- It is represented as a distinct annotation type internally.

---

## 13. Nasal markup

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the coach, I want dedicated nasal markup so that nasal-related pronunciation feedback can be shown directly in the text.

### Description
Nasals are explicitly identified as an additional markup category.

### Acceptance Criteria
- Nasal markup appears as a dedicated action.
- It has its own distinguishable visual representation.
- It can be applied to selected content.
- It can coexist with other annotations where appropriate.
- It can be removed independently.

---

## 14. Additional non-red correction markup

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the coach, I want an additional correction-like annotation that does not visually imply a conventional red "error" so that different kinds of feedback can be distinguished.

### Description
The source suggests an additional category using something such as blue or green rather than red, so it is not read as a conventional error.

William confirmed the final decision on 2026-10-02:

- Name: Alternative
- Meaning: a pronunciation or realization that differs from the primary target but is still acceptable, rather than being an error
- Visual direction: blue-ish

The stored mark identifier remains `alternate`. The user-facing name is Alternative. The treatment is a blue dotted underline (`#1d4ed8`), separate from the Error wash and from search highlighting.

### Acceptance Criteria
- At least one additional correction/feedback category exists.
- It is visually distinguishable from the existing error markup.
- Its visual styling can be configured during UI design.
- It is stored as its own annotation type rather than merely as an arbitrary color.

### Engineer Notes
The name, meaning, and blue-ish treatment are confirmed. Do not describe Alternative as an error. Do not rename the stored key `alternate` without a document migration.

---

## 15. Extensible markup system

**Status:** Ready  
**Domain/Epic:** Markup Architecture

### User Story
As the product owner, I want new phonetic markup types to be added without rewriting the editor so that the system can evolve with Bianca's coaching methodology.

### Description
Markup types should be represented through a common extensible model instead of each new type requiring a separate editor implementation.

### Acceptance Criteria
- Markup types share a common annotation interface/model.
- New markup categories can define their visual representation independently.
- New types can be added without modifying the underlying text model.
- Export mechanisms can render newly added markup types through the same abstraction.

---

## 16. IPA symbol palette

**Status:** Ready  
**Domain/Epic:** IPA Input

### User Story
As the coach, I want commonly needed IPA symbols available directly in the editor so that I do not need an external character picker.

### Description
The editor must provide a convenient IPA input palette.

### Acceptance Criteria
- IPA symbols are visible through an accessible editor control.
- Selecting a symbol inserts it into the current document.
- The palette does not obscure the main text unnecessarily.
- Symbols display correctly using the application typography.

---

## 17. Insert IPA at cursor

**Status:** Ready  
**Domain/Epic:** IPA Input

### User Story
As the coach, I want clicking an IPA symbol to insert it exactly where I am working so that symbol entry feels like normal typing.

### Description
IPA insertion should interact naturally with the editor selection.

### Acceptance Criteria
- With a collapsed cursor, the symbol is inserted at the cursor.
- The cursor moves to a sensible position after insertion.
- Insertion is undoable.
- The editor retains focus or returns focus predictably after using the palette.

---

## 18. Unicode and diacritic support

**Status:** Ready  
**Domain/Epic:** IPA Input

### User Story
As the coach, I want IPA characters and diacritics to behave correctly so that phonetic notation is not corrupted.

### Description
The text pipeline, editor, persistence model, rendering, search, and export functionality must all support Unicode phonetic content.

### Acceptance Criteria
- Standard IPA Unicode characters render correctly.
- Combining diacritics remain attached to their intended base characters.
- Copy/paste does not corrupt IPA.
- Search can match IPA strings.
- PNG and HTML exports preserve IPA.
- Editing around combining characters does not visibly corrupt text.

---

## 19. Contextual selection menu

**Status:** Ready  
**Domain/Epic:** Find

### User Story
As the coach, I want relevant actions close to the selected text so that applying markup is fast and does not require moving to a distant toolbar.

### Description
When text is selected, the editor should make common annotation operations immediately available.

### Acceptance Criteria
- Selecting text can expose contextual actions.
- Common markup categories are reachable from this interaction.
- The menu does not permanently obstruct the text.
- Dismissing the menu does not lose the underlying selection unexpectedly.
- The interaction works alongside keyboard shortcuts.

---

## 20. Live-coaching interaction efficiency

**Status:** Ready  
**Domain/Epic:** Find

### User Story
As the coach, I want routine annotations to require minimal interaction so that I can continue listening to the student while marking up the text.

### Description
The editor is an active coaching tool, so workflows should be optimized for speed rather than document-authoring complexity.

### Acceptance Criteria
- Common markup can be applied without navigating through multiple dialogs.
- Frequently used actions remain immediately accessible.
- Modal dialogs are avoided for routine annotation.
- The UI can be operated effectively while screen sharing.
- Text remains the primary focus after actions are completed.

---

## 21. Search document text

**Status:** Ready  
**Domain/Epic:** Find

### User Story
As the coach, I want to find every occurrence of a letter or word so that repetitive pronunciation patterns can be addressed consistently.

### Description
The editor must support searching for a specified text string. The source specifically requests finding a letter or word and highlighting it.

### Acceptance Criteria
- The coach can enter a search string.
- Matches in the document are identified.
- The number of matches can be determined.
- The coach can navigate between matches.
- Search works with ordinary characters and IPA/Unicode text.

---

## 22. Highlight all search matches

**Status:** Ready  
**Domain/Epic:** Find

### User Story
As the coach, I want all matching instances to become visually identifiable so that I can immediately see recurring patterns.

### Description
Search results should be temporarily highlighted without permanently converting them into phonetic annotations.

### Acceptance Criteria
- Every current search match is visibly indicated.
- Search highlighting is visually distinguishable from permanent markup.
- Clearing search removes search highlighting.
- Existing phonetic markup is not destroyed or changed.
- Search highlight is not visible when exporting.

---

## 23. PNG export

**Status:** Ready  
**Domain/Epic:** Export

### User Story
As the coach, I want to export the corrected text as an image so that I can share a stable visual record of the markup.

### Description
The requirements call for saving a screenshot of the text area as PNG.

### Acceptance Criteria
- The annotated document can be exported to PNG.
- Visible phonetic markup is included.
- IPA characters are rendered correctly.
- The exported result corresponds to the intended markup view.
- The output does not include unrelated application UI unless intentionally configured.

---

## 24. Self-contained HTML export

**Status:** Ready  
**Domain/Epic:** Export

### User Story
As the coach, I want an HTML version of the marked-up text so that the correction can be retained in an editable/viewable web-compatible format independent of the application.

### Description
The requirements explicitly request saving the result as HTML with inline CSS in one unique text file.

### Acceptance Criteria
- Export produces an HTML document.
- Required styling is included inline or inside the same file.
- No project-specific CSS file is required to render the exported document.
- Markup categories retain their visual appearance.
- IPA characters are preserved.
- Opening the resulting file in a browser reproduces the marked-up content reliably.

---

## 25. Preserve plain source text

**Status:** Ready  
**Domain/Epic:** Export

### User Story
As the coach, I want the original/plain text retained separately from its rendered corrections so that I always have access to the source material.

### Description
The specification explicitly asks for the pasted text to be saved as plain text for reference.

### Acceptance Criteria
- The document model retains its textual content independently of visual export.
- Plain text can be extracted without markup styling.
- Markup metadata does not become literal characters in plain-text output unless those characters are genuinely part of the text.

---

## 26. Structured document representation

**Status:** Ready  
**Domain/Epic:** Document Model

### User Story
As the product team, we want text, annotations, comments, and metadata represented structurally so that the document can be edited, exported, and later persisted without losing meaning.

### Description
Rendered appearance must not be the authoritative representation of the document. The application should maintain a structured editor model from which the visual result is produced.

### Acceptance Criteria
- Underlying text can be retrieved independently.
- Annotations exist as structured data.
- Annotation types are identifiable programmatically.
- Comments retain references to their source text.
- Research markers retain references to their source text.
- The visual document can be reconstructed from the structured state.

### Engineer Notes
This does not prescribe a particular editor library or storage schema.

---

## 27. Prepare document model for future persistence

**Status:** Ready  
**Domain/Epic:** Document Model

### User Story
As the product team, we want the editor state to be serializable so that adding save/reopen functionality later does not require replacing the editor architecture.

### Description
Persistent document storage does not need to be part of the first standalone editor milestone, but its data model should be capable of being serialized and reconstructed.

### Acceptance Criteria
- Document state has a defined serializable representation.
- Serialized state contains sufficient information to recreate text and markup.
- Comments and research markers can be represented in that state.
- Rendering-specific transient UI state is not confused with permanent document data.

---

## 28. Accent Coach Bianca branding

**Status:** Ready  
**Domain/Epic:** UI

### User Story
As the product owner, I want the tool to use Accent Coach Bianca branding so that it feels like part of Bianca's coaching ecosystem rather than a university prototype.

### Description
The source explicitly requests Accent Bianca branding and states that brand files will be provided.

### Acceptance Criteria
- Supplied logo/brand assets are incorporated.
- Typography, colors, and other visual decisions are compatible with the provided identity.
- UAlberta-specific branding is not carried over unintentionally.
- Branding does not reduce legibility of phonetic annotations.

---

## 29. Desktop-first editor

**Status:** Ready  
**Domain/Epic:** UI

### User Story
As the coach, I want the application optimized for desktop use so that I can annotate efficiently while coaching and screen sharing.

### Description
The first editor should prioritize the desktop coaching workflow rather than trying to optimize every interaction for mobile.

### Acceptance Criteria
- Core editing features work well with mouse and keyboard.
- The primary document area makes effective use of desktop width.
- Comments and supporting tools can coexist with the document.
- Common operations are not hidden behind mobile-style navigation unnecessarily.

### Engineer Notes
This does not require deliberately breaking mobile layouts; it defines the priority for design decisions.

---

## 30. Text-first interface

**Status:** Ready  
**Domain/Epic:** UI

### User Story
As the coach, I want the student's text to remain visually dominant so that tools do not distract from listening, reading, and giving feedback.

### Description
The editor is primarily a reading and annotation workspace. Toolbars, IPA palettes, comments, and menus should support the text instead of competing with it.

### Acceptance Criteria
- The main text area occupies the primary visual focus.
- Permanent controls do not overlap document content.
- Temporary contextual controls disappear when no longer required.
- Comments can be positioned without obscuring the reading area.
- Markup remains easily visible during screen sharing.

---

# M1 Scope Boundary

The following items are **not part of this 30-requirement M1 scope unless explicitly added later**:

- Keyboard shortcuts
- Hold-key / quick-choice interaction
- Apply markup to all occurrences
- Replace all occurrences
- Apply to one versus all
- Dictionary.com lookup
- Preserve editor state during dictionary lookup
- Attach a comment to text
- Coach-only commenting
- Non-obstructive side comments
- Link comments and source text visually

Broader later-milestone features such as authentication, persistent database storage, saved history, Discord integration, hot-seat/session workflows, timers, recording integration, and cloud file storage are also outside this M1 requirements file.

---

# Implementation Guidance

- Treat this file as the authoritative M1 requirements source.
- Implement requirements incrementally.
- Do not use fixed X/Y overlays as the primary annotation architecture.
- Keep the underlying document structured and serializable.
- Do not add persistent storage simply because the document model is persistence-ready.
- Where requirements intentionally leave visual or semantic details open, document the implementation decision rather than inventing additional scope.
- The existing UAlberta application is a behavioral reference for selected parity features, not a requirement to preserve its bugs.
