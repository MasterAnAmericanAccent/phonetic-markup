import type { Editor } from '@tiptap/core'
import type { Node as ProseNode } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { closeHistory } from '@tiptap/pm/history'

/** Rebuild every text block without marks or attributes in a single undo step. */
export function clearStandardFormatting(editor: Editor): boolean {
  const cleared = editor.chain().focus().command(({ tr, state }) => {
    const paragraphs: ProseNode[] = []
    state.doc.descendants((node) => {
      if (!node.isTextblock) return
      const content: ProseNode[] = []
      node.descendants((inline) => {
        if (inline.isText) content.push(state.schema.text(inline.text!))
        else if (inline.type.name === 'hardBreak') content.push(state.schema.nodes.hardBreak!.create())
      })
      paragraphs.push(state.schema.nodes.paragraph!.create(null, content))
      return false
    })
    closeHistory(tr)
    tr.replaceWith(0, state.doc.content.size, paragraphs)
    tr.setSelection(TextSelection.atStart(tr.doc))
    tr.setStoredMarks([])
    return true
  }).run()
  // Keep the next typing transaction separate from this document-wide reset.
  if (cleared) editor.view.dispatch(closeHistory(editor.state.tr).setMeta('addToHistory', false))
  return cleared
}
