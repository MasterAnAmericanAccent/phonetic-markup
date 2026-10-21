import { describe, expect, it } from 'vitest'
import { createTestEditor, findTextRange, markedSegments } from '../editor/testSupport'
import { clearStandardFormatting } from '../editor/commands/clearFormatting'
import { insertSymbolAtSelection } from '../ipa/insertSymbol'
import { ipaSymbols, symbolsInCategory } from '../ipa/ipaData'
import { htmlExportFilename } from '../export/download'
import { renderDocumentHtml } from '../export/documentHtml'
import { annotationDefinitions } from '../editor/annotations/definitions'
import { annotationCss } from '../styles/sharedCss'

describe('M1 final corrections', () => {
  it('timestamps each HTML export with local fields including zero padding', () => {
    expect(htmlExportFilename(new Date(2026, 0, 2, 3, 4, 5))).toBe('ACB-Phonetic-Markup-2026-01-02_03-04-05.html')
    expect(htmlExportFilename(new Date(2026, 10, 12, 13, 14, 15))).toBe('ACB-Phonetic-Markup-2026-11-12_13-14-15.html')
  })
  for (const keys of [
    ['voicing', 'nasal'], ['error', 'voicing', 'nasal'], ['voicing', 'alternate'],
    ['connect', 'alternate', 'voicing'], ['alternate', 'nasal'], ['error', 'alternate'],
  ] as const) {
    for (const reverse of [false, true]) it(`preserves ${keys.join('+')} in ${reverse ? 'reverse' : 'forward'} order and independent removal`, () => {
      const editor = createTestEditor('<p>word</p>')
      editor.commands.setTextSelection(findTextRange(editor, 'word'))
      for (const key of reverse ? [...keys].reverse() : keys) editor.commands.applyAnnotation(key)
      const html = renderDocumentHtml(editor.getJSON())
      for (const key of keys) {
        expect(markedSegments(editor, key).join('')).toBe('word')
        expect(html).toContain(`data-annotation="${key}"`)
      }
      editor.commands.removeAnnotation(keys[0])
      expect(markedSegments(editor, keys[0])).toEqual([])
      for (const key of keys.slice(1)) expect(markedSegments(editor, key).join('')).toBe('word')
      editor.destroy()
    })
  }
  it('gives Alternative a separate lane shared with exports', () => {
    expect(annotationCss).toContain('padding-bottom: 0.3em')
    expect(annotationCss).toContain('text-underline-offset: 0.18em')
  })
  it('captures current layout rather than a fixed export width', () => {
    const editor = createTestEditor('<p>one  two</p>')
    editor.view.dom.style.cssText = 'width: 413px; padding: 11px; font-size: 23px; font-family: Georgia; box-sizing: border-box'
    const html = renderDocumentHtml(editor.getJSON(), editor.view.dom)
    expect(html).toContain('width: 413px')
    expect(html).toContain('font-size: 23px')
    expect(new DOMParser().parseFromString(html, 'text/html').querySelector<HTMLElement>('article')?.style.paddingLeft).toBe('11px')
    expect(html).not.toContain('760px')
    expect(html).not.toContain('<link')
    editor.destroy()
  })
  it('inserts editable offset IPA without offsetting subsequent typing and round-trips it', () => {
    const editor = createTestEditor('<p>word</p>')
    editor.commands.setTextSelection(findTextRange(editor, 'word'))
    insertSymbolAtSelection(editor, '\u0259')
    expect(editor.state.doc.textContent).toBe('word\u0259')
    expect(markedSegments(editor, 'ipaOffset')).toEqual(['\u0259'])
    editor.commands.insertContent('!')
    expect(markedSegments(editor, 'ipaOffset')).toEqual(['\u0259'])
    const html = renderDocumentHtml(editor.getJSON())
    expect(html).toContain('vertical-align: super')
    expect(html).toContain('font-size: 150%')
    const restored = createTestEditor(editor.getHTML())
    expect(markedSegments(restored, 'ipaOffset')).toEqual(['\u0259'])
    editor.destroy(); restored.destroy()
  })
  it('preserves exact whitespace, all Unicode, and all schema marks independently of the selection', () => {
    const marks = [...annotationDefinitions.map(definition => ({ type: definition.key })),
      ...['bold', 'italic', 'underline', 'textStrike', 'ipaOffset', 'comment', 'researchMarker'].map(type => ({ type }))]
    const editor = createTestEditor({ type: 'doc', content: [
      { type: 'heading', attrs: { level: 2, textAlign: 'right' }, content: [
        { type: 'text', text: '  A\tǣ ə a\u0301!  ', marks }, { type: 'hardBreak' }, { type: 'text', text: 'next  line', marks },
      ] }, { type: 'paragraph' }, { type: 'paragraph', content: [{ type: 'text', text: 'last', marks }] },
    ] })
    const text = editor.state.doc.textContent
    clearStandardFormatting(editor)
    expect(editor.state.doc.textContent).toBe(text)
    editor.state.doc.descendants(node => { expect(node.marks).toEqual([]) })
    expect(editor.getJSON().content).toHaveLength(3)
    const plain = editor.getJSON()
    editor.commands.insertContent('typed')
    editor.commands.undo()
    expect(editor.getJSON()).toEqual(plain)
    editor.destroy()
  })
  it('keeps every palette group and includes the approved vowel exactly once', () => {
    for (const group of ['vowel', 'consonant', 'intonation'] as const) expect(symbolsInCategory(group).length).toBeGreaterThan(0)
    expect(ipaSymbols.filter(symbol => symbol.character === '\u01e3')).toHaveLength(1)
    expect(symbolsInCategory('vowel').filter(symbol => symbol.character === '\u01e3')).toHaveLength(1)
  })
  it('clears nested blocks and every mark, preserving characters and breaks with single-step undo', () => {
    const editor = createTestEditor('<blockquote><h2 style="text-align:right"><strong> A  ə</strong><br>line</h2></blockquote><ul><li><p>two</p></li><li><p></p></li></ul>')
    editor.chain().selectAll().applyAnnotation('error').applyAnnotation('alternate').applyAnnotation('voicing').setMark('ipaOffset').run()
    const before = editor.getJSON()
    const originalText = editor.state.doc.textContent
    editor.commands.setTextSelection(2)
    clearStandardFormatting(editor)
    expect(editor.getJSON().content?.map(node => node.type)).toEqual(['paragraph', 'paragraph', 'paragraph'])
    expect(editor.state.doc.textContent).toBe(originalText)
    expect(editor.getHTML()).not.toMatch(/data-|<strong|<h2|<ul|<blockquote|style=/)
    expect(editor.getHTML()).toContain('<br>')
    expect(editor.state.storedMarks).toEqual([])
    const cleared = editor.getJSON()
    editor.commands.undo()
    expect(editor.getJSON()).toEqual(before)
    editor.commands.redo()
    expect(editor.getJSON()).toEqual(cleared)
    editor.commands.insertContent('editable')
    expect(editor.state.doc.textContent).toContain('editable')
    editor.destroy()
  })
})
