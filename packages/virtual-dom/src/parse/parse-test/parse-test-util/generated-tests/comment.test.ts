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
		delete htmlDocument.closed
		delete htmlDocument.parent
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
	

test(`empty comment`, () => {
  const {error, htmlDocument} = parseHtml(`<!---->`)
	const expectedError = null
		expect(error).toEqual(expectedError)
	const expectedTree = [
  {
    "nodeType": "CommentNode",
    "text": ""
  }
]
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`only start comment`, () => {
  const {error, htmlDocument} = parseHtml(`<!--`)
	const expectedError = {
    "type": "invalid",
    "message": "invalid end tag",
    "offset": 4
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`missing dash in start comment`, () => {
  const {error, htmlDocument} = parseHtml(`<!- -->`)
	const expectedError = {
    "type": "invalid",
    "message": "expected start or end tag",
    "offset": 0
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`whatever this is`, () => {
  const {error, htmlDocument} = parseHtml(`<!></!>`)
	const expectedError = {
    "type": "invalid",
    "message": "expected start or end tag",
    "offset": 0
  }
		expect(error).toEqual(expectedError)
	const expectedTree = null
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})