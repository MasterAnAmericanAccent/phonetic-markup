import { afterEach, describe, expect, it } from 'vitest'
import { deserializeDocument, serializeDocument } from '../document/serialize'
import { annotationDefinitions } from '../editor/annotations/definitions'
import { createTestEditor, findTextRange, markedSegments, plainText } from '../editor/testSupport'
import { insertSymbolAtSelection } from '../ipa/insertSymbol'
import {
  clearSearch,
  getSearchState,
  goToNextMatch,
  goToPreviousMatch,
  setSearchQuery,
} from './searchExtension'

const schwa = '\u0259'
const diphthong = 'a\u026Ay'
const legacyOpenE = '\u0190\u0259'
const openESchwa = '\u025B\u0259'
const combining = 'a\u0301'

function matchClasses(editor: ReturnType<typeof createTestEditor>): string[] {
  return [...editor.view.dom.querySelectorAll('.search-match')].map((node) =>
    node.classList.contains('search-match-active') ? 'active' : 'match',
  )
}

describe('document search', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('finds ordinary text and reports the count', () => {
    const editor = createTestEditor('<p>The cat sat.</p>')
    setSearchQuery(editor, 'cat')
    const search = getSearchState(editor)
    expect(search.matches).toHaveLength(1)
    expect(search.activeIndex).toBe(0)
    expect(plainText(editor)).toBe('The cat sat.')
    editor.destroy()
  })

  it('finds a single character and a partial word', () => {
    const editor = createTestEditor('<p>catalog</p>')
    setSearchQuery(editor, 'a')
    expect(getSearchState(editor).matches).toHaveLength(2)
    setSearchQuery(editor, 'log')
    expect(getSearchState(editor).matches).toHaveLength(1)
    expect(plainText(editor)).toBe('catalog')
    editor.destroy()
  })

  it('numbers multiple matches and distinguishes the active one', () => {
    const editor = createTestEditor('<p>cat cat cat</p>')
    setSearchQuery(editor, 'cat')
    const search = getSearchState(editor)
    expect(search.matches).toHaveLength(3)
    expect(search.activeIndex).toBe(0)
    expect(matchClasses(editor)).toEqual(['active', 'match', 'match'])
    editor.destroy()
  })

  it('shows no matches without changing the document', () => {
    const editor = createTestEditor('<p>cat</p>')
    const before = JSON.stringify(editor.getJSON())
    setSearchQuery(editor, 'dog')
    expect(getSearchState(editor).matches).toEqual([])
    expect(getSearchState(editor).activeIndex).toBe(-1)
    expect(matchClasses(editor)).toEqual([])
    expect(JSON.stringify(editor.getJSON())).toBe(before)
    editor.destroy()
  })

  it('moves to the next and previous match and wraps', () => {
    const editor = createTestEditor('<p>one two one two one</p>')
    setSearchQuery(editor, 'one')
    const starts = () => getSearchState(editor).matches.map((match) => match.from)
    const first = getSearchState(editor).matches[0]?.from
    goToNextMatch(editor)
    expect(getSearchState(editor).activeIndex).toBe(1)
    expect(matchClasses(editor)[1]).toBe('active')
    goToNextMatch(editor)
    expect(getSearchState(editor).activeIndex).toBe(2)
    goToNextMatch(editor)
    expect(getSearchState(editor).activeIndex).toBe(0)
    expect(getSearchState(editor).matches[0]?.from).toBe(first)
    goToPreviousMatch(editor)
    expect(getSearchState(editor).activeIndex).toBe(2)
    expect(starts()).toEqual(getSearchState(editor).matches.map((match) => match.from))
    editor.destroy()
  })

  it('clears decorations and leaves annotations in place', () => {
    const editor = createTestEditor('<p>cat sat</p>')
    editor.commands.setTextSelection(findTextRange(editor, 'cat'))
    editor.commands.applyAnnotation('error')
    editor.commands.setTextSelection(findTextRange(editor, 'sat'))
    editor.commands.applyAnnotation('voicing')
    setSearchQuery(editor, 'a')
    expect(matchClasses(editor).length).toBeGreaterThan(0)
    clearSearch(editor)
    expect(getSearchState(editor).query).toBe('')
    expect(matchClasses(editor)).toEqual([])
    expect(markedSegments(editor, 'error').join('')).toBe('cat')
    expect(markedSegments(editor, 'voicing').join('')).toBe('sat')
    editor.destroy()
  })

  it('does not change serialization, plain text, or undo history', () => {
    const editor = createTestEditor('<p>hello</p>')
    editor.commands.focus('end')
    editor.commands.insertContent('!')
    const beforeSearch = JSON.stringify(serializeDocument(editor.getJSON()))
    setSearchQuery(editor, 'hello')
    expect(JSON.stringify(serializeDocument(editor.getJSON()))).toBe(beforeSearch)
    expect(JSON.stringify(editor.getJSON())).not.toContain('search-match')
    expect(plainText(editor)).toBe('hello!')
    editor.commands.undo()
    expect(plainText(editor)).toBe('hello')
    expect(getSearchState(editor).query).toBe('hello')
    expect(getSearchState(editor).matches).toHaveLength(1)
    const restored = deserializeDocument(JSON.parse(beforeSearch))
    expect(JSON.stringify(restored)).not.toContain('searchHighlight')
    editor.destroy()
  })

  it('searches text inside every phonetic mark without changing those marks', () => {
    const words = annotationDefinitions.map((definition) => definition.key)
    const editor = createTestEditor(`<p>${words.join(' ')}</p>`)
    for (const definition of annotationDefinitions) {
      editor.commands.setTextSelection(findTextRange(editor, definition.key))
      editor.commands.applyAnnotation(definition.key)
    }
    const before = JSON.stringify(editor.getJSON())
    setSearchQuery(editor, 'e')
    expect(getSearchState(editor).matches.length).toBeGreaterThan(0)
    expect(JSON.stringify(editor.getJSON())).toBe(before)
    for (const definition of annotationDefinitions) {
      expect(markedSegments(editor, definition.key).join('')).toBe(definition.key)
    }
    clearSearch(editor)
    expect(JSON.stringify(editor.getJSON())).toBe(before)
    editor.destroy()
  })

  it('matches IPA, a multi-character sequence, and legacy Ɛə without normalizing', () => {
    const editor = createTestEditor(`<p>${schwa} ${diphthong} ${legacyOpenE} ${combining}</p>`)
    setSearchQuery(editor, schwa)
    expect(getSearchState(editor).matches.length).toBeGreaterThan(0)
    setSearchQuery(editor, diphthong)
    expect(getSearchState(editor).matches).toHaveLength(1)
    setSearchQuery(editor, legacyOpenE)
    expect(getSearchState(editor).matches).toHaveLength(1)
    setSearchQuery(editor, openESchwa)
    expect(getSearchState(editor).matches).toHaveLength(0)
    setSearchQuery(editor, combining)
    const match = getSearchState(editor).matches[0]
    expect(match).toBeDefined()
    expect(editor.state.doc.textBetween(match?.from ?? 0, match?.to ?? 0)).toBe(combining)
    expect(editor.state.doc.textContent.includes('\u0301')).toBe(true)
    expect(editor.state.doc.textContent.includes('\u00E1')).toBe(false)
    editor.destroy()
  })

  it('keeps a match from crossing a paragraph or a hard break', () => {
    const editor = createTestEditor('<p>hel<br>lo</p><p>cat</p>')
    setSearchQuery(editor, 'hello')
    expect(getSearchState(editor).matches).toHaveLength(0)
    setSearchQuery(editor, 'locat')
    expect(getSearchState(editor).matches).toHaveLength(0)
    setSearchQuery(editor, 'lo')
    expect(getSearchState(editor).matches).toHaveLength(1)
    setSearchQuery(editor, 'cat')
    expect(getSearchState(editor).matches).toHaveLength(1)
    editor.destroy()
  })

  it('updates matches after an edit and after an IPA insertion', () => {
    const editor = createTestEditor('<p>cat</p>')
    setSearchQuery(editor, 'cat')
    expect(getSearchState(editor).matches).toHaveLength(1)
    editor.commands.focus('end')
    editor.commands.insertContent(' cat')
    expect(getSearchState(editor).matches).toHaveLength(2)
    expect(getSearchState(editor).query).toBe('cat')
    editor.commands.focus('end')
    insertSymbolAtSelection(editor, schwa)
    setSearchQuery(editor, schwa)
    expect(getSearchState(editor).matches).toHaveLength(1)
    expect(plainText(editor)).toBe(`cat cat${schwa}`)
    editor.destroy()
  })
})
