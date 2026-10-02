import type { JSONContent } from '@tiptap/core'
import { afterEach, describe, expect, it } from 'vitest'
import { getPlainText } from '../document/plainText'
import { annotationDefinitions } from '../editor/annotations/definitions'
import { createTestEditor, findTextRange, markedSegments, plainText } from '../editor/testSupport'
import { getSearchState, setSearchQuery } from '../search/searchExtension'
import { documentExportCss, EXPORT_WIDTH_PX } from './documentCss'
import { renderDocumentHtml } from './documentHtml'
import { ExportError, exportErrorMessage, PNG_MAX_DIMENSION, renderDocumentPng, resolvePngScale } from './renderPng'

const schwa = '\u0259'
const theta = '\u03B8'
const legacyOpenE = '\u0190\u0259'
const upArrow = '\u21D1'
const combining = 'a\u0301'

function doc(paragraphs: JSONContent[]): JSONContent {
  return { type: 'doc', content: paragraphs }
}

function paragraph(content: JSONContent[]): JSONContent {
  return { type: 'paragraph', content }
}

function text(value: string, marks?: { type: string; attrs?: Record<string, string> }[]): JSONContent {
  return marks ? { type: 'text', text: value, marks } : { type: 'text', text: value }
}

describe('HTML export', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('writes a self-contained document with internal CSS and no application runtime', () => {
    const html = renderDocumentHtml(doc([paragraph([text('Hello')])]))
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<style>')
    expect(html).toContain('annotation-error')
    expect(html).toContain('--annotation-error-bg')
    expect(html).toContain(`width: ${EXPORT_WIDTH_PX}px`)
    expect(html).not.toContain('<link')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('localhost')
    expect(html).not.toContain('/src/')
    expect(html).not.toContain('editor.css')
    expect(documentExportCss()).toContain('.annotation-strike')
  })

  it('preserves paragraphs, hard breaks, and every phonetic mark', () => {
    const editor = createTestEditor('<p>one<br>two</p><p>three</p>')
    const words = annotationDefinitions.map((definition) => definition.key)
    editor.commands.insertContent(words.join(' '))
    for (const definition of annotationDefinitions) {
      editor.commands.setTextSelection(findTextRange(editor, definition.key))
      editor.commands.applyAnnotation(definition.key)
    }
    const html = renderDocumentHtml(editor.getJSON())
    expect(html).toContain('<p>')
    expect(html).toContain('<br>')
    expect(html).toContain('three')
    for (const definition of annotationDefinitions) {
      expect(html).toContain(`data-annotation="${definition.key}"`)
      expect(html).toContain(definition.className)
    }
    editor.destroy()
  })

  it('nests overlapping marks and keeps plain text free of markup metadata', () => {
    const editor = createTestEditor('<p>alpha beta</p>')
    editor.commands.setTextSelection(findTextRange(editor, 'alpha'))
    editor.commands.applyAnnotation('error')
    editor.commands.applyAnnotation('voicing')
    editor.commands.setTextSelection(findTextRange(editor, 'beta'))
    editor.commands.applyAnnotation('stretch')
    editor.commands.applyAnnotation('strike')
    const before = plainText(editor)
    const html = renderDocumentHtml(editor.getJSON())
    const article = html.slice(html.indexOf('<article'))
    expect(article).toContain('data-annotation="error"')
    expect(article).toContain('data-annotation="voicing"')
    expect(article).toContain('data-annotation="stretch"')
    expect(article).toContain('data-annotation="strike"')
    expect(article).toMatch(/data-annotation="(?:error|voicing)"[^>]*>\s*<span[^>]*data-annotation="(?:error|voicing)"/)
    expect(plainText(editor)).toBe(before)
    expect(getPlainText(editor.getJSON())).toBe('alpha beta')
    expect(getPlainText(editor.getJSON())).not.toContain('annotation-')
    expect(getPlainText(editor.getJSON())).not.toContain('data-annotation')
    editor.destroy()
  })

  it('preserves IPA, legacy Ɛə, intonation arrows, and combining marks without normalizing', () => {
    const sample = `${schwa} ${theta} ${legacyOpenE} ${upArrow} ${combining}`
    const html = renderDocumentHtml(doc([paragraph([text(sample)])]))
    expect(html).toContain(schwa)
    expect(html).toContain(theta)
    expect(html).toContain(legacyOpenE)
    expect(html).not.toContain('\u025B\u0259')
    expect(html).toContain(upArrow)
    expect(html).toContain(combining)
    expect(html).not.toContain('\u00E1')
    expect(getPlainText(doc([paragraph([text(sample)])]))).toBe(sample)
  })

  it('escapes user text and drops comment and research metadata', () => {
    const html = renderDocumentHtml(
      doc([
        paragraph([
          text('<script>alert("x")</script> & "quotes"'),
          text('secret note', [
            { type: 'comment', attrs: { id: '1', body: '<script>secret</script>' } },
            { type: 'researchMarker', attrs: { id: '2', label: 'lab-note' } },
          ]),
        ]),
      ]),
    )
    expect(html).not.toContain('<script')
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
    expect(html).toContain('secret note')
    expect(html).not.toContain('lab-note')
    expect(html).not.toContain('data-comment')
    expect(getPlainText(doc([paragraph([text('secret note')])]))).toBe('secret note')
  })

  it('omits search decorations, the search query, and application controls', () => {
    const editor = createTestEditor('<p>cat sat</p>')
    editor.commands.setTextSelection(findTextRange(editor, 'cat'))
    editor.commands.applyAnnotation('nasal')
    editor.commands.setTextSelection(findTextRange(editor, 'sat'))
    editor.commands.applyAnnotation('alternate')
    setSearchQuery(editor, 'zz-export-query')
    const html = renderDocumentHtml(editor.getJSON())
    expect(html).not.toContain('search-match')
    expect(html).not.toContain('zz-export-query')
    expect(html).not.toContain('Export PNG')
    expect(html).not.toContain('Clear passage')
    expect(html).not.toContain('Vowels')
    expect(html).not.toContain('Previous')
    expect(html).toContain('data-annotation="nasal"')
    expect(html).toContain('data-annotation="alternate"')
    expect(html).toContain('annotation-alternate')
    expect(html).toContain('#1d4ed8')
    expect(html).toContain('sat')
    expect(markedSegments(editor, 'nasal').join('')).toBe('cat')
    editor.destroy()
  })
})

