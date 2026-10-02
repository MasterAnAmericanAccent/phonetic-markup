import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { FormatToolbar } from './format/FormatToolbar'
import { deserializeDocument, serializeDocument } from '../document/serialize'
import { renderDocumentHtml } from '../export/documentHtml'
import { documentExportCss } from '../export/documentCss'
import { insertSymbolAtSelection } from '../ipa/insertSymbol'
import { getSearchState, setSearchQuery } from '../search/searchExtension'
import { clearStandardFormatting } from './commands/clearFormatting'
import { createTestEditor, findTextRange, markedSegments, pasteHtml, plainText } from './testSupport'

const schwa = '\u0259'

function marksOn(editor: ReturnType<typeof createTestEditor>, text: string): string[] {
  const range = findTextRange(editor, text)
  const node = editor.state.doc.nodeAt(range.from)
  return (node?.marks ?? []).map((mark) => mark.type.name).sort()
}

describe('rich text formatting', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('sets paragraph, headings, and alignment without dropping an annotation', () => {
    const editor = createTestEditor('<p>pronunciation</p>')
    const range = findTextRange(editor, 'pronunciation')
    editor.chain().focus().setTextSelection(range).toggleHeading({ level: 2 }).run()
    editor.chain().focus().setTextSelection(range).applyAnnotation('error').run()
    editor.chain().focus().setTextAlign('center').run()
    expect(editor.isActive('heading', { level: 2 })).toBe(true)
    expect(editor.isActive({ textAlign: 'center' })).toBe(true)
    expect(markedSegments(editor, 'error')).toEqual(['pronunciation'])

    editor.chain().focus().setHeading({ level: 1 }).run()
    expect(editor.isActive('heading', { level: 1 })).toBe(true)
    expect(markedSegments(editor, 'error')).toEqual(['pronunciation'])

    editor.chain().focus().setHeading({ level: 3 }).run()
    editor.chain().focus().setParagraph().run()
    expect(editor.isActive('paragraph')).toBe(true)
    expect(markedSegments(editor, 'error')).toEqual(['pronunciation'])
    editor.destroy()
  })

  it('keeps bold, italic, underline, and text strike separate from phonetic marks', () => {
    const editor = createTestEditor('<p>pronunciation</p>')
    const range = findTextRange(editor, 'pronunciation')
    editor
      .chain()
      .focus()
      .setTextSelection(range)
      .toggleBold()
      .toggleItalic()
      .toggleUnderline()
      .toggleStrike()
      .applyAnnotation('error')
      .applyAnnotation('voicing')
      .toggleAnnotation('strike')
      .run()

    expect(marksOn(editor, 'pronunciation')).toEqual([
      'bold',
      'error',
      'italic',
      'strike',
      'textStrike',
      'underline',
      'voicing',
    ])

    editor.chain().focus().setTextSelection(range).unsetBold().run()
    expect(marksOn(editor, 'pronunciation')).not.toContain('bold')
    expect(markedSegments(editor, 'error')).toEqual(['pronunciation'])
    expect(markedSegments(editor, 'italic')).toEqual(['pronunciation'])
    expect(editor.isActive('italic')).toBe(true)

    editor.chain().focus().setTextSelection(range).removeAnnotation('error').run()
    expect(markedSegments(editor, 'error')).toEqual([])
    expect(editor.isActive('italic')).toBe(true)
    expect(editor.isActive('textStrike')).toBe(true)
    expect(editor.isActive('strike')).toBe(true)
    editor.destroy()
  })

  it('clears standard formatting and leaves phonetic annotations', () => {
    const editor = createTestEditor('<p>pronunciation</p>')
    const range = findTextRange(editor, 'pronunciation')
    editor
      .chain()
      .focus()
      .setTextSelection(range)
      .toggleBold()
      .toggleItalic()
      .toggleUnderline()
      .toggleStrike()
      .applyAnnotation('error')
      .toggleAnnotation('strike')
      .setHeading({ level: 2 })
      .setTextAlign('right')
      .run()

    clearStandardFormatting(editor)
    expect(editor.isActive('paragraph')).toBe(true)
    expect(editor.isActive('bold')).toBe(false)
    expect(editor.isActive('italic')).toBe(false)
    expect(editor.isActive('underline')).toBe(false)
    expect(editor.isActive('textStrike')).toBe(false)
    expect(editor.isActive({ textAlign: 'right' })).toBe(false)
    expect(markedSegments(editor, 'error')).toEqual(['pronunciation'])
    expect(markedSegments(editor, 'strike')).toEqual(['pronunciation'])
    editor.destroy()
  })

  it('builds real lists and a blockquote while keeping annotations', () => {
    const editor = createTestEditor('<p>one</p><p>two</p>')
    const one = findTextRange(editor, 'one')
    editor.chain().focus().setTextSelection(one).applyAnnotation('nasal').toggleBlockquote().run()
    expect(editor.isActive('blockquote')).toBe(true)
    expect(markedSegments(editor, 'nasal')).toEqual(['one'])
    editor.chain().focus().toggleBlockquote().run()
    expect(editor.isActive('blockquote')).toBe(false)
    expect(markedSegments(editor, 'nasal')).toEqual(['one'])

    editor.chain().focus().selectAll().toggleBulletList().run()
    expect(editor.getJSON().content?.[0]?.type).toBe('bulletList')
    expect(markedSegments(editor, 'nasal')).toEqual(['one'])
    editor.chain().focus().toggleOrderedList().run()
    expect(editor.getJSON().content?.[0]?.type).toBe('orderedList')
    expect(markedSegments(editor, 'nasal')).toEqual(['one'])

    editor.commands.focus('end')
    expect(editor.chain().focus().splitListItem('listItem').run()).toBe(true)
    expect(editor.getJSON().content?.[0]?.content?.length).toBe(3)
    expect(editor.chain().focus().liftListItem('listItem').run()).toBe(true)

    editor.chain().focus().setTextSelection(findTextRange(editor, 'one')).insertContent('x').run()
    expect(plainText(editor)).toContain('x')
    expect(plainText(editor)).not.toContain('BulletList')
    expect(plainText(editor)).not.toContain('Heading')
    editor.destroy()
  })

  it('undoes and redoes a formatting change', () => {
    const editor = createTestEditor('<p>accent</p>')
    const range = findTextRange(editor, 'accent')
    editor.chain().focus().setTextSelection(range).toggleBold().run()
    expect(editor.isActive('bold')).toBe(true)
    editor.commands.undo()
    expect(editor.isActive('bold')).toBe(false)
    editor.commands.redo()
    expect(editor.isActive('bold')).toBe(true)
    editor.destroy()
  })

  it('inserts IPA inside formatted text and still finds it with search', () => {
    const editor = createTestEditor('<p>The student practices an American accent every day.</p>')
    const word = findTextRange(editor, 'practices')
    editor.chain().focus().setTextSelection(word).toggleBold().setHeading({ level: 2 }).run()
    editor.commands.setTextSelection(word.to)
    expect(insertSymbolAtSelection(editor, schwa)).toBe(true)
    expect(plainText(editor)).toContain(`practices${schwa}`)
    expect(editor.isActive('bold')).toBe(true)

    setSearchQuery(editor, 'practice')
    expect(getSearchState(editor).matches.length).toBeGreaterThan(0)
    const stored = serializeDocument(editor.getJSON())
    expect(JSON.stringify(stored)).not.toContain('search-match')
    const restored = createTestEditor(deserializeDocument(stored).content)
    expect(plainText(restored)).toBe(plainText(editor))
    restored.commands.setTextSelection(findTextRange(restored, 'practices'))
    expect(restored.isActive('heading', { level: 2 })).toBe(true)
    expect(restored.isActive('bold')).toBe(true)
    editor.destroy()
    restored.destroy()
  })

  it('exports rich text with annotations and ignores external paste styling', () => {
    const editor = createTestEditor('<p>pronunciation</p>')
    const range = findTextRange(editor, 'pronunciation')
    editor
      .chain()
      .focus()
      .setTextSelection(range)
      .toggleBold()
      .toggleItalic()
      .applyAnnotation('error')
      .setTextAlign('center')
      .toggleBulletList()
      .run()

    const html = renderDocumentHtml(editor.getJSON())
    const article = html.slice(html.indexOf('<article'))
    expect(article).toContain('<ul>')
    expect(article).toContain('<strong>')
    expect(article).toContain('<em>')
    expect(article).toContain('data-annotation="error"')
    expect(article).toContain('text-align: center')
    expect(article).not.toContain('format-toolbar')
    expect(article).not.toContain('<script')
    expect(documentExportCss()).toContain('blockquote')

    pasteHtml(editor, '<p style="color:red;font-family:Comic Sans MS"><b>styled</b></p>')
    expect(plainText(editor)).toContain('styled')
    expect(editor.getHTML()).not.toContain('Comic Sans')
    expect(editor.getHTML()).not.toContain('color:red')
    editor.destroy()
  })
})

