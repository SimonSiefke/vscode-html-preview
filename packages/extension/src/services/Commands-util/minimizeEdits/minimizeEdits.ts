interface Edit {
  readonly rangeOffset: number
  readonly rangeLength: number
  readonly text: string
}

export function minimizeEdits(previousText: string | undefined, edits: readonly Edit[]): Edit[] {
  const newEdits: Edit[] = []
  for (const edit of edits) {
    const newEdit = {
      rangeOffset: edit.rangeOffset,
      rangeLength: edit.rangeLength,
      text: edit.text,
    }
    let same = 0
    for (let i = 0; i < edit.rangeLength; i++) {
      if (previousText[edit.rangeOffset + i] === edit.text[i]) {
        same++
      }
    }

    newEdit.rangeOffset += same
    newEdit.rangeLength -= same
    newEdit.text = newEdit.text.slice(same)
    if (newEdit.rangeLength === 0 && newEdit.text === '') {
      continue
    }

    newEdits.push(newEdit)
  }
  return newEdits
}
