import type { JSONContent } from '@tiptap/core'

export const DOCUMENT_VERSION = 1 as const

export type DocumentMetadata = {
  title?: string
}

export type PhoneticDocument = {
  version: typeof DOCUMENT_VERSION
  metadata: DocumentMetadata
  content: JSONContent
}
