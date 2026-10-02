import { afterEach, describe, expect, it } from 'vitest'
import { createTestEditor, findTextRange, pastePlain, plainText } from './testSupport'

describe('editable text', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('inserts and deletes characters without a separate edit mode', () => {
    const editor = createTestEditor()
    editor.commands.insertContent('Hello')
    expect(plainText(editor)).toBe('Hello')
    const range = findTextRange(editor, 'llo')
    editor.commands.deleteRange(range)
    expect(plainText(editor)).toBe('He')
    editor.destroy()
  })

  it('selects an arbitrary range', () => {
    const editor = createTestEditor('<p>Hello cat</p>')
    const range = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(range)
    expect(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)).toBe(
      'cat',
    )
    editor.destroy()
  })

  it('undoes and redoes a text edit', () => {
    const editor = createTestEditor('<p>Hello</p>')
    editor.commands.focus('end')
    editor.commands.insertContent('!')
    expect(plainText(editor)).toBe('Hello!')
    editor.commands.undo()
    expect(plainText(editor)).toBe('Hello')
    editor.commands.redo()
    expect(plainText(editor)).toBe('Hello!')
    editor.destroy()
  })

  it('pastes plain text at the cursor inside an existing paragraph', () => {
    const editor = createTestEditor('<p>Hello world</p>')
    const range = findTextRange(editor, 'world')
    editor.commands.setTextSelection(range.from)
    pastePlain(editor, 'big ')
    expect(plainText(editor)).toBe('Hello big world')
    editor.destroy()
  })
})
