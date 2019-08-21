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

test(`text-insertion-in-nested-html.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("<div>\n  <img src=\"https://source.unsplash.com/random\" alt=\"random image\">\n  <p>nested <strong>text</strong></p>\n</div>").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<div>
  <img src="https://source.unsplash.com/random" alt="random image">
  <p>nested <strong>text</strong>!!!</p>
</div>`, [
    {
      "rangeOffset": 107,
      "rangeLength": 0,
      "text": "!!!"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "!!!"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
})