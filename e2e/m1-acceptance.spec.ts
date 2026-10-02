import { expect, test, type Page } from '@playwright/test'
import {
  applyMark,
  markText,
  pngBytes,
  pngSize,
  readEditor,
  replaceWith,
  scanPng,
  selectVisibleText,
  textRect,
  writeClipboard,
} from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.ProseMirror')).toBeVisible()
})

test.describe('requirement 1 — editable text', () => {
  test('types, deletes, selects, copies, cuts, pastes, and undoes without an edit mode', async ({ page }) => {
    await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable', 'true')
    await expect(page.getByRole('button', { name: /edit mode/i })).toHaveCount(0)

    await replaceWith(page, 'alpha beta gamma')
    expect((await readEditor(page)).text).toBe('alpha beta gamma')
    await page.waitForTimeout(600)
    await page.keyboard.press('Backspace')
    expect((await readEditor(page)).text).toBe('alpha beta gamm')
    await page.getByRole('button', { name: 'Undo' }).click()
    expect((await readEditor(page)).text).toBe('alpha beta gamma')
    await page.getByRole('button', { name: 'Redo' }).click()
    expect((await readEditor(page)).text).toBe('alpha beta gamm')
    await page.getByRole('button', { name: 'Undo' }).click()

    await page.waitForTimeout(600)
    await page.keyboard.press('Backspace')
    expect((await readEditor(page)).text).toBe('alpha beta gamm')
    await page.keyboard.press('Control+z')
    expect((await readEditor(page)).text).toBe('alpha beta gamma')
    await page.keyboard.press('Control+y')
    expect((await readEditor(page)).text).toBe('alpha beta gamm')
    await page.keyboard.press('Control+z')

    const beta = await textRect(page, 'beta')
    const betaY = beta.y + beta.height / 2
    await page.mouse.move(beta.x + 2, betaY)
    await page.mouse.down()
    await page.mouse.move(beta.x + beta.width - 2, betaY, { steps: 6 })
    await page.mouse.up()
    expect((await readEditor(page)).selectionText).toBe('beta')

    await selectVisibleText(page, 'beta')
    expect((await readEditor(page)).selectionText).toBe('beta')
    await selectVisibleText(page, 'alp')
    expect((await readEditor(page)).selectionText).toBe('alp')
    await selectVisibleText(page, 'alpha beta')
    expect((await readEditor(page)).selectionText).toBe('alpha beta')

    await selectVisibleText(page, 'beta')
    await page.keyboard.press('Control+c')
    await page.keyboard.press('Control+End')
    await page.keyboard.type(' ')
    await page.keyboard.press('Control+v')
    expect((await readEditor(page)).text).toContain('beta')
    expect((await readEditor(page)).text.endsWith('beta')).toBe(true)

    const beforeCut = (await readEditor(page)).text
    await selectVisibleText(page, 'gamma')
    await page.keyboard.press('Control+x')
    const afterCut = await readEditor(page)
    expect(afterCut.text).not.toContain('gamma')
    expect(afterCut.text.length).toBeLessThan(beforeCut.length)

    await selectVisibleText(page, 'alpha')
    await applyMark(page, 'Error')
    await page.keyboard.press('End')
    await page.keyboard.type('!')
    const marked = await readEditor(page)
    expect(markText(marked, 'error')).toBe('alpha')
    expect(marked.text.endsWith('!')).toBe(true)
  })
})

test.describe('requirement 2 — paste external text', () => {
  test('pastes plain text and a rich HTML clipboard into the cursor', async ({ page }) => {
    await page.getByRole('button', { name: 'Clear passage' }).click()
    expect((await readEditor(page)).text).toBe('')

    await writeClipboard(page, { 'text/plain': 'naïve ə a\u0301' })
    await page.locator('.ProseMirror').click()
    await page.keyboard.press('Control+v')
    let state = await readEditor(page)
    expect(state.text).toContain('naïve')
    expect(state.text).toContain('ə')
    expect(state.text).toContain('a\u0301')

    await page.keyboard.type('X')
    expect((await readEditor(page)).text.endsWith('X')).toBe(true)

    await replaceWith(page, 'Start')
    await writeClipboard(page, {
      'text/plain': 'plain fallback',
      'text/html': '<p style="color:red"><b>Styled</b> ə</p>',
    })
    await page.keyboard.press('Control+v')
    state = await readEditor(page)
    expect(state.text).toContain('Styled')
    expect(state.text).toContain('ə')
    expect(state.json).not.toContain('"bold"')
    expect(state.json).not.toContain('color:red')
    await page.keyboard.type('Z')
    expect((await readEditor(page)).text.endsWith('Z')).toBe(true)
  })
})

