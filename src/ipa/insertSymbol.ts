import type { Editor } from '@tiptap/core'
import type { Node as ProseNode } from '@tiptap/pm/model'

/** Move an offset that sits inside a grapheme cluster to the end of that cluster. */
export function offsetAfterGrapheme(text: string, utf16Offset: number): number {
  if (utf16Offset <= 0 || utf16Offset >= text.length) return utf16Offset
  if (typeof Intl.Segmenter !== 'function') return utf16Offset
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  let cursor = 0
  for (const part of segmenter.segment(text)) {
    const next = cursor + part.segment.length
    if (utf16Offset > cursor && utf16Offset < next) return next
    if (utf16Offset <= cursor) return utf16Offset
    cursor = next
  }
  return utf16Offset
}

function positionOutsideGrapheme(doc: ProseNode, pos: number): number {
  const resolved = doc.resolve(pos)
  const parent = resolved.parent
  let remaining = resolved.parentOffset
  for (let index = 0; index < parent.childCount; index += 1) {
    const child = parent.child(index)
    if (child.isText && child.text && remaining < child.nodeSize) {
      const snapped = offsetAfterGrapheme(child.text, remaining)
      return pos + (snapped - remaining)
    }
    if (remaining < child.nodeSize) return pos
    remaining -= child.nodeSize
  }
  return pos
}

/**
 * Insert a symbol through the editor. A collapsed cursor snaps out of a
 * combining sequence. A non-empty selection is replaced, the same as typing.
 */
export function insertSymbolAtSelection(editor: Editor, character: string): boolean {
  if (character.length === 0) return false
  const { from, empty } = editor.state.selection
  if (!empty) {
    return editor.chain().focus().insertContent(character).run()
  }
  const insertAt = positionOutsideGrapheme(editor.state.doc, from)
  return editor.chain().focus().setTextSelection(insertAt).insertContent(character).run()
}
