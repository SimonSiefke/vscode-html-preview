import {createParser} from './parse'
import {domdiff} from './diff.js'

function adjustEdits(edits){
  for(const edit of edits){
    delete edit.payload.id
    delete edit.payload.index
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

test(`basic text insertion`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1><p>ok</p></h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>hello<p>ok</p></h1>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 0,
      "text": "hello"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "hello"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`basic element insertion`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1><p>ok</p></h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1><p>ok</p><p>ok</p></h1>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 0,
      "text": "<p>ok</p>"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "p"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "ok"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`basic text replace`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>b</h1>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 1,
      "text": "b"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`basic text addition`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>aaa</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>aaabbb</h1>`, [
    {
      "rangeOffset": 7,
      "rangeLength": 0,
      "text": "bbb"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "aaabbb"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`element addition at the end`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><h1>b</h1>`, [
    {
      "rangeOffset": 10,
      "rangeLength": 0,
      "text": "<h1>b</h1>"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
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
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`element addition at the start`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>b</h1><h1>a</h1>`, [
    {
      "rangeOffset": 0,
      "rangeLength": 0,
      "text": "<h1>b</h1>"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
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
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`element addition in the middle`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><h1>b</h1><h1>c</h1>`, [
    {
      "rangeOffset": 7,
      "rangeLength": 0,
      "text": "<h1>b</h1>"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
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
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`text insertion in nested html`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<div>
  <img src="https://source.unsplash.com/random" alt="random image">
  <p>nested <strong>text</strong></p>
</div>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<div>
  <img src="https://source.unsplash.com/random" alt="random image">
  <p>nested <strong>text</strong>!!!</p>
</div>`, [
    {
      "rangeOffset": 109,
      "rangeLength": 0,
      "text": "!!!"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "!!!"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`whitespace insertion at start tag`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>hello world</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 >hello world</h1>`, [
    {
      "rangeOffset": 3,
      "rangeLength": 0,
      "text": " "
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = []
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insertion of attribute with value`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1 >hello world</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 class="big">hello world</h1>`, [
    {
      "rangeOffset": 3,
      "rangeLength": 0,
      "text": "class=\"big\""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "attributeAdd",
      "payload": {
        "attribute": "class",
        "value": "\"big\""
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insertion of attribute without value`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1 >hello world</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 class>hello world</h1>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 0,
      "text": "class"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "attributeAdd",
      "payload": {
        "attribute": "class",
        "value": null
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insertion of multiple elements and text nodes`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<form>
  First name:<br>
  <input type="text" name="firstName"><br>
</form>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<form>
  First name:<br>
  <input type="text" name="firstName"><br>
  Last name:<br>
  <input type="text" name="lastName"><br>
</form>`, [
    {
      "rangeOffset": 69,
      "rangeLength": 0,
      "text": "Last name:<br>\n  <input type=\"text\" name=\"lastName\"><br>"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "\n  Last name:"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "br"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "\n  "
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "input",
        "attributes": {
          "name": "\"lastName\"",
          "type": "\"text\""
        }
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "ElementNode",
        "tag": "br"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "\n"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`attribute name change`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1 c>hello world</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 class>hello world</h1>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 0,
      "text": "lass"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "attributeAdd",
      "payload": {
        "attribute": "class",
        "value": null
      }
    },
    {
      "command": "attributeDelete",
      "payload": {
        "attribute": "c"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`attribute value insertion at end`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1 class="big">hello world</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 class="bigger">hello world</h1>`, [
    {
      "rangeOffset": 14,
      "rangeLength": 0,
      "text": "ger"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "attributeChange",
      "payload": {
        "attribute": "class",
        "value": "\"bigger\""
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`attribute value replacement`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1 class="big">hello world</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 class="small">hello world</h1>`, [
    {
      "rangeOffset": 11,
      "rangeLength": 3,
      "text": "small"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "attributeChange",
      "payload": {
        "attribute": "class",
        "value": "\"small\""
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`replace text with element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`h1`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1></h1>`, [
    {
      "rangeOffset": 0,
      "rangeLength": 2,
      "text": "<h1></h1>"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
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
})

test(`basic replace text #1`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>b</h1>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 1,
      "text": "b"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`basic replace text #2`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>aa</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>b</h1>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 1,
      "text": "b"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`replace element with text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>hello world</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`hello world`, [
    {
      "rangeOffset": 0,
      "rangeLength": 20,
      "text": "hello world"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "hello world"
      }
    },
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`replace text inside element with attributes`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1 style="background:orange">a</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 style="background:orange">b</h1>`, [
    {
      "rangeOffset": 30,
      "rangeLength": 1,
      "text": "b"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`replace element with text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>hello world</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`hello world`, [
    {
      "rangeOffset": 0,
      "rangeLength": 20,
      "text": "hello world"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "hello world"
      }
    },
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`replace text after element node`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <h1>hello world</h1>
</body>
</html>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <h1>hello world</h1>
  
</body>
</html>`, [
    {
      "rangeOffset": 257,
      "rangeLength": 0,
      "text": "\n  "
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "\n  \n"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})