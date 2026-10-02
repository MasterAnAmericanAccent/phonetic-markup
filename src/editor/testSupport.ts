import { Editor, type JSONContent } from '@tiptap/core'
import { getPlainText } from '../document/plainText'
import { createPhoneticExtensions } from './createPhoneticExtensions'
import { parseHtmlSlice, phoneticEditorProps } from './paste'

export function createTestEditor(content?: JSONContent | string): Editor {
  const element = document.createElement('div')
  document.body.appendChild(element)
  return new Editor({
    element,
    extensions: createPhoneticExtensions(),
    content: content ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: phoneticEditorProps,
  })
}

export function plainText(editor: Editor): string {
  return getPlainText(editor.getJSON())
}

export function findTextRange(editor: Editor, text: string): { from: number; to: number } {
  let combined = ''
  const positions: number[] = []
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return
    for (let index = 0; index < node.text.length; index += 1) {
      combined += node.text[index] ?? ''
      positions.push(pos + index)
    }
  })
  const start = combined.indexOf(text)
  const endPosition = positions[start + text.length - 1]
  const startPosition = positions[start]
  if (start < 0 || startPosition === undefined || endPosition === undefined) {
    throw new Error(`Text not found: ${text}`)
  }
  return { from: startPosition, to: endPosition + 1 }
}

export function markedSegments(editor: Editor, markName: string): string[] {
  const segments: string[] = []
  editor.state.doc.descendants((node) => {
    if (node.isText && node.marks.some((mark) => mark.type.name === markName)) {
      segments.push(node.text ?? '')
    }
  })
  return segments
}

export function pastePlain(editor: Editor, text: string): void {
  const parser = editor.options.editorProps?.clipboardTextParser
  if (!parser) throw new Error('Plain-text paste parser is not configured')
  const slice = parser(text, editor.state.selection.$from, true, editor.view)
  editor.view.dispatch(editor.state.tr.replaceSelection(slice))
}

export function pasteHtml(editor: Editor, html: string): void {
  const transform = editor.options.editorProps?.transformPastedHTML
  if (!transform) throw new Error('HTML paste transform is not configured')
  const sanitized = transform(html, editor.view)
  const slice = parseHtmlSlice(editor.schema, sanitized)
  editor.view.dispatch(editor.state.tr.replaceSelection(slice))
}
