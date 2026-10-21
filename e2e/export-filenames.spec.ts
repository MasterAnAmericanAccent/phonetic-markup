import { expect, test } from '@playwright/test'
import { pngSize, replaceWith } from './helpers'

test.use({ timezoneId: 'Asia/Singapore' })

test('PNG and HTML downloads use matching local timestamps and remain valid', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-01-02T19:04:05Z'))
  await page.goto('/')
  await replaceWith(page, 'Say ǣ now.')
  for (const format of ['PNG', 'HTML']) {
    const [download] = await Promise.all([
      page.waitForEvent('download'), page.getByRole('button', { name: `Export ${format}`, exact: true }).click(),
    ])
    expect(download.suggestedFilename()).toBe(`ACB-Phonetic-Markup-2026-01-03_03-04-05.${format.toLowerCase()}`)
    const stream = await download.createReadStream()
    const chunks: Buffer[] = []
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk))
    const bytes = Buffer.concat(chunks)
    if (format === 'PNG') {
      expect(pngSize(bytes).signature).toBe('89504e470d0a1a0a')
      expect(pngSize(bytes).width).toBeGreaterThan(0)
    } else {
      expect(bytes.toString('utf8')).toContain('Say ǣ now.')
      expect(bytes.toString('utf8')).toContain('<style>')
    }
  }
  await page.clock.setFixedTime(new Date('2026-01-02T19:04:06Z'))
  const [next] = await Promise.all([
    page.waitForEvent('download'), page.getByRole('button', { name: 'Export PNG', exact: true }).click(),
  ])
  expect(next.suggestedFilename()).toBe('ACB-Phonetic-Markup-2026-01-03_03-04-06.png')
})
