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
	

test(`html5 boilerplate`, () => {
  const {error, htmlDocument} = parseHtml(`<!doctype html>
<html class="no-js" lang="">

<head>
  <meta charset="utf-8">
  <title></title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link rel="manifest" href="site.webmanifest">
  <link rel="apple-touch-icon" href="icon.png">
  <!-- Place favicon.ico in the root directory -->

  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/main.css">

  <meta name="theme-color" content="#fafafa">
</head>

<body>
  <!--[if IE]>
    <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="https://browsehappy.com/">upgrade your browser</a> to improve your experience and security.</p>
  <![endif]-->

  <!-- Add your site or application content here -->
  <p>Hello world! This is HTML5 Boilerplate.</p>
  <script src="js/vendor/modernizr-3.7.1.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
  <script>window.jQuery || document.write('<script src="js/vendor/jquery-3.4.1.min.js"><\\/script>')</script>
  <script src="js/plugins.js"></script>
  <script src="js/main.js"></script>

  <!-- Google Analytics: change UA-XXXXX-Y to be your site's ID. -->
  <script>
    window.ga = function () { ga.q.push(arguments) }; ga.q = []; ga.l = +new Date;
    ga('create', 'UA-XXXXX-Y', 'auto'); ga('set','transport','beacon'); ga('send', 'pageview')
  </script>
  <script src="https://www.google-analytics.com/analytics.js" async></script>
</body>

</html>`)
	const expectedError = null
		expect(error).toEqual(expectedError)
	const expectedTree = [
  {
    "nodeType": "ElementNode",
    "tag": "!doctype",
    "attributes": {
      "html": null
    }
  },
  {
    "nodeType": "TextNode",
    "text": "\n"
  },
  {
    "nodeType": "ElementNode",
    "tag": "html",
    "attributes": {
      "class": "\"no-js\"",
      "lang": "\"\""
    },
    "children": [
      {
        "nodeType": "TextNode",
        "text": "\n\n"
      },
      {
        "nodeType": "ElementNode",
        "tag": "head",
        "children": [
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "meta",
            "attributes": {
              "charset": "\"utf-8\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "title"
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "meta",
            "attributes": {
              "name": "\"description\"",
              "content": "\"\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "meta",
            "attributes": {
              "name": "\"viewport\"",
              "content": "\"width=device-width, initial-scale=1\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "link",
            "attributes": {
              "rel": "\"manifest\"",
              "href": "\"site.webmanifest\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "link",
            "attributes": {
              "rel": "\"apple-touch-icon\"",
              "href": "\"icon.png\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "CommentNode",
            "text": " Place favicon.ico in the root directory "
          },
          {
            "nodeType": "TextNode",
            "text": "\n\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "link",
            "attributes": {
              "rel": "\"stylesheet\"",
              "href": "\"css/normalize.css\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "link",
            "attributes": {
              "rel": "\"stylesheet\"",
              "href": "\"css/main.css\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "meta",
            "attributes": {
              "name": "\"theme-color\"",
              "content": "\"#fafafa\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n"
          }
        ]
      },
      {
        "nodeType": "TextNode",
        "text": "\n\n"
      },
      {
        "nodeType": "ElementNode",
        "tag": "body",
        "children": [
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "CommentNode",
            "text": "[if IE]>\n    <p class=\"browserupgrade\">You are using an <strong>outdated</strong> browser. Please <a href=\"https://browsehappy.com/\">upgrade your browser</a> to improve your experience and security.</p>\n  <![endif]"
          },
          {
            "nodeType": "TextNode",
            "text": "\n\n  "
          },
          {
            "nodeType": "CommentNode",
            "text": " Add your site or application content here "
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "p",
            "children": [
              {
                "nodeType": "TextNode",
                "text": "Hello world! This is HTML5 Boilerplate."
              }
            ]
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "script",
            "attributes": {
              "src": "\"js/vendor/modernizr-3.7.1.min.js\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "script",
            "attributes": {
              "src": "\"https://code.jquery.com/jquery-3.4.1.min.js\"",
              "integrity": "\"sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=\"",
              "crossorigin": "\"anonymous\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "script",
            "children": [
              {
                "nodeType": "TextNode",
                "text": "window.jQuery || document.write('<script src=\"js/vendor/jquery-3.4.1.min.js\"><\\/script>')"
              }
            ]
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "script",
            "attributes": {
              "src": "\"js/plugins.js\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "script",
            "attributes": {
              "src": "\"js/main.js\""
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n\n  "
          },
          {
            "nodeType": "CommentNode",
            "text": " Google Analytics: change UA-XXXXX-Y to be your site's ID. "
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "script",
            "children": [
              {
                "nodeType": "TextNode",
                "text": "\n    window.ga = function () { ga.q.push(arguments) }; ga.q = []; ga.l = +new Date;\n    ga('create', 'UA-XXXXX-Y', 'auto'); ga('set','transport','beacon'); ga('send', 'pageview')\n  "
              }
            ]
          },
          {
            "nodeType": "TextNode",
            "text": "\n  "
          },
          {
            "nodeType": "ElementNode",
            "tag": "script",
            "attributes": {
              "src": "\"https://www.google-analytics.com/analytics.js\"",
              "async": null
            }
          },
          {
            "nodeType": "TextNode",
            "text": "\n"
          }
        ]
      },
      {
        "nodeType": "TextNode",
        "text": "\n\n"
      }
    ]
  }
]
	expect(adjustHtmlDocument(htmlDocument && htmlDocument.children)).toEqual(adjustExpectedTree(expectedTree))
})