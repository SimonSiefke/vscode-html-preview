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

test(`insert-100-insert-element-between-text-and-text.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("ac").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`a<h1>b</h1>c`, [
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "<h1>b</h1>"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for a<h1>b</h1>c`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "a"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "h1"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "b"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "c"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
})