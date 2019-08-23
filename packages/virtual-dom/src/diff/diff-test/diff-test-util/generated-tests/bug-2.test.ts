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

test(`bug-2.test.txt`, () => {
	const parser = createParser()
	let previousDom
	  {


  previousDom = parser.parse("<html>\n\n<head>\n  <title>Document</title>\n  <style>\n    }\n  </style>\n</head>\n\n<body>\n  <h1 style=\"height:1000px\">hello world!!!!!</h1>\n  <p>hello world!!!</p>\n</body>\n\n</html>").htmlDocument
  const oldNodeMap = parser.nodeMap
  const {htmlDocument:nextDom, error} = parser.edit(`<html>

<head>
  <title>Document</title>
  <style>
  </style>
</head>

<body>
  <h1 style="height:1000px">hello world!!!!!</h1>
  <p>hello world!!!</p>
</body>

</html>`, [
    {
      "rangeOffset": 52,
      "rangeLength": 6,
      "text": ""
    }
  ])
	const expectedError = undefined;
	if(error && !expectedError){
		console.error(error)
		throw new Error('did not expect error')
	} else if(expectedError && !error){
		throw new Error(`expected error for <html>

<head>
  <title>Document</title>
  <style>
  </style>
</head>

<body>
  <h1 style="height:1000px">hello world!!!!!</h1>
  <p>hello world!!!</p>
</body>

</html>`)
	} else if(!expectedError && !error){

		const newNodeMap = parser.nodeMap
		const edits = diff((previousDom && previousDom.children) || [], nextDom!.children, {oldNodeMap, newNodeMap})
		const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "\n  "
      }
    }
  ]
			expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
			previousDom = nextDom
		}
	
  }
})