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
		delete htmlDocument.childSignature
		delete htmlDocument.attributeSignature
		delete htmlDocument.subtreeSignature
		delete htmlDocument.textSignature
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
	

test(`missing closing tag`, () => {
  const {error, htmlDocument} = parseHtml(`<h1>hello world`)
	const expectedError = {
    "type": "soft-invalid",
    "message": "missing closing tag",
    "offset": 15
  }
		expect(error).toEqual(expectedError)
	const expectedTree = [
  {
    "nodeType": "ElementNode",
    "tag": "h1",
    "children": [
      {
        "nodeType": "TextNode",
        "text": "hello world"
      }
    ]
  }
]
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`partial closing tag #1`, () => {
  const {error, htmlDocument} = parseHtml(`<h1>hello world<`)
	const expectedError = {
    "type": "invalid",
    "message": "expected start or end tag",
    "offset": 15
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`partial closing tag #2`, () => {
  const {error, htmlDocument} = parseHtml(`<h1>hello world</`)
	const expectedError = {
    "type": "invalid",
    "message": "invalid end tag",
    "offset": 17
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`partial closing tag #3`, () => {
  const {error, htmlDocument} = parseHtml(`<h1>hello world</h`)
	const expectedError = {
    "type": "invalid",
    "message": "invalid end tag",
    "offset": 18
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`partial closing tag #4`, () => {
  const {error, htmlDocument} = parseHtml(`<h1>hello world</h1`)
	const expectedError = {
    "type": "invalid",
    "message": "invalid end tag",
    "offset": 19
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`wrong closing tag`, () => {
  const {error, htmlDocument} = parseHtml(`<h1>hello world</h>`)
	const expectedError = {
    "type": "invalid",
    "message": "wrong end tag (expected h1, got h)",
    "offset": 18
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`fragment tag`, () => {
  const {error, htmlDocument} = parseHtml(`<br>hi</>`)
	const expectedError = {
    "type": "invalid",
    "message": "invalid end tag",
    "offset": 8
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`closing self-closed element`, () => {
  const {error, htmlDocument} = parseHtml(`<br>hi</br>`)
	const expectedError = {
    "type": "invalid",
    "message": "wrong end tag (expected undefined, got br)",
    "offset": 10
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})