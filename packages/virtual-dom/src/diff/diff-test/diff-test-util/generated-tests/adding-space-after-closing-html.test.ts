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

test(`adding-space-after-closing-html.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("<html></html>").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom} = parser.edit(`<html></html> `, [
    {
      "rangeOffset": 13,
      "rangeLength": 0,
      "text": " "
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = diff(previousDom.children, nextDom.children, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": " "
      }
    }
  ]
	expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
	previousDom = nextDom
	
  }
})