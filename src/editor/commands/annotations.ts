import { Extension } from '@tiptap/core'
import { isAnnotationKey, type AnnotationKey } from '../annotations/definitions'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    annotationCommands: {
      applyAnnotation: (key: AnnotationKey) => ReturnType
      removeAnnotation: (key: AnnotationKey) => ReturnType
      toggleAnnotation: (key: AnnotationKey) => ReturnType
    }
  }
}

export const AnnotationCommands = Extension.create({
  name: 'annotationCommands',

  addCommands() {
    return {
      applyAnnotation:
        (key) =>
        ({ commands }) => {
          if (!isAnnotationKey(key)) return false
          return commands.setMark(key)
        },
      removeAnnotation:
        (key) =>
        ({ commands }) => {
          if (!isAnnotationKey(key)) return false
          return commands.unsetMark(key)
        },
      toggleAnnotation:
        (key) =>
        ({ commands }) => {
          if (!isAnnotationKey(key)) return false
          return commands.toggleMark(key)
        },
    }
  },
})
