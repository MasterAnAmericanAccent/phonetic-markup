import type { JSONContent } from '@tiptap/core'
import { DOCUMENT_VERSION, type DocumentMetadata, type PhoneticDocument } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function serializeDocument(
  content: JSONContent,
  metadata: DocumentMetadata = {},
): PhoneticDocument {
  const stored: DocumentMetadata = {}
  if (metadata.title !== undefined) stored.title = metadata.title
  return {
    version: DOCUMENT_VERSION,
    metadata: stored,
    content: structuredClone(content),
  }
}

export function deserializeDocument(input: unknown): PhoneticDocument {
  if (!isRecord(input)) {
    throw new Error('Document must be an object')
  }
  if (input.version !== DOCUMENT_VERSION) {
    throw new Error(`Unsupported document version: ${String(input.version)}`)
  }
  if (!isRecord(input.content) || input.content.type !== 'doc') {
    throw new Error('Document content is missing')
  }

  const metadata: DocumentMetadata = {}
  if (isRecord(input.metadata) && typeof input.metadata.title === 'string') {
    metadata.title = input.metadata.title
  }

  return {
    version: DOCUMENT_VERSION,
    metadata,
    content: structuredClone(input.content) as JSONContent,
  }
}
