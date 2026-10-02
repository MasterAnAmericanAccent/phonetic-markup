import type { JSONContent } from '@tiptap/core'
import { annotationDefinitions } from '../editor/annotations/definitions'
import { documentExportCss } from './documentCss'

const annotationByKey: ReadonlyMap<string, (typeof annotationDefinitions)[number]> = new Map(
  annotationDefinitions.map((definition) => [definition.key, definition]),
)

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderInline(nodes: JSONContent[] | undefined): string {
  if (!nodes) return ''
  return nodes.map((node) => renderInlineNode(node)).join('')
}

function renderInlineNode(node: JSONContent): string {
  if (node.type === 'hardBreak') return '<br>'
  if (node.type === 'text') return wrapMarks(escapeHtml(node.text ?? ''), node.marks)
  return renderInline(node.content)
}

function wrapOneMark(inner: string, mark: { type?: string }): string {
  if (mark.type === 'bold') return `<strong>${inner}</strong>`
  if (mark.type === 'italic') return `<em>${inner}</em>`
  if (mark.type === 'underline') return `<u>${inner}</u>`
  if (mark.type === 'textStrike') return `<s>${inner}</s>`
  if (mark.type !== undefined && annotationByKey.has(mark.type)) {
    const definition = annotationByKey.get(mark.type)
    if (!definition) return inner
    return `<span class="${definition.className}" data-annotation="${definition.key}">${inner}</span>`
  }
  return inner
}

function wrapMarks(text: string, marks: JSONContent['marks']): string {
  return (marks ?? []).reduceRight((inner, mark) => wrapOneMark(inner, mark), text)
}

function alignmentStyle(node: JSONContent): string {
  const align = node.attrs?.textAlign
  if (align === 'center' || align === 'right' || align === 'justify') return ` style="text-align: ${align}"`
  return ''
}

function renderBlocks(nodes: JSONContent[] | undefined): string {
  return (nodes ?? []).map((node) => renderBlock(node)).join('\n')
}

function renderBlock(node: JSONContent): string {
  if (node.type === 'heading') {
    const level = node.attrs?.level === 2 || node.attrs?.level === 3 ? node.attrs.level : 1
    return `<h${level}${alignmentStyle(node)}>${renderInline(node.content)}</h${level}>`
  }
  if (node.type === 'blockquote') {
    return `<blockquote${alignmentStyle(node)}>\n${renderBlocks(node.content)}\n</blockquote>`
  }
  if (node.type === 'bulletList') return `<ul>\n${renderBlocks(node.content)}\n</ul>`
  if (node.type === 'orderedList') return `<ol>\n${renderBlocks(node.content)}\n</ol>`
  if (node.type === 'listItem') return `<li>\n${renderBlocks(node.content)}\n</li>`
  return `<p${alignmentStyle(node)}>${renderInline(node.content)}</p>`
}

/** Standalone annotated document. Search decorations and application UI are not in this tree. */
export function renderDocumentHtml(content: JSONContent): string {
  const blocks = (content.content ?? []).map((node) => renderBlock(node)).join('\n')
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Phonetic markup</title>
<style>
${documentExportCss()}
</style>
</head>
<body>
<article class="document">
${blocks}
</article>
</body>
</html>
`
}
