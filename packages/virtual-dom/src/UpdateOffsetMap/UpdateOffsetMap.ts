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
  const offsets = Object.keys(offsetMap).map(key => parseInt(key))
  const newOffsetMap = Object.create(null)
  outer: for (const offset of offsets) {
    let change = 0
    for (const edit of edits) {
      if (edit.rangeOffset <= offset) {
        if (offset < edit.rangeOffset + edit.rangeLength) {
          continue outer
        }
        change += edit.text.length - edit.rangeLength
      }
    }
    offset + change //?
    if (offset + change >= 0) {
      newOffsetMap[offset + change] = offsetMap[offset]
    }
  }
  return newOffsetMap
}
