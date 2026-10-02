import Blockquote from '@tiptap/extension-blockquote'
import Bold from '@tiptap/extension-bold'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import History from '@tiptap/extension-history'
import Italic from '@tiptap/extension-italic'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { SearchHighlight } from '../search/searchExtension'
import { annotationMarks } from './annotations/registry'
import { AnnotationCommands } from './commands/annotations'
import { CommentMark, ResearchMarkerMark } from './extensions/futureMarks'

/** Standard marks only. Markdown shortcuts stay off so coaching text is not reformatted while typing. */
const BoldMark = Bold.extend({
  addInputRules() {
    return []
  },
  addPasteRules() {
    return []
  },
})

const ItalicMark = Italic.extend({
  addInputRules() {
    return []
  },
  addPasteRules() {
    return []
  },
})

/** Separate from the phonetic `strike` annotation. */
const TextStrike = Strike.extend({
  name: 'textStrike',
  addInputRules() {
    return []
  },
  addPasteRules() {
    return []
  },
})

const HeadingBlock = Heading.extend({
  addInputRules() {
    return []
  },
}).configure({ levels: [1, 2, 3] })

const QuoteBlock = Blockquote.extend({
  addInputRules() {
    return []
  },
  addPasteRules() {
    return []
  },
})

export function createPhoneticExtensions() {
  return [
    Document,
    Paragraph,
    Text,
    HardBreak,
    HeadingBlock,
    QuoteBlock,
    BulletList,
    OrderedList,
    ListItem,
    BoldMark,
    ItalicMark,
    Underline,
    TextStrike,
    TextAlign.configure({
      types: ['heading', 'paragraph', 'blockquote'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: null,
    }),
    History,
    ...annotationMarks,
    CommentMark,
    ResearchMarkerMark,
    AnnotationCommands,
    SearchHighlight,
  ]
}