test.describe('requirement 3 and 6 — edits around markup', () => {
  test('inserts before, inside, and after a mark, and deletes part or all of it', async ({ page }) => {
    await replaceWith(page, 'Keep cat here. Other line stays.')
    await selectVisibleText(page, 'cat')
    await applyMark(page, 'Error')
    await selectVisibleText(page, 'here')
    await applyMark(page, 'Nasal')

    const cat = await textRect(page, 'cat')
    await page.mouse.click(cat.x + 1, cat.y + cat.height / 2)
    await page.keyboard.type('Q')
    let state = await readEditor(page)
    expect(state.text).toContain('Qcat')
    expect(markText(state, 'error')).toBe('cat')
    expect(markText(state, 'nasal')).toBe('here')

    await page.keyboard.press('Backspace')
    const inside = await textRect(page, 'cat')
    await page.mouse.click(inside.x + inside.width / 2, inside.y + inside.height / 2)
    await page.keyboard.type('Z')
    state = await readEditor(page)
    expect(state.text).toContain('cZat')
    expect(markText(state, 'error')).toContain('Z')
    expect(markText(state, 'nasal')).toBe('here')

    await page.keyboard.press('Control+z')
    await page.keyboard.press('End')
    await page.keyboard.type('!')
    state = await readEditor(page)
    expect(markText(state, 'error')).toBe('cat')
    expect(state.text.endsWith('!')).toBe(true)

    await selectVisibleText(page, 'ca')
    await page.keyboard.press('Backspace')
    state = await readEditor(page)
    expect(markText(state, 'error')).toBe('t')
    expect(markText(state, 'nasal')).toBe('here')

    await selectVisibleText(page, 't')
    await page.keyboard.press('Backspace')
    state = await readEditor(page)
    expect(markText(state, 'error')).toBe('')
    expect(markText(state, 'nasal')).toBe('here')
    expect(state.json).not.toContain('"error"')
  })
})

test.describe('requirement 4 — paragraphs and line breaks', () => {
  test('pastes a Discord-like payload with breaks and one that has already lost them', async ({ page }) => {
    await page.getByRole('button', { name: 'Clear passage' }).click()
    await writeClipboard(page, {
      'text/plain': 'Paragraph 1\n\nParagraph 2\nHard-break continuation',
    })
    await page.locator('.ProseMirror').click()
    await page.keyboard.press('Control+v')
    let state = await readEditor(page)
    expect(state.paragraphs).toBe(2)
    expect(state.hardBreaks).toBe(1)
    expect(state.text).toContain('Paragraph 1')
    expect(state.text).toContain('Hard-break continuation')

    await page.getByRole('button', { name: 'Clear passage' }).click()
    await writeClipboard(page, {
      'text/plain': 'Paragraph 1 Paragraph 2 Hard-break continuation',
    })
    await page.locator('.ProseMirror').click()
    await page.keyboard.press('Control+v')
    state = await readEditor(page)
    expect(state.paragraphs).toBe(1)
    expect(state.hardBreaks).toBe(0)
    expect(state.text).toBe('Paragraph 1 Paragraph 2 Hard-break continuation')
  })
})

