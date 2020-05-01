export const updateOffsetMap = (
  offsetMap: {
    readonly [offset: number]: number
  },
  edits: readonly {
    readonly rangeOffset: number
    readonly text: string
    readonly rangeLength: number
  }[]
) => {
  let editIndex = 0
  const offsets = Object.keys(offsetMap).map(key => parseInt(key))
  let offsetIndex = 0
  const newOffsetMap = Object.create(null)
  let totalInserted = 0
  let totalDeleted = 0
  while (editIndex < edits.length && offsetIndex < offsets.length) {
    const edit = edits[editIndex]
    const offset = offsets[offsetIndex]
    if (edit.rangeOffset <= offset) {
      if (offset < edit.rangeOffset + edit.rangeLength) {
        offsetIndex++
        continue
      }
      totalInserted += edit.text.length
      totalDeleted += edit.rangeLength
      newOffsetMap[offset + totalInserted - totalDeleted] = offsetMap[offset]
      offsetIndex++
      editIndex++
    } else if (edit.rangeOffset > offset) {
      newOffsetMap[offset + totalInserted - totalDeleted] = offsetMap[offset]
      offsetIndex++
    }
  }
  while (offsetIndex < offsets.length) {
    const offset = offsets[offsetIndex]
    newOffsetMap[offset + totalInserted - totalDeleted] = offsetMap[offset]
    offsetIndex++
  }
  return newOffsetMap
}
