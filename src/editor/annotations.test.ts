import { afterEach, describe, expect, it } from 'vitest'
import {
  createTestEditor,
  findTextRange,
  markedSegments,
  plainText,
} from './testSupport'

const passage = '<p>Hello cat sat</p><p>Other paragraph</p>'

describe('text-bound annotations', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('applies a mark without turning the passage into a fixed overlay', () => {
    const editor = createTestEditor(passage)
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    expect(editor.commands.applyAnnotation('error')).toBe(true)
    expect(markedSegments(editor, 'error')).toEqual(['cat'])
    const html = editor.view.dom.innerHTML
    expect(html).toContain('data-annotation="error"')
    expect(html).not.toMatch(/position:\s*absolute/)
    editor.destroy()
  })

  it('keeps the mark on the original text when text is inserted before it', () => {
    const editor = createTestEditor(passage)
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    editor.commands.applyAnnotation('error')
    editor.commands.insertContentAt(range.from, 'big ')
    expect(plainText(editor)).toBe('Hello big cat sat\n\nOther paragraph')
    expect(markedSegments(editor, 'error')).toEqual(['cat'])
    editor.destroy()
  })

  it('extends the mark across text inserted inside it', () => {
    const editor = createTestEditor(passage)
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    editor.commands.applyAnnotation('error')
    editor.commands.insertContentAt(range.from + 1, 'X')
    expect(markedSegments(editor, 'error')).toEqual(['cXat'])
    editor.destroy()
  })

  it('does not extend the mark onto text inserted after it', () => {
    const editor = createTestEditor(passage)
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    editor.commands.applyAnnotation('error')
    editor.commands.insertContentAt(range.to, 's')
    expect(plainText(editor)).toContain('cats')
    expect(markedSegments(editor, 'error')).toEqual(['cat'])
    editor.destroy()
  })

  it('keeps the mark when text before it is deleted', () => {
    const editor = createTestEditor(passage)
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    editor.commands.applyAnnotation('error')
    const hello = findTextRange(editor, 'Hello ')
    editor.commands.deleteRange(hello)
    expect(plainText(editor)).toBe('cat sat\n\nOther paragraph')
    expect(markedSegments(editor, 'error')).toEqual(['cat'])
    editor.destroy()
  })

  it('keeps the mark on the remaining text after a partial delete', () => {
    const editor = createTestEditor(passage)
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    editor.commands.applyAnnotation('error')
    editor.commands.deleteRange({ from: range.from, to: range.from + 1 })
    expect(markedSegments(editor, 'error')).toEqual(['at'])
    editor.destroy()
  })

  it('leaves no mark when the annotated text is deleted', () => {
    const editor = createTestEditor(passage)
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    editor.commands.applyAnnotation('error')
    editor.commands.deleteRange(range)
    expect(markedSegments(editor, 'error')).toEqual([])
    expect(plainText(editor)).toBe('Hello  sat\n\nOther paragraph')
    editor.destroy()
  })

  it('does not change a mark when another paragraph is edited', () => {
    const editor = createTestEditor(passage)
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    editor.commands.applyAnnotation('error')
    const other = findTextRange(editor, 'Other')
    editor.commands.insertContentAt(other.from, 'Edited ')
    expect(markedSegments(editor, 'error')).toEqual(['cat'])
    expect(plainText(editor)).toContain('Edited Other paragraph')
    editor.destroy()
  })

  it('undoes and redoes annotation changes with the text', () => {
    const editor = createTestEditor(passage)
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    editor.commands.applyAnnotation('error')
    editor.commands.insertContentAt(range.from, 'big ')
    expect(markedSegments(editor, 'error')).toEqual(['cat'])
    editor.commands.undo()
    expect(plainText(editor)).toBe('Hello cat sat\n\nOther paragraph')
    expect(markedSegments(editor, 'error')).toEqual(['cat'])
    editor.commands.undo()
    expect(markedSegments(editor, 'error')).toEqual([])
    editor.commands.redo()
    expect(markedSegments(editor, 'error')).toEqual(['cat'])
    editor.destroy()
  })

  it('lets two mark types overlap and removes only the requested one', () => {
    const editor = createTestEditor(passage)
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    editor.commands.applyAnnotation('error')
    editor.commands.applyAnnotation('voicing')
    expect(markedSegments(editor, 'error')).toEqual(['cat'])
    expect(markedSegments(editor, 'voicing')).toEqual(['cat'])
    const before = plainText(editor)
    editor.commands.setTextSelection(findTextRange(editor, 'cat'))
    editor.commands.removeAnnotation('error')
    expect(markedSegments(editor, 'error')).toEqual([])
    expect(markedSegments(editor, 'voicing')).toEqual(['cat'])
    expect(plainText(editor)).toBe(before)
    editor.destroy()
  })

  it('restores both text and marks when a text edit is undone', () => {
    const editor = createTestEditor('<p>cat</p>')
    editor.commands.setTextSelection({ from: 1, to: 4 })
    editor.commands.applyAnnotation('nasal')
    editor.commands.insertContentAt(2, 'Z')
    expect(markedSegments(editor, 'nasal')).toEqual(['cZat'])
    editor.commands.undo()
    expect(plainText(editor)).toBe('cat')
    expect(markedSegments(editor, 'nasal')).toEqual(['cat'])
    editor.destroy()
  })
})
