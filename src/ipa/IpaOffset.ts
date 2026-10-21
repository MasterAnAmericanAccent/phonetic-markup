import { Mark } from '@tiptap/core'

/** Verified in UAlberta main.61532b02.chunk.js: super, 150%. */
export const IpaOffset = Mark.create({
  name: 'ipaOffset',
  inclusive: false,
  parseHTML: () => [{ tag: 'span[data-ipa-offset]' }],
  renderHTML: () => ['span', { 'data-ipa-offset': '' }, 0],
})
