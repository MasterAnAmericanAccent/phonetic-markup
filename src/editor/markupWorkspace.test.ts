import type { JSONContent } from '@tiptap/core'
import { afterEach, describe, expect, it } from 'vitest'
import { annotationDefinitions, type AnnotationKey } from './annotations/definitions'
import { annotationCategories } from './annotations/types'
import {
  selectionHasRange,
  selectionMenuShouldShow,
  toggleAnnotationOnSelection,
} from './commands/markupActions'
import { getPlainText } from '../document/plainText'
import { deserializeDocument, serializeDocument } from '../document/serialize'
import { createTestEditor, findTextRange, markedSegments, plainText } from './testSupport'

const passage = '<p>Hello cat sat</p><p>Other paragraph</p>'

function apply(editor: ReturnType<typeof createTestEditor>, text: string, key: AnnotationKey) {
  editor.commands.setTextSelection(findTextRange(editor, text))
  expect(toggleAnnotationOnSelection(editor, key)).toBe(true)
}

describe('markup workspace', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('registers every coaching mark for the panel, menu, and later export', () => {
    const categories = new Set(annotationCategories.map((category) => category.id))
    expect(annotationDefinitions.length).toBeGreaterThanOrEqual(12)
    for (const definition of annotationDefinitions) {
      expect(categories.has(definition.category)).toBe(true)
      expect(definition.inSelectionMenu).toBe(true)
      expect(definition.exportTag).toBe('span')
      expect(definition.className.startsWith('annotation-')).toBe(true)
    }
    expect(annotationDefinitions.find((definition) => definition.key === 'connect')?.description).toMatch(
      /not defined/i,
    )
    const alternative = annotationDefinitions.find((definition) => definition.key === 'alternate')
    expect(alternative?.name).toBe('Alternative')
    expect(alternative?.description).toMatch(/still acceptable/)
    expect(alternative?.description).toMatch(/rather than an error/)
  })

  it.each(annotationDefinitions.map((definition) => definition.key))(
    'applies and removes %s without changing the text',
    (key) => {
      const editor = createTestEditor(passage)
      const before = plainText(editor)
      apply(editor, 'cat', key)
      expect(markedSegments(editor, key).join('')).toBe('cat')
      expect(plainText(editor)).toBe(before)
      const html = editor.view.dom.innerHTML
      expect(html).toContain(`data-annotation="${key}"`)
      expect(html).not.toMatch(/position:\s*absolute/)
      apply(editor, 'cat', key)
      expect(markedSegments(editor, key)).toEqual([])
      expect(plainText(editor)).toBe(before)
      editor.destroy()
    },
  )

  it('keeps two annotation types on one range and removes only the requested type', () => {
    const editor = createTestEditor(passage)
    apply(editor, 'cat', 'error')
    apply(editor, 'cat', 'glide')
    expect(markedSegments(editor, 'error').join('')).toBe('cat')
    expect(markedSegments(editor, 'glide').join('')).toBe('cat')
    const before = plainText(editor)
    apply(editor, 'cat', 'error')
    expect(markedSegments(editor, 'error')).toEqual([])
    expect(markedSegments(editor, 'glide').join('')).toBe('cat')
    expect(plainText(editor)).toBe(before)
    editor.destroy()
  })

  it('allows partially overlapping ranges', () => {
    const editor = createTestEditor('<p>alpha beta gamma</p>')
    apply(editor, 'alpha beta', 'error')
    apply(editor, 'beta gamma', 'voicing')
    expect(markedSegments(editor, 'error').join('')).toBe('alpha beta')
    expect(markedSegments(editor, 'voicing').join('')).toBe('beta gamma')
    apply(editor, 'beta', 'error')
    expect(markedSegments(editor, 'error').join('')).toBe('alpha ')
    expect(markedSegments(editor, 'voicing').join('')).toBe('beta gamma')
    editor.destroy()
  })

  it('undoes and redoes apply, then undoes removal', () => {
    const editor = createTestEditor(passage)
    apply(editor, 'cat', 'stress')
    editor.commands.undo()
    expect(markedSegments(editor, 'stress')).toEqual([])
    editor.commands.redo()
    expect(markedSegments(editor, 'stress').join('')).toBe('cat')
    apply(editor, 'cat', 'stress')
    expect(markedSegments(editor, 'stress')).toEqual([])
    editor.commands.undo()
    expect(markedSegments(editor, 'stress').join('')).toBe('cat')
    editor.destroy()
  })

  it('keeps each mark attached when text inside it changes', () => {
    const editor = createTestEditor('<p>cat</p>')
    for (const definition of annotationDefinitions) {
      editor.commands.setContent('<p>cat</p>')
      apply(editor, 'cat', definition.key)
      const range = findTextRange(editor, 'cat')
      editor.commands.insertContentAt(range.from + 1, 'X')
      expect(markedSegments(editor, definition.key).join('')).toBe('cXat')
      expect(plainText(editor)).toBe('cXat')
    }
    editor.destroy()
  })

  it('round-trips several marks and keeps them out of plain text', () => {
    const content: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'pip',
              marks: [
                { type: 'error' },
                { type: 'stretch' },
                { type: 'nasal' },
                { type: 'strike' },
              ],
            },
            { type: 'text', text: ' a\u0301' },
          ],
        },
      ],
    }
    const stored = serializeDocument(content, { title: 'Marks' })
    const restored = deserializeDocument(JSON.parse(JSON.stringify(stored)))
    const editor = createTestEditor(restored.content)
    expect(getPlainText(editor.getJSON())).toBe('pip a\u0301')
    expect(getPlainText(editor.getJSON())).not.toMatch(/error|stretch|nasal|strike/)
    expect(markedSegments(editor, 'stretch').join('')).toBe('pip')
    expect(markedSegments(editor, 'strike').join('')).toBe('pip')
    editor.destroy()
  })

  it('does not mark text when nothing is selected', () => {
    const editor = createTestEditor(passage)
    editor.commands.setTextSelection(1)
    expect(selectionHasRange(editor)).toBe(false)
    expect(selectionMenuShouldShow(editor)).toBe(false)
    expect(toggleAnnotationOnSelection(editor, 'blend')).toBe(false)
    expect(markedSegments(editor, 'blend')).toEqual([])
    editor.commands.setTextSelection(findTextRange(editor, 'sat'))
    expect(selectionMenuShouldShow(editor)).toBe(true)
    editor.destroy()
  })

  it('preserves a combining mark while another annotation is applied beside it', () => {
    const editor = createTestEditor('<p>a\u0301 tone</p>')
    apply(editor, 'tone', 'reduce')
    expect(plainText(editor)).toBe('a\u0301 tone')
    expect(editor.state.doc.textContent.includes('\u0301')).toBe(true)
    expect(markedSegments(editor, 'reduce').join('')).toBe('tone')
    editor.destroy()
  })
})
