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

test(`h1-to-h3.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`h1`, [
    {
      "rangeOffset": 0,
      "rangeLength": 0,
      "text": "h1"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for h1`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "h1"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1></h1>`, [
    {
      "rangeOffset": 0,
      "rangeLength": 2,
      "text": "<h1></h1>"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1></h1>`)
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
        "tag": "h1"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>first heading</h1>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 0,
      "text": "first heading"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1>first heading</h1>`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "first heading"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>first heading</h1>
`, [
    {
      "rangeOffset": 22,
      "rangeLength": 0,
      "text": "\n"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1>first heading</h1>
`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "\n"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>first heading</h1>
h2`, [
    {
      "rangeOffset": 23,
      "rangeLength": 0,
      "text": "h2"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1>first heading</h1>
h2`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "\nh2"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>first heading</h1>
<h2></h2>`, [
    {
      "rangeOffset": 23,
      "rangeLength": 2,
      "text": "<h2></h2>"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1>first heading</h1>
<h2></h2>`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
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
        "tag": "h2"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>first heading</h1>
<h2>second heading</h2>`, [
    {
      "rangeOffset": 27,
      "rangeLength": 0,
      "text": "second heading"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1>first heading</h1>
<h2>second heading</h2>`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "second heading"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>first heading</h1>
<h2>second heading</h2>
`, [
    {
      "rangeOffset": 46,
      "rangeLength": 0,
      "text": "\n"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1>first heading</h1>
<h2>second heading</h2>
`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "\n"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>first heading</h1>
<h2>second heading</h2>
h3`, [
    {
      "rangeOffset": 47,
      "rangeLength": 0,
      "text": "h3"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1>first heading</h1>
<h2>second heading</h2>
h3`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "\nh3"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>first heading</h1>
<h2>second heading</h2>
<h3></h3>`, [
    {
      "rangeOffset": 47,
      "rangeLength": 2,
      "text": "<h3></h3>"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1>first heading</h1>
<h2>second heading</h2>
<h3></h3>`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
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
        "tag": "h3"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
  {


  
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<h1>first heading</h1>
<h2>second heading</h2>
<h3>third heading</h3>`, [
    {
      "rangeOffset": 51,
      "rangeLength": 0,
      "text": "third heading"
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <h1>first heading</h1>
<h2>second heading</h2>
<h3>third heading</h3>`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "third heading"
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
})