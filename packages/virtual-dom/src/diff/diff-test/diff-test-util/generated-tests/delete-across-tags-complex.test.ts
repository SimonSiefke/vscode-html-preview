import { diff } from '../../../diff2'
import { parse } from '../../../../parse/parse2'
import { updateOffsetMap } from '../../../../parse/updateOffsetMap'

function adjustEdits(edits){
  for(const edit of edits){
    delete edit.payload.index
    delete edit.payload.beforeId
    delete edit.payload.id
    delete edit.payload.parentId
  }
  return edits
}

function adjustExpectedEdits(expectedEdits){
  for(const expectedEdit of expectedEdits){
    if(expectedEdit.command==='elementInsert' && expectedEdit.payload.nodeType==='ElementNode'){
      expectedEdit.payload.attributes = expectedEdit.payload.attributes||{}
    }
  }
  return expectedEdits
}

test(`delete-across-tags-complex.test.txt`, () => {
  let offsetMap = Object.create(null)

  let id = 0
  const p1 = parse(`<p>
  Hello
</p>
<p>
    <em>World</em>
</p>`, offset => {
    const nextId = id++
    offsetMap[offset] = nextId
    return nextId
  })

  offsetMap = updateOffsetMap(offsetMap, [
    {
      "rangeOffset": 12,
      "rangeLength": 8,
      "text": ""
    }
  ])

  let newOffsetMap = Object.create(null)

  const p2 = parse(`<p>
  Hello

    <em>World</em>
</p>`, (offset, tokenLength) => {
    let nextId: number
    nextId: if (offset in offsetMap) {
      nextId = offsetMap[offset]
    } else {
      for (let i = offset + 1; i < offset + tokenLength; i++) {
        if (i in offsetMap) {
          nextId = offsetMap[i]
          break nextId
        }
      }
      nextId = id++
    }
    newOffsetMap[offset] = nextId
    return nextId
  })
  if(p1.status === 'success' && p2.status === 'success'){
    const edits = diff(p1, p2)
    const expectedEdits = [
      {
        "command": "elementDelete",
        "payload": {}
      },
      {
        "command": "elementDelete",
        "payload": {}
      },
      {
        "command": "elementMove",
        "payload": {}
      },
      {
        "command": "elementMove",
        "payload": {}
      },
      {
        "command": "textReplace",
        "payload": {
          "text": "\n  Hello\n\n    "
        }
      }
    ]
    expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
  }
})