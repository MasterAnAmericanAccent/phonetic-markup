import { expect, type Page } from '@playwright/test'

export type EditorSnapshot = {
  text: string
  marks: { text: string; marks: string[] }[]
  paragraphs: number
  hardBreaks: number
  selectionText: string
  selectionEmpty: boolean
  markNames: string[]
  json: string
}

export async function readEditor(page: Page): Promise<EditorSnapshot> {
  return page.evaluate(() => {
    const host = [...document.querySelectorAll('button')].find((button) =>
      (button.textContent ?? '').includes('Export HTML'),
    )
    if (!host) throw new Error('Export HTML button is missing')
    const fiberKey = Object.keys(host).find((key) => key.startsWith('__reactFiber'))
    if (!fiberKey) throw new Error('React fiber is missing')
    type Fiber = {
      memoizedProps?: {
        editor?: {
          state: {
            doc: {
              textContent: string
              textBetween: (from: number, to: number, blockSeparator?: string) => string
              descendants: (fn: (node: DocNode) => void) => void
            }
            selection: { empty: boolean; from: number; to: number }
          }
          getJSON: () => unknown
          schema: { marks: Record<string, unknown> }
        }
      }
      return?: Fiber | null
    }
    type DocNode = {
      isText: boolean
      text?: string
      marks: { type: { name: string } }[]
      type: { name: string }
    }
    let fiber = (host as unknown as Record<string, Fiber>)[fiberKey]
    let editor = fiber?.memoizedProps?.editor
    while (fiber && !editor?.state) {
      fiber = fiber.return ?? undefined
      editor = fiber?.memoizedProps?.editor
    }
    if (!editor) throw new Error('Editor instance is missing')
    const marks: { text: string; marks: string[] }[] = []
    let hardBreaks = 0
    let paragraphs = 0
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'paragraph') paragraphs += 1
      if (node.type.name === 'hardBreak') hardBreaks += 1
      if (node.isText && node.marks.length > 0) {
        marks.push({ text: node.text ?? '', marks: node.marks.map((mark) => mark.type.name) })
      }
    })
    return {
      text: editor.state.doc.textContent,
      marks,
      paragraphs,
      hardBreaks,
      selectionText: editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        '\n',
      ),
      selectionEmpty: editor.state.selection.empty,
      markNames: Object.keys(editor.schema.marks),
      json: JSON.stringify(editor.getJSON()),
    }
  })
}

export async function replaceWith(page: Page, text: string) {
  await page.locator('.ProseMirror').click()
  await page.keyboard.press('Control+a')
  await page.keyboard.press('Backspace')
  if (text.length > 0) await page.keyboard.type(text)
}

export async function textRect(page: Page, needle: string) {
  const rect = await page.evaluate((target) => {
    const root = document.querySelector('.ProseMirror')
    if (!root) return null
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let current = walker.nextNode()
    while (current) {
      const value = current.textContent ?? ''
      const index = value.indexOf(target)
      if (index >= 0) {
        const range = document.createRange()
        range.setStart(current, index)
        range.setEnd(current, index + target.length)
        const box = range.getBoundingClientRect()
        return { x: box.x, y: box.y, width: box.width, height: box.height }
      }
      current = walker.nextNode()
    }
    return null
  }, needle)
  if (!rect || rect.width === 0 || rect.height === 0) {
    throw new Error(`Text is not visible: ${needle}`)
  }
  return rect
}

