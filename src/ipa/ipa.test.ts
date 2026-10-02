import { afterEach, describe, expect, it } from 'vitest'
import { deserializeDocument, serializeDocument } from '../document/serialize'
import { createTestEditor, findTextRange, markedSegments, pastePlain, plainText } from '../editor/testSupport'
import { ipaSymbols, symbolsInCategory } from './ipaData'
import { insertSymbolAtSelection, offsetAfterGrapheme } from './insertSymbol'

const schwa = '\u0259'
const smallCapI = '\u026A'
const upArrow = '\u21D1'
const flap = 't\u032C'
const combining = 'a\u0301'
const legacyOpenE = '\u0190\u0259'

function cursor(editor: ReturnType<typeof createTestEditor>): number {
  expect(editor.state.selection.empty).toBe(true)
  return editor.state.selection.from
}

describe('IPA inventory', () => {
  it('keeps the legacy vowel, consonant, and intonation lists', () => {
    expect(symbolsInCategory('vowel').map((symbol) => symbol.character)).toEqual([
      '\u0259',
      '\u026A',
      '\u028A',
      '\u00E6',
      '\u0251',
      '\u025B',
      '\u0254',
      '\u028C',
      'u',
      'e',
      'i',
      'o',
      'a',
      'y',
      'w',
      'a\u026Ay',
      'e\u026Ay',
      '\u0254\u026Ay',
      'o\u028Aw',
      'a\u028Aw',
      '\u0190\u0259',
      '\u025A',
    ])
    expect(symbolsInCategory('consonant').map((symbol) => symbol.character)).toContain(flap)
    expect(symbolsInCategory('intonation').map((symbol) => symbol.character)).toEqual([
      '\u21D1',
      '\u21D3',
      '\u21D2',
      '\u21D7',
      '\u21D8',
    ])
  })

  it('preserves legacy Ɛə as U+0190 plus U+0259', () => {
    const symbol = ipaSymbols.find((item) => item.character === legacyOpenE)
    expect(symbol?.codePoints).toEqual(['U+0190', 'U+0259'])
    expect(legacyOpenE.codePointAt(0)).toBe(0x0190)
    expect(legacyOpenE.codePointAt(1)).not.toBe(0x025b)
  })
})

