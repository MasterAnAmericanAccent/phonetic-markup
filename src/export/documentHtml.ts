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
  if (mark.type === 'ipaOffset') return `<span data-ipa-offset>${inner}</span>`
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
  return (nodes ?? []).map((node) => renderBlock(node)).join('')
}

function renderBlock(node: JSONContent): string {
  if (node.type === 'heading') {
    const level = node.attrs?.level === 2 || node.attrs?.level === 3 ? node.attrs.level : 1
    return `<h${level}${alignmentStyle(node)}>${renderInline(node.content)}</h${level}>`
  }
  if (node.type === 'blockquote') {
    return `<blockquote${alignmentStyle(node)}>${renderBlocks(node.content)}</blockquote>`
  }
  if (node.type === 'bulletList') return `<ul>${renderBlocks(node.content)}</ul>`
  if (node.type === 'orderedList') return `<ol>${renderBlocks(node.content)}</ol>`
  if (node.type === 'listItem') return `<li>${renderBlocks(node.content)}</li>`
  return `<p${alignmentStyle(node)}>${renderInline(node.content)}</p>`
}

/** Standalone annotated document. Search decorations and application UI are not in this tree. */
export function renderDocumentHtml(content: JSONContent, source?: HTMLElement): string {
  const blocks = (content.content ?? []).map((node) => renderBlock(node)).join('')
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Phonetic markup</title>
<style>
${documentExportCss()}
</style>
</head>
<body>
<article class="document">${blocks}</article>
</body>
</html>
`
  if (!source) return html
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const article = parsed.querySelector<HTMLElement>('.document')!
  copyLayout(source, article)
  for (const tag of ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote']) {
    const originals = source.querySelectorAll<HTMLElement>(tag)
    article.querySelectorAll<HTMLElement>(tag).forEach((element, index) => {
      if (originals[index]) copyLayout(originals[index], element)
    })
  }
  article.style.minHeight = '0'
  article.style.height = 'auto'
  article.style.overflow = 'visible'
  article.style.margin = '0'
  return '<!DOCTYPE html>\n' + parsed.documentElement.outerHTML
}

/** Capture used CSS pixels (before device scaling), including the live box model. */
function copyLayout(source: HTMLElement, target: HTMLElement) {
  const style = getComputedStyle(source)
  for (const property of [
    'box-sizing', 'width', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top', 'border-right', 'border-bottom', 'border-left',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
    'letter-spacing', 'word-spacing', 'white-space', 'overflow-wrap', 'word-break',
    'text-align', 'text-indent', 'color', 'background-color', 'list-style-type',
  ]) target.style.setProperty(property, style.getPropertyValue(property))
}
