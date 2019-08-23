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

test(`insert-multiple-elements-with-multicursor.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("\n\n").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<
<
<`, [
    {
      "rangeOffset": 0,
      "rangeLength": 0,
      "text": "<"
    },
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "<"
    },
    {
      "rangeOffset": 2,
      "rangeLength": 0,
      "text": "<"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <
<
<`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<li
<li
<li`, [
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "li"
    },
    {
      "rangeOffset": 3,
      "rangeLength": 0,
      "text": "li"
    },
    {
      "rangeOffset": 5,
      "rangeLength": 0,
      "text": "li"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <li
<li
<li`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<li>
<li>
<li>`, [
    {
      "rangeOffset": 3,
      "rangeLength": 0,
      "text": ">"
    },
    {
      "rangeOffset": 7,
      "rangeLength": 0,
      "text": ">"
    },
    {
      "rangeOffset": 11,
      "rangeLength": 0,
      "text": ">"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <li>
<li>
<li>`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<li><
<li><
<li><`, [
    {
      "rangeOffset": 4,
      "rangeLength": 0,
      "text": "<"
    },
    {
      "rangeOffset": 9,
      "rangeLength": 0,
      "text": "<"
    },
    {
      "rangeOffset": 14,
      "rangeLength": 0,
      "text": "<"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <li><
<li><
<li><`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<li></
<li></
<li></`, [
    {
      "rangeOffset": 5,
      "rangeLength": 0,
      "text": "/"
    },
    {
      "rangeOffset": 11,
      "rangeLength": 0,
      "text": "/"
    },
    {
      "rangeOffset": 17,
      "rangeLength": 0,
      "text": "/"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <li></
<li></
<li></`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<li></li
<li></li
<li></li`, [
    {
      "rangeOffset": 6,
      "rangeLength": 0,
      "text": "li"
    },
    {
      "rangeOffset": 13,
      "rangeLength": 0,
      "text": "li"
    },
    {
      "rangeOffset": 20,
      "rangeLength": 0,
      "text": "li"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <li></li
<li></li
<li></li`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<li></li>
<li></li>
<li></li>`, [
    {
      "rangeOffset": 8,
      "rangeLength": 0,
      "text": ">"
    },
    {
      "rangeOffset": 17,
      "rangeLength": 0,
      "text": ">"
    },
    {
      "rangeOffset": 26,
      "rangeLength": 0,
      "text": ">"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <li></li>
<li></li>
<li></li>`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "li"
      }
    },
    {
      "command": "textReplace",
      "payload": {
        "text": "\n"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "li"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "\n"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "li"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
})