describe('IPA insertion', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('inserts a vowel at a collapsed cursor and leaves the cursor after it', () => {
    const editor = createTestEditor('<p>Hello</p>')
    editor.commands.setTextSelection(6)
    expect(insertSymbolAtSelection(editor, schwa)).toBe(true)
    expect(plainText(editor)).toBe(`Hello${schwa}`)
    expect(cursor(editor)).toBe(7)
    editor.destroy()
  })

  it('inserts a consonant at a collapsed cursor', () => {
    const editor = createTestEditor('<p>wa</p>')
    editor.commands.setTextSelection(3)
    insertSymbolAtSelection(editor, flap)
    expect(plainText(editor)).toBe(`wa${flap}`)
    expect(cursor(editor)).toBe(3 + flap.length)
    expect(editor.state.doc.textContent.includes('\u032C')).toBe(true)
    editor.destroy()
  })

  it('inserts an intonation character', () => {
    const editor = createTestEditor('<p>yes</p>')
    editor.commands.setTextSelection(4)
    insertSymbolAtSelection(editor, upArrow)
    expect(plainText(editor)).toBe(`yes${upArrow}`)
    expect(cursor(editor)).toBe(5)
    editor.destroy()
  })

  it('undoes and redoes an insertion', () => {
    const editor = createTestEditor('<p>cat</p>')
    editor.commands.setTextSelection(4)
    insertSymbolAtSelection(editor, schwa)
    editor.commands.undo()
    expect(plainText(editor)).toBe('cat')
    editor.commands.redo()
    expect(plainText(editor)).toBe(`cat${schwa}`)
    editor.destroy()
  })

  it('inserts several symbols in a row', () => {
    const editor = createTestEditor('<p></p>')
    editor.commands.setTextSelection(1)
    insertSymbolAtSelection(editor, schwa)
    insertSymbolAtSelection(editor, smallCapI)
    expect(plainText(editor)).toBe(`${schwa}${smallCapI}`)
    expect(cursor(editor)).toBe(1 + schwa.length + smallCapI.length)
    editor.destroy()
  })

  it('inserts at the beginning, middle, and end of a paragraph', () => {
    const editor = createTestEditor('<p>cat</p>')
    editor.commands.setTextSelection(1)
    insertSymbolAtSelection(editor, schwa)
    expect(plainText(editor)).toBe(`${schwa}cat`)
    editor.commands.setTextSelection(3)
    insertSymbolAtSelection(editor, smallCapI)
    expect(plainText(editor)).toBe(`${schwa}c${smallCapI}at`)
    editor.commands.focus('end')
    insertSymbolAtSelection(editor, upArrow)
    expect(plainText(editor)).toBe(`${schwa}c${smallCapI}at${upArrow}`)
    editor.destroy()
  })

  it('replaces a non-empty selection with the symbol', () => {
    const editor = createTestEditor('<p>cat</p>')
    editor.commands.setTextSelection(findTextRange(editor, 'at'))
    insertSymbolAtSelection(editor, schwa)
    expect(plainText(editor)).toBe(`c${schwa}`)
    expect(editor.state.selection.empty).toBe(true)
    editor.destroy()
  })

  it('does not pull a mark onto a symbol inserted before marked text', () => {
    const editor = createTestEditor('<p>say cat</p>')
    editor.commands.setTextSelection(findTextRange(editor, 'cat'))
    editor.commands.applyAnnotation('error')
    const cat = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(cat.from)
    insertSymbolAtSelection(editor, schwa)
    expect(plainText(editor)).toBe(`say ${schwa}cat`)
    expect(markedSegments(editor, 'error').join('')).toBe('cat')
    editor.destroy()
  })

  it('does not extend a mark onto a symbol inserted after it', () => {
    const editor = createTestEditor('<p>cat sat</p>')
    editor.commands.setTextSelection(findTextRange(editor, 'cat'))
    editor.commands.applyAnnotation('voicing')
    const cat = findTextRange(editor, 'cat')
    editor.commands.setTextSelection(cat.to)
    insertSymbolAtSelection(editor, schwa)
    expect(markedSegments(editor, 'voicing').join('')).toBe('cat')
    expect(plainText(editor)).toContain(`${schwa}`)
    editor.destroy()
  })

  it('keeps a symbol typed inside a mark on that mark', () => {
    const editor = createTestEditor('<p>cat</p>')
    editor.commands.setTextSelection({ from: 1, to: 4 })
    editor.commands.applyAnnotation('nasal')
    editor.commands.setTextSelection(2)
    insertSymbolAtSelection(editor, schwa)
    expect(plainText(editor)).toBe(`c${schwa}at`)
    expect(markedSegments(editor, 'nasal').join('')).toBe(`c${schwa}at`)
    editor.destroy()
  })

  it('inserts between two different marks without taking either mark', () => {
    const editor = createTestEditor('<p>cat sat</p>')
    editor.commands.setTextSelection(findTextRange(editor, 'cat'))
    editor.commands.applyAnnotation('error')
    editor.commands.setTextSelection(findTextRange(editor, 'sat'))
    editor.commands.applyAnnotation('glide')
    const gap = findTextRange(editor, ' ')
    editor.commands.setTextSelection(gap.to)
    insertSymbolAtSelection(editor, schwa)
    expect(markedSegments(editor, 'error').join('')).toBe('cat')
    expect(markedSegments(editor, 'glide').join('')).toBe('sat')
    expect(plainText(editor)).toBe(`cat ${schwa}sat`)
    editor.destroy()
  })
})

describe('Unicode IPA', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('round-trips IPA and a combining sequence without changing code points', () => {
    const editor = createTestEditor(`<p>${schwa} ${combining} ${flap}</p>`)
    const stored = serializeDocument(editor.getJSON())
    const restored = deserializeDocument(JSON.parse(JSON.stringify(stored)))
    const next = createTestEditor(restored.content)
    expect(plainText(next)).toBe(`${schwa} ${combining} ${flap}`)
    expect(next.state.doc.textContent).toBe(`${schwa} ${combining} ${flap}`)
    expect(next.state.doc.textContent.includes('\u0301')).toBe(true)
    expect(next.state.doc.textContent.includes('\u00E1')).toBe(false)
    editor.destroy()
    next.destroy()
  })

  it('pastes IPA and a combining mark unchanged', () => {
    const editor = createTestEditor()
    pastePlain(editor, `${schwa} ${combining}`)
    expect(plainText(editor)).toBe(`${schwa} ${combining}`)
    expect(editor.state.doc.textContent.includes('\u0301')).toBe(true)
    editor.destroy()
  })

  it('edits around a combining sequence without splitting it', () => {
    const editor = createTestEditor(`<p>x${combining}y</p>`)
    editor.commands.deleteRange(findTextRange(editor, 'x'))
    expect(plainText(editor)).toBe(`${combining}y`)
    editor.commands.focus('end')
    insertSymbolAtSelection(editor, schwa)
    expect(plainText(editor)).toBe(`${combining}y${schwa}`)
    const cluster = editor.state.doc.textContent
    expect(cluster.indexOf('\u0301')).toBe(cluster.indexOf('a') + 1)
    editor.destroy()
  })

  it('does not insert into the middle of a combining sequence', () => {
    const editor = createTestEditor(`<p>${combining}</p>`)
    expect(offsetAfterGrapheme(combining, 1)).toBe(combining.length)
    editor.commands.setTextSelection(2)
    insertSymbolAtSelection(editor, 'z')
    expect(plainText(editor)).toBe(`${combining}z`)
    editor.destroy()
  })
})
