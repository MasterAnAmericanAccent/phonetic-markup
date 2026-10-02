import type { Editor } from '@tiptap/core'

const FORMAT_MARKS = ['bold', 'italic', 'underline', 'textStrike']

/**
 * Removes standard rich-text formatting from the selection, or from the
 * current text block when the selection is collapsed.
 * Phonetic annotation marks are not removed.
 */
export function clearStandardFormatting(editor: Editor): boolean {
  const inList = editor.isActive('listItem')
  const inQuote = editor.isActive('blockquote')
  let chain = editor.chain().focus().command(({ tr, state }) => {
    const marks = FORMAT_MARKS.map((name) => state.schema.marks[name]).filter((mark) => mark !== undefined)
    const selection = state.selection
    const from = selection.empty ? selection.$from.start() : selection.from
    const to = selection.empty ? selection.$from.end() : selection.to
    for (const mark of marks) {
      tr.removeMark(from, to, mark)
      tr.removeStoredMark(mark)
    }
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isTextblock) return
      const paragraph = state.schema.nodes.paragraph
      const nextType = node.type.name === 'heading' && paragraph ? paragraph : node.type
      const align = node.attrs.textAlign as string | null | undefined
      if (nextType !== node.type || (align !== undefined && align !== null && align !== 'left')) {
        const attrs = { ...node.attrs }
        if ('textAlign' in attrs) attrs.textAlign = null
        tr.setNodeMarkup(pos, nextType, attrs)
      }
    })
    return true
  })
  if (inList) chain = chain.liftListItem('listItem')
  if (inQuote) chain = chain.toggleBlockquote()
  return chain.run()
}
