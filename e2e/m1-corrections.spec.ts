import { writeFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { applyMark, markText, pngBytes, pngSize, readEditor, replaceWith, scanPng, selectVisibleText } from './helpers'

test.beforeEach(async ({ page }) => { await page.goto('/') })

for (const width of [700, 1440, 1920]) test(`exports current wrapping and full height at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 })
  await replaceWith(page, ('A long passage with spaces and editable Unicode ə. ').repeat(35) + '\nSecond paragraph.\nLast paragraph.')
  await selectVisibleText(page, 'long passage')
  for (const mark of ['Connect', 'Alternative', 'Voicing']) await applyMark(page, mark)
  const layout = await page.locator('.ProseMirror').evaluate(el => {
    const range = document.createRange(); range.selectNodeContents(el)
    return { width: el.getBoundingClientRect().width, contentHeight: range.getBoundingClientRect().height, text: el.textContent }
  })
  const bytes = await pngBytes(page)
  const size = pngSize(bytes)
  expect(Math.abs(size.width - Math.ceil(layout.width) * 2)).toBeLessThanOrEqual(2)
  expect(size.height).toBeGreaterThan(layout.contentHeight * 2)
  const pixels = await scanPng(page, bytes)
  expect(pixels.ink).toBeGreaterThan(100)
  expect(pixels.alternateBlue).toBeGreaterThan(0)
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export HTML' }).click()])
  expect(download.suggestedFilename()).toMatch(/^ACB-Phonetic-Markup-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.html$/)
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk))
  const html = Buffer.concat(chunks).toString('utf8')
  expect(html).not.toMatch(/<script|<link|search-match/)
  await page.setContent(html)
  const exported = await page.locator('article').evaluate(el => {
    const range = document.createRange(); range.selectNodeContents(el)
    return { width: el.getBoundingClientRect().width, contentHeight: range.getBoundingClientRect().height, text: el.textContent }
  })
  expect(exported.text).toBe(layout.text)
  expect(exported.width).toBeCloseTo(layout.width, 1)
  expect(exported.contentHeight).toBeCloseTo(layout.contentHeight, 1)
})

test('retains both annotation lanes and IPA offset in PNG and HTML', async ({ page }) => {
  await replaceWith(page, 'word')
  await selectVisibleText(page, 'word')
  for (const mark of ['Connect', 'Alternative', 'Voicing']) await applyMark(page, mark)
  const css = await page.locator('.ProseMirror').evaluate(el => {
    const voicing = getComputedStyle(el.querySelector('[data-annotation=voicing]')!)
    const alternative = getComputedStyle(el.querySelector('[data-annotation=alternate]')!)
    return { voicing: voicing.textUnderlineOffset, alternate: alternative.paddingBottom }
  })
  expect(parseFloat(css.alternate)).toBeGreaterThan(parseFloat(css.voicing))
  await page.keyboard.press('End')
  await page.getByRole('button', { name: 'Insert ə, U+0259', exact: true }).click()
  const ipa = page.locator('.ProseMirror [data-ipa-offset]')
  await expect(ipa).toHaveText('ə')
  await expect(ipa).toHaveCSS('vertical-align', 'super')
  await expect(ipa).toHaveCSS('font-size', '30px')
  await page.keyboard.type('!')
  await expect(ipa).toHaveText('ə')
  await expect(page.locator('.ProseMirror')).toBeFocused()
  const bytes = await pngBytes(page)
  await writeFile(test.info().outputPath('export.png'), bytes)
  await page.locator('.ProseMirror').screenshot({ path: test.info().outputPath('editor.png') })
  const rows = await page.evaluate(async encoded => {
    const image = new Image(); image.src = 'data:image/png;base64,' + encoded; await image.decode()
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
    const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    const brown: number[] = [], blue: number[] = []
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4
      if (Math.abs(pixels[i]! - 180) < 15 && Math.abs(pixels[i+1]! - 83) < 15 && pixels[i+2]! < 30) brown.push(y)
      if (Math.abs(pixels[i]! - 29) < 15 && Math.abs(pixels[i+1]! - 78) < 15 && Math.abs(pixels[i+2]! - 216) < 15) blue.push(y)
    }
    return { brown, blue }
  }, bytes.toString('base64'))
  expect(rows.brown.length).toBeGreaterThan(0)
  expect(rows.blue.length).toBeGreaterThan(0)
  expect(Math.min(...rows.blue)).toBeGreaterThan(Math.max(...rows.brown))
  await selectVisibleText(page, 'word')
  await page.getByRole('button', { name: 'Remove Alternative', exact: true }).first().click()
  expect(markText(await readEditor(page), 'voicing')).toBe('word')
})

for (const offset of [0, 250, 500]) test(`keeps tooltip within viewport above selection when possible at ${offset}`, async ({ page }) => {
  await replaceWith(page, 'left middle right')
  await page.locator('.ProseMirror').evaluate((el, top) => { (el as HTMLElement).style.paddingTop = `${top}px` }, offset)
  await selectVisibleText(page, offset === 0 ? 'left' : offset === 250 ? 'middle' : 'right')
  const menu = page.locator('.selection-menu')
  await expect(menu).toBeVisible()
  await expect.poll(async () => {
    const box = await menu.boundingBox()
    return !!box && box.x >= 7 && box.y >= 7 && box.x + box.width <= 1440 - 7 && box.y + box.height <= 900 - 7
  }).toBe(true)
  const selection = await page.evaluate(() => window.getSelection()!.getRangeAt(0).getBoundingClientRect().toJSON())
  const box = (await menu.boundingBox())!
  if (selection.y > box.height + 18) expect(box.y + box.height).toBeLessThanOrEqual(selection.y - 8)
  await page.keyboard.press('End')
  await expect(menu).toBeHidden()
})

test('clear formatting resets the entire document and undo restores it', async ({ page }) => {
  await replaceWith(page, 'first line\nsecond line')
  await selectVisibleText(page, 'first')
  for (const mark of ['Error', 'Alternative', 'Voicing', 'Nasal']) await applyMark(page, mark)
  await page.getByRole('button', { name: 'Bold', exact: true }).click()
  await page.getByRole('button', { name: 'Align right', exact: true }).click()
  await page.keyboard.press('End')
  await page.getByRole('button', { name: 'Insert ə, U+0259', exact: true }).click()
  const before = await readEditor(page)
  await selectVisibleText(page, 'second')
  await page.getByRole('button', { name: 'Italic', exact: true }).click()
  const formatted = await readEditor(page)
  await page.getByRole('button', { name: 'Clear formatting', exact: true }).click()
  const after = await readEditor(page)
  expect(after.text).toBe(before.text)
  expect(after.marks).toEqual([])
  expect(after.json).not.toMatch(/textAlign":"|ipaOffset|heading|bulletList|blockquote/)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  expect((await readEditor(page)).json).toBe(formatted.json)
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  expect((await readEditor(page)).marks).toEqual([])
})

test('scales PNG for high DPI without changing wrapping', async ({ browser }) => {
  const context = await browser.newContext({ deviceScaleFactor: 3, viewport: { width: 1000, height: 800 } })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:5175/')
  await replaceWith(page, 'Short Unicode ə text')
  const width = await page.locator('.ProseMirror').evaluate(el => el.getBoundingClientRect().width)
  expect(pngSize(await pngBytes(page)).width).toBe(Math.ceil(width) * 3)
  await context.close()
})

test('flips tooltip below a selection at the viewport top and hides it offscreen', async ({ page }) => {
  await replaceWith(page, 'edge word')
  await page.locator('.ProseMirror').evaluate(el => { (el as HTMLElement).style.minHeight = '2500px' })
  await selectVisibleText(page, 'edge')
  await page.evaluate(() => {
    const range = window.getSelection()!.getRangeAt(0)
    window.scrollBy(0, range.getBoundingClientRect().top - 20)
  })
  const menu = page.locator('.selection-menu')
  await expect(menu).toBeVisible()
  await expect.poll(async () => {
    const box = await menu.boundingBox()
    const selection = await page.evaluate(() => window.getSelection()!.getRangeAt(0).getBoundingClientRect().bottom)
    return !!box && box.y >= selection + 8
  }).toBe(true)
  await page.evaluate(() => window.scrollBy(0, 300))
  await expect(menu).toBeHidden()
})

test('exports every requested overlapping combination in both application orders', async ({ page }) => {
  const combinations = [
    ['Voicing', 'Nasal'], ['Error', 'Voicing', 'Nasal'], ['Voicing', 'Alternative'],
    ['Connect', 'Alternative', 'Voicing'], ['Alternative', 'Nasal'], ['Error', 'Alternative'],
  ]
  const words = Array.from({ length: 12 }, (_, index) => `sample${String.fromCharCode(65 + index)}`)
  await replaceWith(page, words.join(' '))
  for (let index = 0; index < words.length; index++) {
    await selectVisibleText(page, words[index]!)
    const marks = combinations[Math.floor(index / 2)]!
    for (const mark of index % 2 ? [...marks].reverse() : marks) await applyMark(page, mark)
  }
  await page.keyboard.press('End')
  const bytes = await pngBytes(page)
  const pixels = await scanPng(page, bytes)
  expect(pixels.errorRed).toBeGreaterThan(0)
  expect(pixels.nasalPurple).toBeGreaterThan(0)
  expect(pixels.alternateBlue).toBeGreaterThan(0)
  await writeFile(test.info().outputPath('combinations.png'), bytes)
})
