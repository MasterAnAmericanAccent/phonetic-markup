import type { JSONContent } from '@tiptap/core'

function renderInline(nodes: JSONContent[]): string {
  let text = ''
  for (const node of nodes) {
    if (node.type === 'text') text += node.text ?? ''
    else if (node.type === 'hardBreak') text += '\n'
    else if (node.content) text += renderInline(node.content)
  }
  return text
}

function blockText(block: JSONContent): string {
  if (block.type === 'bulletList' || block.type === 'orderedList') {
    return (block.content ?? []).map((item) => blockText(item)).join('\n')
  }
  if (block.type === 'listItem' || block.type === 'blockquote') {
    return (block.content ?? []).map((child) => blockText(child)).join('\n\n')
  }
  return renderInline(block.content ?? [])
}

/** Blocks are separated by a blank line. Marks and structure names are not written as characters. */
export function getPlainText(content: JSONContent): string {
  return (content.content ?? []).map((block) => blockText(block)).join('\n\n')
}
