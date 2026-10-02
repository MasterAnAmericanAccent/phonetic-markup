import type { Editor } from '@tiptap/core'
import type { AnnotationKey } from '../annotations/definitions'

export function selectionHasRange(editor: Editor): boolean {
  return !editor.state.selection.empty
}

/** Shared by the left panel and the selection menu. An empty selection does nothing. */
export function toggleAnnotationOnSelection(editor: Editor, key: AnnotationKey): boolean {
  if (!selectionHasRange(editor)) return false
  return editor.chain().focus().toggleAnnotation(key).run()
}

export function selectionMenuShouldShow(editor: Editor): boolean {
  return editor.isEditable && selectionHasRange(editor)
}
