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

test(`multiple-inserted-tags-and-text.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("<h1><strong>Emphasized</strong> Hello </h1>").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1><em>Foo</em> bar <strong>Baz!</strong> Hello </h1>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 27,
      "text": "<em>Foo</em> bar <strong>Baz!</strong>"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1><em>Foo</em> bar <strong>Baz!</strong> Hello </h1>`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
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
        "text": "Foo"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": " bar "
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "strong"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "Baz!"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
})