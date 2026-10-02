import type { JSONContent } from '@tiptap/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestEditor, plainText } from '../editor/testSupport'
import { layoutFixture } from './layoutFixture'
import { getPlainText } from './plainText'
import { deserializeDocument, serializeDocument } from './serialize'

describe('document model', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('round-trips text and marks through serialize and deserialize', () => {
    const editor = createTestEditor(layoutFixture)
    const stored = serializeDocument(editor.getJSON(), { title: 'Lesson' })
    const restored = deserializeDocument(JSON.parse(JSON.stringify(stored)))
    expect(restored.version).toBe(1)
    expect(restored.metadata.title).toBe('Lesson')

    const next = createTestEditor(restored.content)
    expect(next.getJSON()).toEqual(editor.getJSON())
    expect(plainText(next)).toBe(plainText(editor))
    editor.destroy()
    next.destroy()
  })

  it('rejects an unsupported version and a missing document', () => {
    expect(() => deserializeDocument({ version: 2, content: { type: 'doc' } })).toThrow(
      /Unsupported document version/,
    )
    expect(() => deserializeDocument({ version: 1, content: { type: 'paragraph' } })).toThrow(
      /content is missing/,
    )
    expect(() => deserializeDocument(null)).toThrow(/must be an object/)
  })

  it('extracts plain text without mark metadata', () => {
    const content: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Say ' },
            {
              type: 'text',
              text: 'cat',
              marks: [
                { type: 'error' },
                { type: 'comment', attrs: { id: 'c1', body: 'secret note' } },
                { type: 'researchMarker', attrs: { id: 'r1', label: 'follow up' } },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'line' },
            { type: 'hardBreak' },
            { type: 'text', text: 'break' },
          ],
        },
      ],
    }

    expect(getPlainText(content)).toBe('Say cat\n\nline\nbreak')
    expect(getPlainText(content)).not.toContain('secret note')
    expect(getPlainText(content)).not.toContain('follow up')
    expect(getPlainText(content)).not.toContain('error')

    const stored = serializeDocument(content)
    const restored = deserializeDocument(stored)
    const editor = createTestEditor(restored.content)
    const cat = editor.state.doc.nodeAt(5)
    const markNames = cat?.marks.map((mark) => mark.type.name).sort()
    expect(markNames).toEqual(['comment', 'error', 'researchMarker'])
    expect(cat?.marks.find((mark) => mark.type.name === 'comment')?.attrs.body).toBe('secret note')
    expect(getPlainText(editor.getJSON())).toBe('Say cat\n\nline\nbreak')
    editor.destroy()
  })

  it('does not keep a title when metadata omits it', () => {
    const stored = serializeDocument({ type: 'doc', content: [{ type: 'paragraph' }] })
    expect(stored.metadata).toEqual({})
    expect(deserializeDocument(stored).metadata).toEqual({})
  })
})
