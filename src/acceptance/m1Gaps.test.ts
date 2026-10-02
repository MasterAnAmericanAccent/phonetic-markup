import { Editor, type JSONContent } from '@tiptap/core'
import { afterEach, describe, expect, it } from 'vitest'
import { annotationDefinitions } from '../editor/annotations/definitions'
import { createAnnotationMark } from '../editor/annotations/createAnnotationMark'
import type { AnnotationDefinition } from '../editor/annotations/types'
import { createPhoneticExtensions } from '../editor/createPhoneticExtensions'
import { createTestEditor, findTextRange, pastePlain, plainText } from '../editor/testSupport'
import { renderDocumentHtml } from '../export/documentHtml'

const probe: AnnotationDefinition = {
  key: 'probe',
  name: 'Probe',
  description: 'Test-only mark. It is not registered in the product.',
  category: 'feedback',
  status: 'provisional',
  className: 'annotation-probe',
  inSelectionMenu: false,
  exportTag: 'span',
}

describe('M1 acceptance gaps', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps a Discord-like payload that still contains paragraph and hard-break characters', () => {
    const editor = createTestEditor()
    const payload = 'Paragraph 1\n\nParagraph 2\nHard-break continuation'
    pastePlain(editor, payload)
    expect(plainText(editor)).toBe(payload)
    expect(editor.getJSON().content?.map((block) => block.type)).toEqual(['paragraph', 'paragraph'])
    const second = editor.getJSON().content?.[1]
    expect(second?.content?.some((node) => node.type === 'hardBreak')).toBe(true)
    editor.destroy()
  })

  it('does not invent line breaks when a Discord paste has already flattened them', () => {
    const editor = createTestEditor()
    const payload = 'Paragraph 1 Paragraph 2 Hard-break continuation'
    pastePlain(editor, payload)
    expect(plainText(editor)).toBe(payload)
    expect(editor.getJSON().content).toHaveLength(1)
    expect(JSON.stringify(editor.getJSON())).not.toContain('hardBreak')
    editor.destroy()
  })

  it('builds a test-only annotation from the shared mark factory without a new text node', () => {
    const mark = createAnnotationMark(probe)
    const element = document.createElement('div')
    document.body.appendChild(element)
    const editor = new Editor({
      element,
      extensions: [...createPhoneticExtensions(), mark],
      content: '<p>cat</p>',
    })
    editor.commands.setTextSelection(findTextRange(editor, 'cat'))
    expect(editor.chain().setMark(probe.key).run()).toBe(true)
    expect(editor.schema.nodes.paragraph).toBeTruthy()
    expect(editor.schema.nodes.text).toBeTruthy()
    expect(editor.schema.marks[probe.key]).toBeTruthy()
    expect(editor.getHTML()).toContain('data-annotation="probe"')
    expect(editor.getHTML()).toContain('annotation-probe')
    expect(plainText(editor)).toBe('cat')
    editor.destroy()
  })

  it('renders every registered annotation through one export path', () => {
    for (const definition of annotationDefinitions) {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'cat', marks: [{ type: definition.key }] }],
          },
        ],
      }
      const html = renderDocumentHtml(content)
      expect(html).toContain(
        `<span class="${definition.className}" data-annotation="${definition.key}">cat</span>`,
      )
      expect(html).toContain('<style>')
      expect(html).not.toContain('localhost')
      expect(html).not.toContain('Export PNG')
    }
  })
})