const sample = '<p>The American accent requires careful practice.</p><p>This is the second paragraph.</p>'

function blockSummary(editor: ReturnType<typeof createTestEditor>): string[] {
  const summary: string[] = []
  editor.state.doc.forEach((node) => {
    const level = typeof node.attrs.level === 'number' ? String(node.attrs.level) : ''
    const align = typeof node.attrs.textAlign === 'string' ? node.attrs.textAlign : ''
    summary.push(`${node.type.name}${level}:${align}`)
  })
  return summary
}

describe('formatting scope', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('labels a paragraph as Normal and offers justify', async () => {
    const editor = createTestEditor(sample)
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => {
      root.render(createElement(FormatToolbar, { editor }))
    })
    expect(host.textContent).toContain('Normal')
    expect(host.textContent).not.toContain('Paragraph')
    expect(host.querySelector('[aria-label="Align justify"]')).not.toBeNull()
    await act(async () => {
      editor.chain().setTextSelection(findTextRange(editor, 'American')).setHeading({ level: 2 }).run()
    })
    expect(host.querySelector('[aria-label="Text style, Heading 2"]')).not.toBeNull()
    await act(async () => {
      editor.chain().setTextAlign('justify').run()
    })
    expect(host.querySelector('[aria-label="Align justify"]')?.getAttribute('aria-pressed')).toBe('true')
    root.unmount()
    editor.destroy()
  })

  it('applies headings only to the selected block and Normal restores a paragraph', () => {
    const editor = createTestEditor(sample)
    editor.chain().focus().setTextSelection(findTextRange(editor, 'American')).setHeading({ level: 1 }).run()
    expect(blockSummary(editor)[0]).toBe('heading1:')
    expect(blockSummary(editor)[1]).toBe('paragraph:')

    editor.chain().focus().setHeading({ level: 2 }).run()
    expect(blockSummary(editor)[0]).toBe('heading2:')
    expect(blockSummary(editor)[1]).toBe('paragraph:')

    editor.chain().focus().setHeading({ level: 3 }).run()
    expect(blockSummary(editor)[0]).toBe('heading3:')
    expect(blockSummary(editor)[1]).toBe('paragraph:')

    editor.chain().focus().setParagraph().run()
    expect(blockSummary(editor)).toEqual(['paragraph:', 'paragraph:'])
    editor.destroy()
  })

  it('applies inline marks only to the selected characters', () => {
    const editor = createTestEditor(sample)
    const apply = (text: string, command: 'toggleBold' | 'toggleItalic' | 'toggleUnderline' | 'toggleStrike') => {
      editor.chain().focus().setTextSelection(findTextRange(editor, text))[command]().run()
    }
    const accent = findTextRange(editor, 'accent')
    apply('American', 'toggleBold')
    editor.chain().focus().setTextSelection({ from: accent.from, to: accent.from + 1 }).toggleItalic().run()
    apply('careful', 'toggleUnderline')
    apply('practice', 'toggleStrike')
    editor.chain().focus().setTextSelection({ from: accent.from + 1, to: accent.from + 2 }).toggleUnderline().run()

    expect(markedSegments(editor, 'bold')).toEqual(['American'])
    expect(markedSegments(editor, 'italic')).toEqual(['a'])
    expect(markedSegments(editor, 'underline').sort()).toEqual(['c', 'careful'])
    expect(markedSegments(editor, 'textStrike')).toEqual(['practice'])
    expect(markedSegments(editor, 'bold').join('')).not.toContain('accent')
    expect(plainText(editor)).not.toContain('Bold:')

    editor.chain().focus().setTextSelection(findTextRange(editor, 'second')).run()
    expect(editor.isActive('bold')).toBe(false)
    expect(editor.isActive('italic')).toBe(false)
    editor.destroy()
  })

  it('keeps alignment, justify, and phonetic marks independent through export', () => {
    const editor = createTestEditor(sample)
    const accent = findTextRange(editor, 'accent')
    editor.chain().focus().setTextSelection(accent).applyAnnotation('stress').toggleItalic().run()
    editor.chain().focus().setTextSelection(findTextRange(editor, 'American')).toggleBold().applyAnnotation('error').run()
    editor.chain().focus().setTextAlign('justify').run()

    expect(blockSummary(editor)).toEqual(['paragraph:justify', 'paragraph:'])
    expect(markedSegments(editor, 'stress')).toEqual(['accent'])
    expect(markedSegments(editor, 'error')).toEqual(['American'])
    expect(markedSegments(editor, 'italic')).toEqual(['accent'])
    expect(markedSegments(editor, 'bold')).toEqual(['American'])

    editor.chain().focus().setTextAlign('left').run()
    editor.chain().focus().setTextAlign('center').run()
    editor.chain().focus().setTextAlign('right').run()
    editor.chain().focus().setTextAlign('justify').run()
    expect(markedSegments(editor, 'stress')).toEqual(['accent'])
    expect(blockSummary(editor)[1]).toBe('paragraph:')

    editor.chain().focus().setTextSelection(findTextRange(editor, 'practice')).toggleStrike().toggleAnnotation('strike').run()
    editor.chain().focus().setTextSelection(findTextRange(editor, 'practice')).toggleStrike().run()
    expect(markedSegments(editor, 'textStrike')).toEqual([])
    expect(markedSegments(editor, 'strike')).toEqual(['practice'])

    const stored = serializeDocument(editor.getJSON())
    const restored = createTestEditor(deserializeDocument(stored).content)
    expect(blockSummary(restored)[0]).toBe('paragraph:justify')
    expect(markedSegments(restored, 'stress')).toEqual(['accent'])
    expect(markedSegments(restored, 'bold')).toEqual(['American'])

    const html = renderDocumentHtml(restored.getJSON())
    expect(html).toContain('text-align: justify')
    expect(html).toContain('<strong>')
    expect(html).toContain('American')
    expect(html).toContain('data-annotation="stress"')
    expect(html).toContain('data-annotation="strike"')
    expect(html.match(/text-align: justify/g)?.length).toBe(1)

    editor.chain().focus().undo().run()
    expect(editor.isActive({ textAlign: 'justify' }) || blockSummary(editor)[0] === 'paragraph:justify').toBe(true)
    editor.destroy()
    restored.destroy()
  })

  it('clears standard formatting on the selected block and leaves phonetic marks', () => {
    const editor = createTestEditor(sample)
    editor.chain().focus().setTextSelection(findTextRange(editor, 'American')).toggleBold().applyAnnotation('error').run()
    editor.chain().focus().setHeading({ level: 1 }).setTextAlign('justify').run()
    editor.chain().focus().setTextSelection(findTextRange(editor, 'second')).toggleItalic().run()

    editor.chain().focus().setTextSelection(findTextRange(editor, 'American')).run()
    clearStandardFormatting(editor)

    expect(markedSegments(editor, 'bold')).toEqual([])
    expect(markedSegments(editor, 'error')).toEqual(['American'])
    expect(markedSegments(editor, 'italic')).toEqual(['second'])
    expect(blockSummary(editor)[0]?.startsWith('paragraph')).toBe(true)
    expect(blockSummary(editor)[0]).not.toContain('justify')
    expect(blockSummary(editor)[1]).toBe('paragraph:')
    editor.destroy()
  })
})