test.describe('requirement 5 and 7 — layout does not detach markup', () => {
  test('keeps the annotation on the same text after resize, scroll, zoom, and font size', async ({ page }) => {
    await replaceWith(page, 'The word cat stays marked while the window changes around it.')
    await selectVisibleText(page, 'cat')
    await applyMark(page, 'Error')

    const attached = async () => {
      const state = await readEditor(page)
      expect(markText(state, 'error')).toBe('cat')
      const box = await page.evaluate(() => {
        const mark = document.querySelector('[data-annotation="error"]')
        const editor = document.querySelector('.ProseMirror')
        if (!mark || !editor) return null
        const style = getComputedStyle(mark)
        return {
          text: mark.textContent,
          contains: editor.contains(mark),
          position: style.position,
        }
      })
      expect(box).toEqual({ text: 'cat', contains: true, position: 'static' })
    }

    await attached()
    await page.setViewportSize({ width: 1920, height: 1080 })
    await attached()
    await page.setViewportSize({ width: 900, height: 700 })
    await attached()
    await page.evaluate(() => window.scrollTo(0, 40))
    await attached()
    await page.evaluate(() => {
      document.body.style.zoom = '1.5'
    })
    await attached()
    await page.evaluate(() => {
      document.body.style.zoom = '1'
      const editor = document.querySelector('.ProseMirror')
      if (editor instanceof HTMLElement) editor.style.fontSize = '32px'
    })
    await attached()
    await page.evaluate(() => {
      const editor = document.querySelector('.ProseMirror')
      if (editor instanceof HTMLElement) editor.style.fontSize = '14px'
    })
    await attached()
  })
})

test.describe('requirements 8, 9, 11, 12, 13, and 14 — annotation actions', () => {
  test('overlaps marks, removes one, and keeps distinct visuals', async ({ page }) => {
    await replaceWith(page, 'mark this word')
    await selectVisibleText(page, 'word')
    await applyMark(page, 'Error')
    await selectVisibleText(page, 'word')
    await applyMark(page, 'Voicing')
    let state = await readEditor(page)
    expect(markText(state, 'error')).toBe('word')
    expect(markText(state, 'voicing')).toBe('word')

    const visuals = await page.evaluate(() => {
      const read = (key: string) => {
        const el = document.querySelector(`[data-annotation="${key}"]`)
        if (!el) return null
        const style = getComputedStyle(el)
        return {
          color: style.color,
          background: style.backgroundColor,
          decoration: style.textDecorationLine,
        }
      }
      return { error: read('error'), voicing: read('voicing') }
    })
    const signature = (style: { color: string; background: string; decoration: string } | null) =>
      style ? `${style.color}|${style.background}|${style.decoration}` : ''
    expect(signature(visuals.error)).not.toBe(signature(visuals.voicing))
    expect(visuals.error?.background).not.toBe(visuals.voicing?.background)
    expect(visuals.voicing?.decoration).toContain('underline')

    await selectVisibleText(page, 'word')
    await page.getByRole('button', { name: 'Remove Error', exact: true }).first().click()
    state = await readEditor(page)
    expect(markText(state, 'error')).toBe('')
    expect(markText(state, 'voicing')).toBe('word')
    expect(state.text).toBe('mark this word')

    await page.keyboard.press('Control+z')
    state = await readEditor(page)
    expect(markText(state, 'error')).toBe('word')
    expect(markText(state, 'voicing')).toBe('word')
    await page.keyboard.press('Control+y')
    state = await readEditor(page)
    expect(markText(state, 'error')).toBe('')
    expect(markText(state, 'voicing')).toBe('word')

    await replaceWith(page, 'nasal and choice')
    await selectVisibleText(page, 'nasal')
    await applyMark(page, 'Nasal')
    await selectVisibleText(page, 'nasal')
    await applyMark(page, 'Error')
    await selectVisibleText(page, 'choice')
    await applyMark(page, 'Alternative')
    await expect(page.getByRole('button', { name: 'Apply Alternate', exact: true })).toHaveCount(0)
    const styles = await page.evaluate(() => {
      const read = (key: string) => {
        const el = document.querySelector(`[data-annotation="${key}"]`)
        if (!el) return null
        const style = getComputedStyle(el)
        return { color: style.color, background: style.backgroundColor, decoration: style.textDecorationLine }
      }
      return { nasal: read('nasal'), alternate: read('alternate'), error: read('error') }
    })
    expect(styles.nasal?.decoration).toContain('overline')
    const alternateBorder = await page.locator('[data-annotation="alternate"]').evaluate((element) => {
      const style = getComputedStyle(element)
      return { style: style.borderBottomStyle, color: style.borderBottomColor }
    })
    expect(alternateBorder.style).toBe('dotted')
    const blue = alternateBorder.color.match(/\d+/g)?.map(Number) ?? []
    expect(blue[2] ?? 0).toBeGreaterThan(blue[0] ?? 0)
    expect(blue[2] ?? 0).toBeGreaterThan(blue[1] ?? 0)
    expect(blue[2] ?? 0).toBeGreaterThan(150)
    expect(alternateBorder.color).not.toBe(styles.error?.color)
    state = await readEditor(page)
    expect(markText(state, 'nasal')).toBe('nasal')
    expect(markText(state, 'error')).toBe('nasal')
    expect(markText(state, 'alternate')).toBe('choice')
    await selectVisibleText(page, 'choice')
    await page.getByRole('button', { name: 'Remove Alternative', exact: true }).first().click()
    state = await readEditor(page)
    expect(markText(state, 'alternate')).toBe('')
    expect(markText(state, 'error')).toBe('nasal')
    expect(state.text).toBe('nasal and choice')
    await selectVisibleText(page, 'nasal')
    await page.getByRole('button', { name: 'Remove Nasal', exact: true }).first().click()
    state = await readEditor(page)
    expect(markText(state, 'nasal')).toBe('')
    expect(markText(state, 'error')).toBe('nasal')
  })
})

