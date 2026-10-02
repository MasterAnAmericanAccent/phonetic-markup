import type { Node as ProseNode } from '@tiptap/pm/model'

export type SearchMatch = {
  from: number
  to: number
}

/**
 * Exact, case-sensitive matches against stored UTF-16 text.
 * A match can cross mark boundaries inside a paragraph.
 * It cannot cross a paragraph boundary or a hard break.
 * Highlight ranges expand to grapheme edges so a combining mark stays with its base.
 * The document text is not normalized or rewritten.
 */
export function findMatches(doc: ProseNode, query: string): SearchMatch[] {
  if (query.length === 0) return []
  const matches: SearchMatch[] = []

  doc.descendants((node, pos) => {
    if (!node.isTextblock) return
    let buffer = ''
    let positions: number[] = []

    const flush = () => {
      collectMatches(buffer, positions, query, matches)
      buffer = ''
      positions = []
    }

    node.forEach((child, offset) => {
      if (!child.isText || !child.text) {
        flush()
        return
      }
      for (let index = 0; index < child.text.length; index += 1) {
        buffer += child.text[index] ?? ''
        positions.push(pos + 1 + offset + index)
      }
    })
    flush()
    return false
  })

  return matches
}

function collectMatches(
  buffer: string,
  positions: number[],
  query: string,
  matches: SearchMatch[],
): void {
  let cursor = 0
  while (cursor <= buffer.length - query.length) {
    const found = buffer.indexOf(query, cursor)
    if (found < 0) break
    const expanded = expandToGraphemes(buffer, found, found + query.length)
    const from = positions[expanded.start]
    const endIndex = positions[expanded.end - 1]
    if (from !== undefined && endIndex !== undefined) {
      matches.push({ from, to: endIndex + 1 })
    }
    cursor = found + query.length
  }
}

function expandToGraphemes(text: string, start: number, end: number): { start: number; end: number } {
  if (typeof Intl.Segmenter !== 'function') return { start, end }
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  let cursor = 0
  let expandedStart = start
  let expandedEnd = end
  for (const part of segmenter.segment(text)) {
    const next = cursor + part.segment.length
    if (start > cursor && start < next) expandedStart = cursor
    if (end > cursor && end < next) expandedEnd = next
    if (next >= end && next > start) break
    cursor = next
  }
  return { start: expandedStart, end: expandedEnd }
}
