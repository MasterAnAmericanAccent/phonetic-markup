export const annotationCategories = [
  { id: 'feedback', label: 'Feedback' },
  { id: 'connected-speech', label: 'Connected speech' },
  { id: 'rhythm', label: 'Rhythm' },
] as const

export type AnnotationCategoryId = (typeof annotationCategories)[number]['id']

export type AnnotationStatus = 'provisional' | 'confirmed'

/**
 * One coaching mark. Toolbar, selection menu, and later HTML export read this list.
 * Colors stay in CSS variables, not in the stored document.
 */
export type AnnotationDefinition = {
  key: string
  name: string
  description: string
  category: AnnotationCategoryId
  status: AnnotationStatus
  className: string
  inSelectionMenu: boolean
  /** Element later HTML export should use for this mark. */
  exportTag: 'span'
}