test.describe('requirement 10 — retained parity tools', () => {
  test('applies and removes each retained coaching mark', async ({ page }) => {
    const tools = ['Connect', 'Glide', 'Link', 'Blend', 'Stretch', 'Reduce', 'Stress', 'Strike Out', 'Error']
    await replaceWith(page, 'target word')
    for (const name of tools) {
      const key = name === 'Strike Out' ? 'strike' : name.toLowerCase()
      await selectVisibleText(page, 'target')
      await applyMark(page, name)
      let state = await readEditor(page)
      expect(markText(state, key)).toBe('target')
      expect(state.text).toBe('target word')
      const positioned = await page.evaluate((annotation) => {
        const el = document.querySelector(`[data-annotation="${annotation}"]`)
        if (!el) return 'missing'
        return getComputedStyle(el).position
      }, key)
      expect(positioned).toBe('static')
      await selectVisibleText(page, 'target')
      await page.getByRole('button', { name: `Remove ${name}`, exact: true }).first().click()
      state = await readEditor(page)
      expect(markText(state, key)).toBe('')
      expect(state.text).toBe('target word')
    }
  })
})

test.describe('requirements 16 and 17 — IPA palette', () => {
  test('shows the groups and inserts a symbol at the cursor', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Vowels' })).toBeVisible()
    await page.getByRole('tab', { name: 'Consonants' }).click()
    await expect(page.getByRole('button', { name: /Insert ð/ })).toBeVisible()
    await page.getByRole('tab', { name: 'Intonation' }).click()
    await expect(page.getByRole('button', { name: 'Insert up arrow, U+21D1' })).toBeVisible()
    await page.getByRole('tab', { name: 'Vowels' }).click()

    const palette = await page.locator('.ipa-palette').boundingBox()
    const editor = await page.locator('.ProseMirror').boundingBox()
    expect(palette).not.toBeNull()
    expect(editor).not.toBeNull()
    if (palette && editor) expect(palette.x + palette.width).toBeLessThanOrEqual(editor.x + 1)

    await replaceWith(page, 'popular')
    const rect = await textRect(page, 'popular')
    await page.mouse.click(rect.x + rect.width * 0.42, rect.y + rect.height / 2)
    await page.getByRole('button', { name: 'Insert ʊ, U+028A' }).click()
    const state = await readEditor(page)
    expect(state.text).toBe('popʊular')
    await expect(page.locator('.ProseMirror')).toBeFocused()
    await page.keyboard.press('Control+z')
    expect((await readEditor(page)).text).toBe('popular')
    await page.keyboard.press('Control+y')
    expect((await readEditor(page)).text).toBe('popʊular')
  })
})

