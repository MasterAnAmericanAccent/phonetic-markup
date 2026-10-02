import { Mark, mergeAttributes } from '@tiptap/core'
import type { AnnotationDefinition } from './types'

export function createAnnotationMark(definition: AnnotationDefinition) {
  return Mark.create({
    name: definition.key,
    inclusive: false,
    spanning: true,
    parseHTML() {
      return [{ tag: `span[data-annotation="${definition.key}"]` }]
    },
    renderHTML({ HTMLAttributes }) {
      return [
        'span',
        mergeAttributes(HTMLAttributes, {
          'data-annotation': definition.key,
          class: definition.className,
        }),
        0,
      ]
    },
  })
}
