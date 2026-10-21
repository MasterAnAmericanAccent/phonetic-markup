import { writeFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { pngBytes, pngSize, readEditor, replaceWith, scanPng, selectVisibleText } from './helpers'

for (const position of ['middle', 'end']) test(`U+01E3 vowel inserts at sentence ${position} and survives both exports`, async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: 'Insert ǣ, U+01E3', exact: true })
  await expect(page.getByRole('tabpanel', { name: 'Vowels' }).getByRole('button', { name: 'Insert ǣ, U+01E3', exact: true })).toHaveCount(1)
  await page.getByRole('tab', { name: 'Consonants' }).click()
  await expect(button).toHaveCount(0)
  await page.getByRole('tab', { name: 'Vowels' }).click()
  await replaceWith(page, 'Say this now.')
  const originalPng = await pngBytes(page)
  if (position === 'middle') {
    await selectVisibleText(page, 'Say')
    await page.keyboard.press('ArrowRight')
  } else {
    await page.locator('.ProseMirror').click()
    await page.keyboard.press('Control+End')
  }
  // The history plugin groups adjacent typing for 500ms; isolate fixture setup.
  await page.waitForTimeout(600)
  await button.click()
  const expected = position === 'middle' ? 'Sayǣ this now.' : 'Say this now.ǣ'
  expect((await readEditor(page)).text).toBe(expected)
  await expect(page.locator('.ProseMirror')).toBeFocused()
  const symbol = page.locator('.ProseMirror [data-ipa-offset]')
  await expect(symbol).toHaveText('ǣ')
  await expect(symbol).toHaveCSS('vertical-align', 'super')
  await expect(symbol).toHaveCSS('font-size', '30px')
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  expect((await readEditor(page)).text).toBe('Say this now.')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  expect((await readEditor(page)).text).toBe(expected)
  await page.keyboard.type('!')
  await expect(symbol).toHaveText('ǣ')
  const state = await readEditor(page)
  const bytes = await pngBytes(page)
  expect(pngSize(bytes).signature).toBe('89504e470d0a1a0a')
  expect(bytes.equals(originalPng)).toBe(false)
  expect((await scanPng(page, bytes)).ink).toBeGreaterThan((await scanPng(page, originalPng)).ink)
  await writeFile(test.info().outputPath('ipa-ae.png'), bytes)
  // Separate the replacement action from the prior subsequent-typing action.
  await page.waitForTimeout(600)
  await selectVisibleText(page, 'ǣ')
  expect((await readEditor(page)).selectionText).toBe('ǣ')
  await page.keyboard.type('x')
  expect((await readEditor(page)).text).not.toContain('ǣ')
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  expect((await readEditor(page)).text).toBe(state.text)
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export HTML' }).click()])
  const chunks: Buffer[] = []
  const stream = await download.createReadStream()
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk))
  const html = Buffer.concat(chunks).toString('utf8')
  await page.setContent(html)
  await expect(page.locator('article')).toHaveText(state.text)
  await expect(page.locator('[data-ipa-offset]')).toHaveText('ǣ')
  await expect(page.locator('[data-ipa-offset]')).toHaveCSS('vertical-align', 'super')
  await expect(page.locator('[data-ipa-offset]')).toHaveCSS('font-size', '30px')
})
