import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { createTestEditor } from '../editor/testSupport'
import { ExportActions } from './ExportActions'
import { downloadBlob, htmlExportFilename, pngExportFilename } from './download'
import { renderDocumentPng } from './renderPng'

vi.mock('./download', async importOriginal => ({
  ...await importOriginal<typeof import('./download')>(), downloadBlob: vi.fn(),
}))
vi.mock('./renderPng', async importOriginal => ({
  ...await importOriginal<typeof import('./renderPng')>(), renderDocumentPng: vi.fn(),
}))

describe('consistent local export filenames', () => {
  for (const [date, expected] of [
    [new Date(2026, 0, 2, 3, 4, 5), '2026-01-02_03-04-05'],
    [new Date(2026, 11, 31, 23, 59, 59), '2026-12-31_23-59-59'],
  ] as const) it(`shares the filesystem-safe local timestamp ${expected} across formats`, () => {
    expect(pngExportFilename(date)).toBe(`ACB-Phonetic-Markup-${expected}.png`)
    expect(htmlExportFilename(date)).toBe(`ACB-Phonetic-Markup-${expected}.html`)
  })

  it('keeps the PNG click timestamp even when rendering finishes on the next day', async () => {
    const editor = createTestEditor('<p>Unicode ǣ</p>')
    const host = document.createElement('div'); document.body.append(host)
    const root = createRoot(host)
    let finish!: (blob: Blob) => void
    vi.mocked(renderDocumentPng).mockReturnValueOnce(new Promise(resolve => { finish = resolve }))
    const blob = new Blob(['png'])
    try {
      await act(async () => root.render(createElement(ExportActions, { editor })))
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 11, 31, 23, 59, 59))
      const png = [...host.querySelectorAll('button')].find(button => button.textContent?.includes('Export PNG'))!
      await act(async () => png.click())
      vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 4))
      await act(async () => finish(blob))
      expect(downloadBlob).toHaveBeenCalledWith(blob, 'ACB-Phonetic-Markup-2026-12-31_23-59-59.png')
    } finally {
      vi.useRealTimers()
      await act(async () => root.unmount())
      editor.destroy(); host.remove()
      vi.clearAllMocks()
    }
  })
})
