import { DOMParser as ModelDOMParser, Slice, type Schema } from '@tiptap/pm/model'
import type { EditorProps, EditorView } from '@tiptap/pm/view'

const BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'TR',
  'UL',
])

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n')
}

export function plainTextToHtml(text: string): string {
  let normalized = normalizeLineEndings(text)
  if (normalized.endsWith('\n') && !normalized.endsWith('\n\n')) {
    normalized = normalized.slice(0, -1)
  }
  if (normalized.length === 0) return ''
  return normalized
    .split(/\n{2,}/)
    .map((block) => `<p>${block.split('\n').map(escapeHtml).join('<br>')}</p>`)
    .join('')
}

function collectHtmlText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').replace(/\u00a0/g, ' ')
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  const element = node as HTMLElement
  if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return ''
  if (element.tagName === 'BR') return '\n'
  let inner = ''
  for (const child of element.childNodes) inner += collectHtmlText(child)
  if (BLOCK_TAGS.has(element.tagName)) return `\n\n${inner.trim()}\n\n`
  return inner
}

/** Keeps paragraphs and line breaks. Drops external inline formatting. */
export function htmlToPlainTextStructure(html: string): string {
  const parsed = new window.DOMParser().parseFromString(html, 'text/html')
  return normalizeLineEndings(collectHtmlText(parsed.body)).replace(/^\n+|\n+$/g, '')
}

export function parseHtmlSlice(schema: Schema, html: string): Slice {
  if (html.length === 0) return Slice.empty
  const holder = document.createElement('div')
  holder.innerHTML = html
  return ModelDOMParser.fromSchema(schema).parseSlice(holder, { preserveWhitespace: 'full' })
}

export function parsePlainTextSlice(schema: Schema, text: string): Slice {
  return parseHtmlSlice(schema, plainTextToHtml(text))
}

export function sanitizePastedHTML(html: string): string {
  return plainTextToHtml(htmlToPlainTextStructure(html))
}

export const phoneticEditorProps: EditorProps = {
  attributes: {
    spellcheck: 'false',
    'aria-label': 'Phonetic passage',
  },
  clipboardTextParser(text: string, _context, _plain, view: EditorView) {
    return parsePlainTextSlice(view.state.schema, text)
  },
  transformPastedHTML(html: string) {
    return sanitizePastedHTML(html)
  },
}
