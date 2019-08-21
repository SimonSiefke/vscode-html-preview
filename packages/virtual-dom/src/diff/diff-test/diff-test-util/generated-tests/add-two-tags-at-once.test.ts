import { diff } from '../../../diff'
import { createParser } from '../../../../parse/parse'

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

test(`add-two-tags-at-once.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("<body>\n  <main>\n  </main>\n</body>").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom} = parser.edit(`<body>
  <main>
    <div>New Content</div><div>More new content</div>
  </main>
</body>`, [
    {
      "rangeOffset": 15,
      "rangeLength": 0,
      "text": "\n    <div>New Content</div><div>More new content</div>"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = diff(previousDom.children, nextDom.children, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "\n    "
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "div",
        "attributes": {}
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "New Content"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "div",
        "attributes": {}
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "More new content"
      }
    }
  ]
	expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
	previousDom = nextDom
	
  }
})