test.describe('requirement 18 — Unicode in the running editor', () => {
  test('renders IPA inside words and keeps combining marks', async ({ page }) => {
    const state = await readEditor(page)
    expect(state.text).toContain('Pop\u028Alar')
    expect(state.text).toContain('v\u028Culnerable')
    expect(state.text).toContain('qu\u026Ate')
    expect(state.text).toContain('anoth\u0259r')
    expect(state.text).toContain('a\u0301')
    const schwa = await textRect(page, 'ə')
    expect(schwa.width).toBeGreaterThan(2)
  })
})

test.describe('requirements 19 and 20 — selection menu and coaching speed', () => {
  test('shows contextual actions without a dialog and keeps the selection', async ({ page }) => {
    await replaceWith(page, 'coach this word now')
    await selectVisibleText(page, 'word')
    const menu = page.getByRole('toolbar', { name: 'Markup for the selection' })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Apply Error' })).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Apply Voicing' })).toBeVisible()
    await expect(menu.getByRole('button', { name: 'Apply Alternative' })).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)

    await page.keyboard.press('Escape')
    expect((await readEditor(page)).selectionText).toBe('word')
    await expect(menu).toBeVisible()
    await page.keyboard.press('End')
    await expect(menu).toBeHidden()
    expect((await readEditor(page)).selectionEmpty).toBe(true)

    await selectVisibleText(page, 'word')
    await expect(menu).toBeVisible()
    await menu.getByRole('button', { name: 'Apply Error' }).click()
    expect(markText(await readEditor(page), 'error')).toBe('word')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    const editorBox = await page.locator('.ProseMirror').boundingBox()
    const viewport = page.viewportSize()
    expect(editorBox && viewport && editorBox.width > viewport.width * 0.45).toBe(true)
  })
})

test.describe('requirements 21 and 22 — search', () => {
  test('counts, navigates, and clears ordinary and IPA matches', async ({ page }) => {
    await replaceWith(page, 'cat cat cat ʊ ʊ')
    await page.locator('#passage-search').fill('cat')
    await expect(page.locator('.search-count')).toHaveText('1 / 3')
    const highlighted = await page.locator('.search-match, .search-match-active').count()
    expect(highlighted).toBe(3)
    const active = await page.locator('.search-match-active').count()
    expect(active).toBe(1)
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.locator('.search-count')).toHaveText('2 / 3')
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.locator('.search-count')).toHaveText('1 / 3')
    await page.getByRole('button', { name: 'Previous' }).click()
    await expect(page.locator('.search-count')).toHaveText('3 / 3')

    await selectVisibleText(page, 'cat')
    await applyMark(page, 'Error')
    await page.locator('#passage-search').fill('ʊ')
    await expect(page.locator('.search-count')).toHaveText('1 / 2')
    expect(markText(await readEditor(page), 'error')).toContain('cat')

    const htmlText = await htmlDownload(page)
    expect(htmlText).not.toContain('search-match')
    expect(htmlText).toContain('annotation-error')

    await page.locator('button.search-step', { hasText: 'Clear' }).click()
    await expect(page.locator('.search-match, .search-match-active')).toHaveCount(0)
    expect(markText(await readEditor(page), 'error')).toContain('cat')
  })
})

async function htmlDownload(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export HTML' }).click(),
  ])
  const chunks: Buffer[] = []
  const stream = await download.createReadStream()
  if (!stream) throw new Error('HTML download has no stream')
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

