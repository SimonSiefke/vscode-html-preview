import { parseHtml } from '../../../parse'


	function adjustHtmlDocument(htmlDocument){
		if(!htmlDocument){
			return null
		}
		if(Array.isArray(htmlDocument)){
			return htmlDocument.map(adjustHtmlDocument)
		}
		delete htmlDocument.id
		delete htmlDocument.start
		if(htmlDocument.nodeType==="ElementNode"){
			htmlDocument.children = htmlDocument.children.map(adjustHtmlDocument)
		}
		return htmlDocument
	}
	function adjustExpectedTree(expectedTree){
		if(!expectedTree){
			return expectedTree
		}
		if(Array.isArray(expectedTree)){
			return expectedTree.map(adjustExpectedTree)
		}
		if(expectedTree.nodeType==="ElementNode" && !expectedTree.attributes){
			expectedTree.attributes = {}
		}
		if(expectedTree.nodeType==="ElementNode" && !expectedTree.children){
			expectedTree.children = []
		}
		if(expectedTree.nodeType==="ElementNode"){
			expectedTree.children = expectedTree.children.map(adjustExpectedTree)
		}
		return expectedTree
	}
	

test.skip(`partial start tag #1`, () => {
  const {error, htmlDocument} = parseHtml(`<h1`)
	const expectedError = {
    "type": "invalid",
    "message": "invalid start tag",
    "offset": 0
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`only start tag`, () => {
  const {error, htmlDocument} = parseHtml(`<h1>`)
	const expectedError = {
    "type": "soft-invalid",
    "message": "missing closing tag",
    "offset": 4
  }
		expect(error).toEqual(expectedError)
	const expectedTree = [
  {
    "nodeType": "ElementNode",
    "tag": "h1"
  }
]
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`whitespace before tag name`, () => {
  const {error, htmlDocument} = parseHtml(`< h1></h1>`)
	const expectedError = {
    "type": "invalid",
    "message": "expected start or end tag",
    "offset": 0
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test.skip(`one additional angle bracket`, () => {
  const {error, htmlDocument} = parseHtml(`<br>>`)
	const expectedError = {
    "type": "invalid",
    "message": "expected start or end tag",
    "offset": 0
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`two additional angle brackets`, () => {
  const {error, htmlDocument} = parseHtml(`<<br>>`)
	const expectedError = {
    "type": "invalid",
    "message": "expected start or end tag",
    "offset": 0
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`missing angle bracket at the end of start tag`, () => {
  const {error, htmlDocument} = parseHtml(`<div
  <button>hi</button>
</div>`)
	const expectedError = {
    "type": "invalid",
    "message": "wrong end tag",
    "offset": 25
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})