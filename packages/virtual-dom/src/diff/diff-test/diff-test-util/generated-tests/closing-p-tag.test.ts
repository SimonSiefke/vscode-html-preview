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

test(`closing-p-tag.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("<p>").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom} = parser.edit(`<p></p>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 0,
      "text": "</p>"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = diff(previousDom.children, nextDom.children, {oldNodeMap, newNodeMap})
  const expectedEdits = []
	expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
	previousDom = nextDom
	
  }
})