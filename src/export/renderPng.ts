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
  return PNG_PIXEL_RATIO
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
  host.style.cssText = 'position:fixed;left:-10000px;top:0;pointer-events:none;'
  host.append(article)
  document.head.append(style)
  document.body.append(host)
  try {
    const width = Math.ceil(article.getBoundingClientRect().width)
    const height = Math.ceil(article.scrollHeight)
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
      windowWidth: width,
      windowHeight: height,
      logging: false,
    })
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
