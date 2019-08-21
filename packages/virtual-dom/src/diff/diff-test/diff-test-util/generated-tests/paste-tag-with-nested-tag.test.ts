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

test(`paste-tag-with-nested-tag.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom} = parser.edit(`<div>New <em>Awesome</em> Content</div>`, [
    {
      "rangeOffset": 0,
      "rangeLength": 0,
      "text": "<div>New <em>Awesome</em> Content</div>"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = diff(previousDom.children, nextDom.children, {oldNodeMap, newNodeMap})
  const expectedEdits = [
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
        "text": "New "
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "em"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "Awesome"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": " Content"
      }
    }
  ]
	expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
	previousDom = nextDom
	
  }
})