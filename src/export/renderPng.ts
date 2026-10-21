import html2canvas from 'html2canvas'
import { documentExportCss } from './documentCss'

export const PNG_MAX_DIMENSION = 16384
export const PNG_PIXEL_RATIO = 2

export class ExportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExportError'
  }
}

/** Pixel ratio for a full-document capture. Throws instead of cropping a passage that cannot fit. */
export function resolvePngScale(width: number, height: number): number {
  if (width > PNG_MAX_DIMENSION || height > PNG_MAX_DIMENSION) {
    throw new ExportError('This passage is too long to export as one PNG.')
  }
  if (width * PNG_PIXEL_RATIO > PNG_MAX_DIMENSION || height * PNG_PIXEL_RATIO > PNG_MAX_DIMENSION) return 1
  return Math.min(Math.max(PNG_PIXEL_RATIO, window.devicePixelRatio || 1), PNG_MAX_DIMENSION / Math.max(width, height))
}

export function exportErrorMessage(error: unknown, format: 'PNG' | 'HTML'): string {
  if (error instanceof ExportError) return error.message
  return `${format} export failed.`
}

/**
 * Paint the export HTML to PNG.
 * The article is mounted off-screen from that HTML. It is not a screenshot of the application.
 * html2canvas is used because this browser will not export an SVG foreignObject to a PNG:
 * that canvas is treated as tainted. The library paints the document element itself.
 */
export async function renderDocumentPng(html: string): Promise<Blob> {
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const article = parsed.querySelector('.document')
  if (!(article instanceof HTMLElement)) {
    throw new ExportError('Could not render the document for PNG export.')
  }
  const style = document.createElement('style')
  style.textContent = documentExportCss()
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${document.documentElement.clientWidth}px;pointer-events:none;`
  host.append(article)
  document.head.append(style)
  document.body.append(host)
  try {
    await document.fonts?.ready
    const width = Math.ceil(article.getBoundingClientRect().width)
    const height = Math.ceil(Math.max(article.scrollHeight, article.getBoundingClientRect().height))
    if (width < 1 || height < 1) throw new ExportError('Could not render the document for PNG export.')
    const ratio = resolvePngScale(width, height)
    return await paintDocument(article, width, height, ratio)
  } finally {
    host.remove()
    style.remove()
  }
}

async function paintDocument(article: HTMLElement, width: number, height: number, ratio: number): Promise<Blob> {
  try {
    const canvas = await html2canvas(article, {
      backgroundColor: '#ffffff',
      scale: ratio,
      width,
      height,
      windowWidth: window.innerWidth,
      windowHeight: height,
      logging: false,
      // html2canvas paints ancestor decorations before descendant backgrounds.
      // Paint phonetic strokes last so nested highlights cannot hide them.
      onclone: (cloned) => {
        cloned.querySelectorAll<HTMLElement>(strokeSelector).forEach(element => {
          element.style.textDecoration = 'none'
        })
      },
    })
    paintAnnotationStrokes(canvas, article, ratio)
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png')
    })
    if (!blob) throw new ExportError('Could not render the document for PNG export.')
    return blob
  } catch (error) {
    if (error instanceof ExportError) throw error
    throw new ExportError('Could not render the document for PNG export.')
  }
}

const strokeSelector = ['voicing', 'nasal', 'glide', 'link', 'blend', 'stress']
  .map(key => `[data-annotation="${key}"]`).join(',')

/** Use live font metrics and inline fragments; never draw across a wrapped line. */
function paintAnnotationStrokes(canvas: HTMLCanvasElement, article: HTMLElement, ratio: number) {
  const context = canvas.getContext('2d')
  if (!context) throw new ExportError('Could not render the document for PNG export.')
  const origin = article.getBoundingClientRect()
  context.save()
  context.resetTransform()
  context.scale(ratio, ratio)
  article.querySelectorAll<HTMLElement>(strokeSelector).forEach(element => {
    const style = getComputedStyle(element)
    const key = element.dataset.annotation
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    const metrics = context.measureText('Mg')
    const ascent = metrics.fontBoundingBoxAscent
    const offset = parseFloat(style.textUnderlineOffset) || 0
    context.strokeStyle = style.textDecorationColor
    context.lineWidth = parseFloat(style.textDecorationThickness) || 1
    context.setLineDash(key === 'blend' ? [4, 3] : [])
    // Text ranges omit an annotation's padding/border, giving the font's own box.
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    let text = walker.nextNode()
    while (text) {
      const range = document.createRange()
      range.selectNodeContents(text)
      for (const rect of range.getClientRects()) {
        if (rect.width === 0) continue
        const left = rect.left - origin.left
        const right = rect.right - origin.left
        const y = key === 'nasal' ? rect.top - origin.top : rect.top - origin.top + ascent + offset
        context.beginPath()
        if (key === 'glide') {
          context.moveTo(left, y)
          for (let x = left; x <= right; x += 1) context.lineTo(x, y + Math.sin((x - left) * Math.PI / 4) * 1.5)
        } else {
          context.moveTo(left, y)
          context.lineTo(right, y)
          if (key === 'link') {
            context.moveTo(left, y + 3)
            context.lineTo(right, y + 3)
          }
        }
        context.stroke()
      }
      text = walker.nextNode()
    }
  })
  context.restore()
}
