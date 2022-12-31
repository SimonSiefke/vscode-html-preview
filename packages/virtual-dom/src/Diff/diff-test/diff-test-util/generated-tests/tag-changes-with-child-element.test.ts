import { diff } from '../../../Diff'
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

test(`tag-changes-with-child-element.test.txt`, () => {
  let offsetMap = Object.create(null)

  let id = 0
  const p1 = parse(`<p>
    hello world
</p>`, offset => {
    const nextId = id++
    offsetMap[offset] = nextId
    return nextId
  })

  offsetMap = updateOffsetMap(offsetMap, [
    {
      "rangeOffset": 1,
      "rangeLength": 1,
      "text": "div"
    },
    {
      "rangeOffset": 22,
      "rangeLength": 1,
      "text": "div"
    }
  ])

  let newOffsetMap = Object.create(null)

  const p2 = parse(`<div>
    hello world
</div>`, (offset, tokenLength) => {
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
        "command": "elementInsert",
        "payload": {
          "nodeType": "ElementNode",
          "tag": "div"
        }
      },
      {
        "command": "elementInsert",
        "payload": {
          "nodeType": "TextNode",
          "text": "\n    hello world\n"
        }
      }
    ]
    expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
  }
})