test.describe('requirements 23, 24, and 25 — exports and plain text', () => {
  test('writes a PNG and a self-contained HTML file from the annotated document', async ({ page }) => {
    await replaceWith(page, 'Say cat and ə now.')
    await selectVisibleText(page, 'cat')
    await applyMark(page, 'Error')
    await selectVisibleText(page, 'now')
    await applyMark(page, 'Nasal')
    await selectVisibleText(page, 'Say')
    await applyMark(page, 'Alternative')

    const png = await pngBytes(page)
    const size = pngSize(png)
    expect(size.signature).toBe('89504e470d0a1a0a')
    expect(size.width).toBeGreaterThan(0)
    expect(size.height).toBeGreaterThan(0)
    expect([760, 1520]).toContain(size.width)
    const pixels = await scanPng(page, png)
    expect(pixels.ink).toBeGreaterThan(100)
    expect(pixels.errorRed).toBeGreaterThan(0)
    expect(pixels.nasalPurple).toBeGreaterThan(0)
    expect(pixels.alternateBlue).toBeGreaterThan(0)
    expect(pixels.searchBlue).toBe(0)

    const html = await htmlDownload(page)
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<style>')
    expect(html).toContain('annotation-error')
    expect(html).toContain('annotation-nasal')
    expect(html).toContain('annotation-alternate')
    expect(html).toContain('#1d4ed8')
    expect(html).toContain('ə')
    expect(html).not.toContain('localhost')
    expect(html).not.toContain('<link')
    expect(html).not.toContain('Export PNG')
    expect(html).not.toContain('PHONETIC MARKUP')
    expect(html).not.toContain('search-match')

    await page.setContent(html)
    await expect(page.locator('[data-annotation="error"]')).toHaveText('cat')
    await expect(page.locator('article')).toContainText('ə')
    await expect(page.locator('.workspace-bar')).toHaveCount(0)

    await page.goto('/')
    await replaceWith(page, 'Say cat and ə now.')
    await selectVisibleText(page, 'cat')
    await applyMark(page, 'Error')
    const plain = await page.evaluate(() => document.querySelector('.ProseMirror')?.textContent ?? '')
    expect(plain).toContain('Say cat and ə now.')
    expect(plain).not.toContain('annotation-error')
    expect(plain).not.toContain('data-annotation')
  })
})

test.describe('requirements 26 and 27 — structured state', () => {
  test('keeps marks, comments, and research markers in the live schema and out of search state', async ({ page }) => {
    const state = await readEditor(page)
    expect(state.markNames).toEqual(
      expect.arrayContaining(['error', 'voicing', 'nasal', 'alternate', 'comment', 'researchMarker']),
    )
    expect(state.json).not.toContain('passage-search')
    await page.locator('#passage-search').fill('accent')
    const searching = await readEditor(page)
    expect(searching.json).not.toContain('accent-search')
    expect(searching.json).not.toContain('"query"')
    await page.locator('#passage-search').fill('')
  })
})

test.describe('requirements 28, 29, and 30 — branding and desktop layout', () => {
  for (const size of [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1366, height: 768 },
  ]) {
    test(`keeps tools beside the document at ${size.width}x${size.height}`, async ({ page }) => {
      await page.setViewportSize(size)
      await expect(page).toHaveTitle('ACB Phonetic Markup')
      await expect(page.getByRole('heading', { name: 'PHONETIC MARKUP' })).toBeVisible()
      await expect(page.getByRole('img', { name: 'Accent Coach Bianca' })).toBeVisible()
      await expect(page.getByRole('button', { name: /menu/i })).toHaveCount(0)
      const bodyText = await page.locator('body').innerText()
      expect(bodyText.toLowerCase()).not.toContain('ualberta')

      const favicon = await page.evaluate(async () => {
        const link = document.querySelector('link[rel="icon"]')
        if (!(link instanceof HTMLLinkElement)) return null
        const response = await fetch(link.href)
        const text = await response.text()
        return { href: link.href, bytes: text.length, yellow: text.includes('#ffe180'), whiteFill: text.includes('fill="#ffffff"') }
      })
      expect(favicon?.href).toContain('acb-logo')
      expect(favicon?.yellow).toBe(true)
      expect(favicon?.whiteFill).toBe(false)
      const headerSrc = await page.locator('.brand-logo').getAttribute('src')
      expect(headerSrc).toContain('brand-logo')

      const strike = page.getByRole('button', { name: 'Apply Strike Out' }).locator('.mark-label')
      const lines = await strike.evaluate((element) => element.getClientRects().length)
      expect(lines).toBe(1)

      const boxes = await page.evaluate(() => {
        const rect = (selector: string) => {
          const el = document.querySelector(selector)
          if (!el) return null
          const box = el.getBoundingClientRect()
          return { x: box.x, y: box.y, right: box.right, bottom: box.bottom, width: box.width, height: box.height }
        }
        return {
          header: rect('.workspace-bar'),
          sidebar: rect('.markup-panel'),
          editor: rect('.ProseMirror'),
          toolbar: rect('.format-toolbar'),
        }
      })
      expect(boxes.header && boxes.editor && boxes.header.bottom).toBeLessThanOrEqual(boxes.editor?.y ?? 0)
      expect(boxes.sidebar && boxes.editor && boxes.sidebar.right).toBeLessThanOrEqual((boxes.editor?.x ?? 0) + 1)
      expect(boxes.toolbar && boxes.editor && boxes.toolbar.bottom).toBeLessThanOrEqual(boxes.editor?.y ?? 0)
      expect((boxes.editor?.width ?? 0) > size.width * 0.45).toBe(true)

      const error = page.locator('[data-annotation="error"]').first()
      if (await error.count()) {
        const color = await error.evaluate((element) => getComputedStyle(element).color)
        expect(color).not.toBe('rgb(255, 255, 255)')
      }
    })
  }
})

