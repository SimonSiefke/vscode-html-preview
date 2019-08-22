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

test(`insert-h1-character-by-character.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<`, [
    {
      "rangeOffset": 0,
      "rangeLength": 0,
      "text": "<"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h`, [
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "h"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1`, [
    {
      "rangeOffset": 2,
      "rangeLength": 0,
      "text": "1"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>`, [
    {
      "rangeOffset": 3,
      "rangeLength": 0,
      "text": ">"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>hello world`, [
    {
      "rangeOffset": 4,
      "rangeLength": 0,
      "text": "hello world"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>hello world<`, [
    {
      "rangeOffset": 15,
      "rangeLength": 0,
      "text": "<"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>hello world</`, [
    {
      "rangeOffset": 16,
      "rangeLength": 0,
      "text": "/"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>hello world</h`, [
    {
      "rangeOffset": 17,
      "rangeLength": 0,
      "text": "h"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>hello world</h1`, [
    {
      "rangeOffset": 18,
      "rangeLength": 0,
      "text": "1"
    }
  ])
	const expectedError = true;
	if(error && !expectedError){
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error('expected error')
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom.children, {oldNodeMap, newNodeMap})
		const expectedEdits = []
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>hello world</h1>`, [
    {
      "rangeOffset": 19,
      "rangeLength": 0,
      "text": ">"
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
        "nodeType": "ElementNode",
        "tag": "h1"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "hello world"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
})