export async function selectVisibleText(page: Page, needle: string) {
  const selected = await page.evaluate((target) => {
    const host = [...document.querySelectorAll('button')].find((button) =>
      (button.textContent ?? '').includes('Export HTML'),
    )
    if (!host) throw new Error('Export HTML button is missing')
    const fiberKey = Object.keys(host).find((key) => key.startsWith('__reactFiber'))
    if (!fiberKey) throw new Error('React fiber is missing')
    type Fiber = {
      memoizedProps?: {
        editor?: {
          commands: { setTextSelection: (range: { from: number; to: number }) => boolean; focus: () => boolean }
          state: {
            doc: {
              textBetween: (from: number, to: number, blockSeparator?: string) => string
              descendants: (fn: (node: { isText: boolean; text?: string }, pos: number) => void) => void
            }
          }
        }
      }
      return?: Fiber | null
    }
    let fiber = (host as unknown as Record<string, Fiber>)[fiberKey]
    let editor = fiber?.memoizedProps?.editor
    while (fiber && !editor?.state) {
      fiber = fiber.return ?? undefined
      editor = fiber?.memoizedProps?.editor
    }
    if (!editor) throw new Error('Editor instance is missing')
    let combined = ''
    const positions: number[] = []
    editor.state.doc.descendants((node, pos) => {
      if (!node.isText || !node.text) return
      for (let index = 0; index < node.text.length; index += 1) {
        combined += node.text[index] ?? ''
        positions.push(pos + index)
      }
    })
    const start = combined.indexOf(target)
    const from = positions[start]
    const to = positions[start + target.length - 1]
    if (start < 0 || from === undefined || to === undefined) throw new Error(`Text not found: ${target}`)
    editor.commands.setTextSelection({ from, to: to + 1 })
    editor.commands.focus()
    return editor.state.doc.textBetween(from, to + 1, '\n')
  }, needle)
  expect(selected).toBe(needle)
}

export async function applyMark(page: Page, name: string) {
  await page.getByRole('button', { name: `Apply ${name}`, exact: true }).first().click()
}

export function markText(state: EditorSnapshot, name: string) {
  return state.marks.filter((mark) => mark.marks.includes(name)).map((mark) => mark.text).join('')
}

export async function writeClipboard(page: Page, items: Record<string, string>) {
  await page.evaluate(async (payload) => {
    const entries = Object.entries(payload).map(
      ([type, value]) => [type, new Blob([value], { type })] as const,
    )
    await navigator.clipboard.write([new ClipboardItem(Object.fromEntries(entries))])
  }, items)
}

export async function pngBytes(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export PNG' }).click(),
  ])
  const stream = await download.createReadStream()
  if (!stream) throw new Error('PNG download has no stream')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
}

export function pngSize(bytes: Buffer) {
  const signature = bytes.subarray(0, 8).toString('hex')
  return {
    signature,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  }
}

export async function scanPng(page: Page, bytes: Buffer) {
  return page.evaluate(async (encoded) => {
    const binary = atob(encoded)
    const buffer = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) buffer[index] = binary.charCodeAt(index)
    const blob = new Blob([buffer], { type: 'image/png' })
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('canvas is missing')
    context.drawImage(bitmap, 0, 0)
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data
    let ink = 0
    let errorRed = 0
    let searchBlue = 0
    let nasalPurple = 0
    let alternateBlue = 0
    for (let index = 0; index < data.length; index += 4) {
      const red = data[index] ?? 0
      const green = data[index + 1] ?? 0
      const blue = data[index + 2] ?? 0
      const alpha = data[index + 3] ?? 0
      if (alpha < 20) continue
      if (red < 250 || green < 250 || blue < 250) ink += 1
      if (Math.abs(red - 155) < 28 && green < 60 && Math.abs(blue - 28) < 28) errorRed += 1
      if (Math.abs(red - 109) < 24 && Math.abs(green - 40) < 24 && Math.abs(blue - 217) < 24) nasalPurple += 1
      if (Math.abs(red - 29) < 36 && Math.abs(green - 78) < 36 && Math.abs(blue - 216) < 36) alternateBlue += 1
      if (blue > 210 && green > 170 && red < 120) searchBlue += 1
    }
    return { width: bitmap.width, height: bitmap.height, ink, errorRed, nasalPurple, searchBlue, alternateBlue }
  }, bytes.toString('base64'))
}
