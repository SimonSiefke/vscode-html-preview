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

/**
 * Before:
 * <section>
 * </section>
 * <h1>hello world</h1>
 *
 *
 * After:
 * <section>
 *   <h1>hello world</h1>
 * </section>
 *
 */

// .toEqual({
// 1: 2, /* h1 */
// 4: 4, /* hello */
// 10: 6, /* world */
// })
updateOffsetMap(
  {
    1: 1 /* h1 */,
    4: 2 /* hello world */,
  },
  [
    {
      rangeOffset: 15,
      rangeLength: 5,
      text: '',
    },
    {
      rangeOffset: 2,
      rangeLength: 3,
      text: '',
    },
    {
      rangeOffset: 0,
      rangeLength: 1,
      text: '',
    },
  ]
) //?
