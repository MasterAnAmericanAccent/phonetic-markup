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

/** Insert after the selection, matching the reference, without replacing its text. */
export function insertSymbolAtSelection(editor: Editor, character: string): boolean {
  if (character.length === 0) return false
  const insertAt = positionOutsideGrapheme(editor.state.doc, editor.state.selection.to)
  return editor.chain().focus().setTextSelection(insertAt).command(({ tr, state }) => {
    const marks = (tr.storedMarks ?? tr.selection.$from.marks())
      .filter((mark) => mark.type.name !== 'ipaOffset')
    tr.insertText(character, insertAt)
    tr.addMark(insertAt, insertAt + character.length, state.schema.marks.ipaOffset!.create())
    tr.setStoredMarks(marks)
    return true
  }).run()
}