test.describe('cross-requirement workflow', () => {
  test('pastes, marks, edits, searches, exports, and round-trips one document', async ({ page }) => {
    test.setTimeout(120_000)
    await page.getByRole('button', { name: 'Clear passage' }).click()
    await writeClipboard(page, {
      'text/plain': 'First accent line ə.\n\nSecond line\nstays broken.',
    })
    await page.locator('.ProseMirror').click()
    await page.keyboard.press('Control+v')
    let state = await readEditor(page)
    expect(state.paragraphs).toBe(2)
    expect(state.hardBreaks).toBe(1)
    expect(state.text).toContain('ə')

    const popular = await textRect(page, 'accent')
    await page.mouse.click(popular.x + popular.width / 2, popular.y + popular.height / 2)
    await page.getByRole('button', { name: 'Insert ʊ, U+028A' }).click()
    expect((await readEditor(page)).text).toContain('ʊ')

    const tools = [
      ['Error', 'error'],
      ['Voicing', 'voicing'],
      ['Nasal', 'nasal'],
      ['Alternative', 'alternate'],
      ['Connect', 'connect'],
      ['Glide', 'glide'],
      ['Link', 'link'],
      ['Blend', 'blend'],
      ['Stretch', 'stretch'],
      ['Reduce', 'reduce'],
      ['Stress', 'stress'],
      ['Strike Out', 'strike'],
    ] as const
    for (const [label, key] of tools) {
      await selectVisibleText(page, 'line')
      await applyMark(page, label)
      expect(markText(await readEditor(page), key)).toContain('line')
    }
    state = await readEditor(page)
    expect(markText(state, 'error')).toContain('line')
    expect(markText(state, 'voicing')).toContain('line')

    await page.keyboard.press('Home')
    await page.keyboard.type('BEFORE ')
    expect((await readEditor(page)).text.startsWith('BEFORE ')).toBe(true)
    await page.keyboard.press('Control+z')
    await selectVisibleText(page, 'li')
    await page.keyboard.press('Backspace')
    expect(markText(await readEditor(page), 'error')).toBe('ne')
    await page.keyboard.press('Control+z')
    expect(markText(await readEditor(page), 'error')).toContain('line')
    await page.keyboard.press('Control+y')
    expect(markText(await readEditor(page), 'error')).toBe('ne')
    await page.keyboard.press('Control+z')

    await page.setViewportSize({ width: 1366, height: 768 })
    expect(markText(await readEditor(page), 'nasal')).toContain('line')

    await page.locator('#passage-search').fill('line')
    await expect(page.locator('.search-count')).toContainText('/')
    await page.locator('#passage-search').fill('ʊ')
    await expect(page.locator('.search-count')).toHaveText('1 / 1')
    await page.locator('#passage-search').fill('')
    await expect(page.locator('.search-match')).toHaveCount(0)

    const before = await readEditor(page)
    const html = await htmlDownload(page)
    expect(html).toContain('ʊ')
    expect(html).toContain('annotation-error')
    expect(html).toContain('<br>')
    expect(html).not.toContain('search-match')
    const png = pngSize(await pngBytes(page))
    expect(png.signature).toBe('89504e470d0a1a0a')
    expect(png.width).toBeGreaterThan(0)

    const after = await readEditor(page)
    expect(after.text).toBe(before.text)
    expect(after.json).toBe(before.json)
  })
})
