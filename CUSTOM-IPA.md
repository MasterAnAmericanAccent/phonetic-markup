# Managing custom IPA characters

1. In the IPA palette, click **+ Add IPA**.
2. Enter or paste a Unicode character or short IPA sequence. Choose **Vowels**,
   **Consonants**, or **Intonation**, then click **Save**.
3. The selected category opens immediately with the new button. Click it to insert
   at the editor cursor using the existing raised IPA styling. Typing afterward
   resumes normal alignment; selection, editing, undo/redo and both exports work
   exactly as they do for built-in symbols.
4. Click **− Remove IPA** beside **+ Add IPA** to enter removal mode. Built-in
   buttons, including ǣ, are disabled in this mode. Select a custom character in
   its category, then confirm with **Remove** in the compact inline prompt.
   **Cancel** dismisses the prompt; **Done** exits removal mode without deleting
   a pending selection. Category changes also dismiss a pending confirmation.
   Removing a palette button leaves existing document text and exports unchanged.
   Removal is saved immediately; the control is disabled when no custom entries remain.

Duplicates are rejected within each category, including canonically equivalent
Unicode spellings. The same character can belong to different categories.
Whitespace/control characters and sequences longer than 16 Unicode code points
are rejected. Combining sequences are retained as entered.

## Browser-only persistence

Custom entries use localStorage key `acb.custom-ipa.v1`. They survive refresh and
reopening the app in the same browser profile at the same website address/origin.
They are **not automatically shared between William and Bianca**, browsers,
profiles, devices, or different site addresses. Clearing site data removes them;
private browsing can discard them when the private session ends. Document exports
preserve inserted Unicode and styling, but do not transfer the custom palette.

If browser storage is blocked or full, the app displays an error and leaves the
previous palette unchanged. There are no accounts, database, or cloud sync.

## Implementation scope

- `src/ipa/IpaPalette.tsx`: compact add form, inline confirmation-based removal mode and custom palette buttons.
- `src/ipa/customIpa.ts`: validation, duplicates, protected removal and storage.
- `src/ipa/ipaData.ts`: exposes the shared symbol metadata factory; built-in inventory is unchanged.
- `src/styles/editor.css`: compact controls using existing brand tokens.
- `src/ipa/customIpa.test.ts`: inventory, Unicode, persistence and storage failure tests.
- `src/ipa/removalMode.test.ts`: confirmation, cancel/done, built-in protection and document preservation tests.
- `e2e/custom-ipa.spec.ts`: all categories, refresh/reopening, removal, protection, insertion, focus, editing/history and exports.

The existing insertion function and editor/export architecture are reused unchanged.

## Verification

- TypeScript: PASS (`npm run typecheck`).
- ESLint: PASS (`npm run lint`).
- Unit/integration tests: 136 passed, 0 failed across 13 files (`npm test`).
- Chrome browser tests: 37 passed, 0 failed (`npm run test:e2e`), including 7 custom IPA tests.
- Production build: PASS (`npm run build`), with the existing bundle-size warning.
- Form layout, inline removal confirmation, and custom IPA PNG rendering were visually inspected.
- No dependencies, editor architecture, accounts, database, synchronization, Git configuration, or deployment configuration were changed.

All changes remain local. Nothing was staged, committed, pushed, or deployed.

Removal verification also covers side-by-side controls, disabled removal without custom entries, cancellation, category changes, persistence after refresh, storage failure without data loss, and preservation of inserted document text. The browser-only informational message remains absent from the UI.
