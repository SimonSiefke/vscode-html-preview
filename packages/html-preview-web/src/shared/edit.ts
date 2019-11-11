/**
 * Represents a text edit
 */
export interface Edit {
  readonly rangeOffset: number
  readonly rangeLength: number
  readonly text: string
}
