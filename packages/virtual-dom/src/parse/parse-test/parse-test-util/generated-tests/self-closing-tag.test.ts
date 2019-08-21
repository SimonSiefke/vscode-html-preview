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
	

test(`br tag`, () => {
  const {error, htmlDocument} = parseHtml(`<br>`)
	const expectedError = null
		expect(error).toEqual(expectedError)
	const expectedTree = [
  {
    "nodeType": "ElementNode",
    "tag": "br",
    "children": []
  }
]
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})

test(`multiple br tags`, () => {
  const {error, htmlDocument} = parseHtml(`<h1><br><br></h1>`)
	const expectedError = null
		expect(error).toEqual(expectedError)
	const expectedTree = [
  {
    "nodeType": "ElementNode",
    "tag": "h1",
    "children": [
      {
        "nodeType": "ElementNode",
        "tag": "br"
      },
      {
        "nodeType": "ElementNode",
        "tag": "br"
      }
    ]
  }
]
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})