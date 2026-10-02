import { annotationDefinitions } from './definitions'
import { createAnnotationMark } from './createAnnotationMark'

export const annotationMarks = annotationDefinitions.map((definition) =>
  createAnnotationMark(definition),
)