describe('PNG export', () => {
  it('uses a fixed document width and refuses to crop an oversized passage', () => {
    expect(documentExportCss()).toContain(`width: ${EXPORT_WIDTH_PX}px`)
    expect(documentExportCss()).not.toContain('100vw')
    expect(resolvePngScale(EXPORT_WIDTH_PX, 4000)).toBe(2)
    expect(resolvePngScale(EXPORT_WIDTH_PX, 9000)).toBe(1)
    expect(() => resolvePngScale(EXPORT_WIDTH_PX, PNG_MAX_DIMENSION + 1)).toThrow(ExportError)
  })

  it('turns unexpected failures into a short message and keeps known limits readable', () => {
    expect(exportErrorMessage(new Error('Error: secret stack at renderPng.ts'), 'PNG')).toBe('PNG export failed.')
    expect(exportErrorMessage(new ExportError('This passage is too long to export as one PNG.'), 'PNG')).toBe(
      'This passage is too long to export as one PNG.',
    )
  })

  it('does not mutate the editor when rendering fails', async () => {
    const editor = createTestEditor('<p>cat</p>')
    editor.commands.setTextSelection({ from: 1, to: 4 })
    editor.commands.applyAnnotation('error')
    setSearchQuery(editor, 'zz-export-query')
    const before = JSON.stringify(editor.getJSON())
    const plain = plainText(editor)
    await expect(renderDocumentPng('<html><body><p>no document surface</p></body></html>')).rejects.toBeInstanceOf(
      ExportError,
    )
    expect(JSON.stringify(editor.getJSON())).toBe(before)
    expect(plainText(editor)).toBe(plain)
    expect(getSearchState(editor).query).toBe('zz-export-query')
    expect(markedSegments(editor, 'error').join('')).toBe('cat')
    expect(renderDocumentHtml(editor.getJSON())).not.toContain('search-match')
    expect(renderDocumentHtml(editor.getJSON())).toContain('cat')
    editor.destroy()
  })
})
