import { afterEach, describe, expect, it } from 'vitest'
import { createTestEditor, pasteHtml, pastePlain, plainText } from './testSupport'

describe('paste', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps a single newline as a hard break and a blank line as a paragraph', () => {
    const editor = createTestEditor()
    pastePlain(editor, 'one\ntwo\n\nthree')
    expect(plainText(editor)).toBe('one\ntwo\n\nthree')
    expect(editor.getJSON().content).toHaveLength(2)
    editor.destroy()
  })

  it('does not collapse a multi-paragraph paste into one paragraph', () => {
    const editor = createTestEditor()
    pastePlain(editor, 'Alpha\n\nBeta')
    expect(editor.getJSON().content?.map((block) => block.type)).toEqual(['paragraph', 'paragraph'])
    expect(plainText(editor)).toBe('Alpha\n\nBeta')
    editor.destroy()
  })

  it('preserves unicode and combining diacritics in one text sequence', () => {
    const editor = createTestEditor()
    const sample = 'naïve \u0259 a\u0301'
    pastePlain(editor, sample)
    expect(plainText(editor)).toBe(sample)
    const text = editor.state.doc.textContent
    expect(text.includes('\u0301')).toBe(true)
    expect(text.includes('\u0259')).toBe(true)
    editor.destroy()
  })

  it('drops external formatting and keeps line structure from HTML', () => {
    const editor = createTestEditor()
    pasteHtml(
      editor,
      '<p style="color:red"><b>Hello</b><br>there</p><p>Next <span data-annotation="error">\u0259</span></p>',
    )
    expect(plainText(editor)).toBe('Hello\nthere\n\nNext \u0259')
    const json = JSON.stringify(editor.getJSON())
    expect(json.includes('error')).toBe(false)
    expect(json.includes('bold')).toBe(false)
    expect(json.includes('color:red')).toBe(false)
    editor.destroy()
  })

  it('keeps pasted angle brackets as text', () => {
    const editor = createTestEditor()
    pastePlain(editor, 'a <b> tag')
    expect(plainText(editor)).toBe('a <b> tag')
    editor.destroy()
  })

  it('pastes into an existing document at the cursor', () => {
    const editor = createTestEditor('<p>Start</p>')
    editor.commands.focus('end')
    pastePlain(editor, '\n\nMore')
    expect(plainText(editor)).toBe('Start\n\nMore')
    editor.destroy()
  })
})
