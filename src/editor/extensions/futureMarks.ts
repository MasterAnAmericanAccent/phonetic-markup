import { Mark, mergeAttributes } from '@tiptap/core'

/**
 * Reserved so a later milestone can attach comments without changing the text model.
 * No coaching UI reads these marks in M1.
 */
export const CommentMark = Mark.create({
  name: 'comment',
  inclusive: false,
  excludes: 'comment',
  addAttributes() {
    return {
      id: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-comment-id') ?? '',
        renderHTML: (attributes) => ({ 'data-comment-id': attributes.id as string }),
      },
      body: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-comment-body') ?? '',
        renderHTML: (attributes) => ({ 'data-comment-body': attributes.body as string }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },
})

/** Reserved research marker. The mark range is the reference to the source text. */
export const ResearchMarkerMark = Mark.create({
  name: 'researchMarker',
  inclusive: false,
  excludes: 'researchMarker',
  addAttributes() {
    return {
      id: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-research-id') ?? '',
        renderHTML: (attributes) => ({ 'data-research-id': attributes.id as string }),
      },
      label: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-research-label') ?? '',
        renderHTML: (attributes) => ({ 'data-research-label': attributes.label as string }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'span[data-research-id]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0]
  },
})
