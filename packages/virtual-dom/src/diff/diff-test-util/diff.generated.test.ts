import { domdiff } from '../diff'
import { createParser } from '../../parse/parse'

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

test(`attribute delete #1`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1 class></h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 ></h1>`, [
    {
      "rangeOffset": 4,
      "rangeLength": 5,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "attributeDelete",
      "payload": {
        "attribute": "class"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`attribute change #1`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1 class></h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 class="green"></h1>`, [
    {
      "rangeOffset": 9,
      "rangeLength": 0,
      "text": "=\"green\""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "attributeChange",
      "payload": {
        "attribute": "class",
        "value": "\"green\""
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`attribute change #2`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1 class="gre"></h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 class="green"></h1>`, [
    {
      "rangeOffset": 14,
      "rangeLength": 0,
      "text": "en"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "attributeChange",
      "payload": {
        "attribute": "class",
        "value": "\"green\""
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

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
      "rangeOffset": 107,
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
      "rangeOffset": 4,
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
      "rangeOffset": 68,
      "rangeLength": 0,
      "text": "  Last name:<br>\n  <input type=\"text\" name=\"lastName\"><br>\n"
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
      "rangeOffset": 5,
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
      "rangeLength": 2,
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

test(`delete first element node`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>hello</h1>
<button>button</button>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<button>button</button>`, [
    {
      "rangeOffset": 0,
      "rangeLength": 15,
      "text": ""
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
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete element before element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>b</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>b</h1>`, [
    {
      "rangeOffset": 0,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete element between elements`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>b</h1><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><h1>c</h1>`, [
    {
      "rangeOffset": 10,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete text before text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`ab`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`b`, [
    {
      "rangeOffset": 0,
      "rangeLength": 1,
      "text": ""
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

test(`delete text after text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`ab`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a`, [
    {
      "rangeOffset": 1,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "a"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

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
      "rangeOffset": 4,
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

test(`attribute name change`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1 c>hello world</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1 class>hello world</h1>`, [
    {
      "rangeOffset": 5,
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

test(`delete first element node`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>hello</h1>
<button>button</button>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<button>button</button>`, [
    {
      "rangeOffset": 0,
      "rangeLength": 15,
      "text": ""
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
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete element before element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>b</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>b</h1>`, [
    {
      "rangeOffset": 0,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete element after element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>b</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1>`, [
    {
      "rangeOffset": 10,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete text before text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`ab`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`b`, [
    {
      "rangeOffset": 0,
      "rangeLength": 1,
      "text": ""
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

test(`delete text after text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`ab`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a`, [
    {
      "rangeOffset": 1,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "a"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete text before element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<h1>b</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>b</h1>`, [
    {
      "rangeOffset": 0,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete text between elements`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1>b<h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><h1>c</h1>`, [
    {
      "rangeOffset": 10,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete text after element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1>b`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1>`, [
    {
      "rangeOffset": 10,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete element before text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1>b`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`b`, [
    {
      "rangeOffset": 0,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete element after text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<h1>b</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a`, [
    {
      "rangeOffset": 1,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 000 - delete text between text and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`abc`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`ac`, [
    {
      "rangeOffset": 1,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "ac"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 001 - delete text between text and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`ab<h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<h1>c</h1>`, [
    {
      "rangeOffset": 1,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "a"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 002 - delete text between text and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`ab<!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<!--c-->`, [
    {
      "rangeOffset": 1,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "a"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 011 - delete text between element and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1>b<h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><h1>c</h1>`, [
    {
      "rangeOffset": 10,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 020 - delete text between comment and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a-->bc`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a-->c`, [
    {
      "rangeOffset": 8,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "c"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 021 - delete text between comment and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a-->b<h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a--><h1>c</h1>`, [
    {
      "rangeOffset": 8,
      "rangeLength": 1,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 100 - delete element between text and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<h1>b</h1>c`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`ac`, [
    {
      "rangeOffset": 1,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "ac"
      }
    },
    {
      "command": "elementDelete",
      "payload": {}
    },
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 101 - delete element between text and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<h1>b</h1><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<h1>c</h1>`, [
    {
      "rangeOffset": 1,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 102 - delete element between text and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<h1>b</h1><!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<!--c-->`, [
    {
      "rangeOffset": 1,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 110 - delete element between element and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>b</h1>c`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1>c`, [
    {
      "rangeOffset": 10,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 111 - delete element between element and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>b</h1><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><h1>c</h1>`, [
    {
      "rangeOffset": 10,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 112 - delete element between element and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>b</h1><!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><!--c-->`, [
    {
      "rangeOffset": 10,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 120 - delete element between comment and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a--><h1>b</h1>c`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a-->c`, [
    {
      "rangeOffset": 8,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 121 - delete element between comment and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a--><h1>b</h1><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a--><h1>c</h1>`, [
    {
      "rangeOffset": 8,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 122 - delete element between comment and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a--><h1>b</h1><!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a--><!--c-->`, [
    {
      "rangeOffset": 8,
      "rangeLength": 10,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 200 - delete comment between text and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<!--b-->c`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`ac`, [
    {
      "rangeOffset": 1,
      "rangeLength": 8,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "ac"
      }
    },
    {
      "command": "elementDelete",
      "payload": {}
    },
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 201 - delete comment between text and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<!--b--><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<h1>c</h1>`, [
    {
      "rangeOffset": 1,
      "rangeLength": 8,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 202 - delete comment between text and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<!--b--><!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<!--c-->`, [
    {
      "rangeOffset": 1,
      "rangeLength": 8,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 211 - delete comment between element and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><!--b--><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><h1>c</h1>`, [
    {
      "rangeOffset": 10,
      "rangeLength": 8,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 221 - delete comment between comment and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a--><!--b--><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a--><h1>c</h1>`, [
    {
      "rangeOffset": 8,
      "rangeLength": 8,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`delete 222 - delete comment between comment and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a--><!--b--><!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a--><!--c-->`, [
    {
      "rangeOffset": 8,
      "rangeLength": 8,
      "text": ""
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementDelete",
      "payload": {}
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 000 - insert text between text and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`ac`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`abc`, [
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "b"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "abc"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 001 - insert text between text and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`ab<h1>c</h1>`, [
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "b"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "ab"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 002 - insert text between text and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`ab<!--c-->`, [
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "b"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "ab"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 011 - insert text between element and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1>b<h1>c</h1>`, [
    {
      "rangeOffset": 10,
      "rangeLength": 0,
      "text": "b"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
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

test(`insert 020 - insert text between comment and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a-->c`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a-->bc`, [
    {
      "rangeOffset": 8,
      "rangeLength": 0,
      "text": "b"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "bc"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 021 - insert text between comment and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a--><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a-->b<h1>c</h1>`, [
    {
      "rangeOffset": 8,
      "rangeLength": 0,
      "text": "b"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
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

test(`insert 100 - insert element between text and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`ac`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<h1>b</h1>c`, [
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "<h1>b</h1>"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "a"
      }
    },
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
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "c"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 101 - insert element between text and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<h1>b</h1><h1>c</h1>`, [
    {
      "rangeOffset": 1,
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

test(`insert 102 - insert element between text and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<h1>b</h1><!--c-->`, [
    {
      "rangeOffset": 1,
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

test(`insert 110 - insert element between element and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1>c`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><h1>b</h1>c`, [
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

test(`insert 111 - insert element between element and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><h1>b</h1><h1>c</h1>`, [
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

test(`insert 112 - insert element between element and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><h1>b</h1><!--c-->`, [
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

test(`insert 120 - insert element between comment and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a-->c`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a--><h1>b</h1>c`, [
    {
      "rangeOffset": 8,
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

test(`insert 121 - insert element between comment and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a--><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a--><h1>b</h1><h1>c</h1>`, [
    {
      "rangeOffset": 8,
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

test(`insert 122 - insert element between comment and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a--><!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a--><h1>b</h1><!--c-->`, [
    {
      "rangeOffset": 8,
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

test(`insert 200 - insert comment between text and text`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`ac`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<!--b-->c`, [
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "<!--b-->"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "a"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "CommentNode",
        "text": "b"
      }
    },
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "TextNode",
        "text": "c"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 201 - insert comment between text and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<!--b--><h1>c</h1>`, [
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "<!--b-->"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "CommentNode",
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 202 - insert comment between text and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`a<!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`a<!--b--><!--c-->`, [
    {
      "rangeOffset": 1,
      "rangeLength": 0,
      "text": "<!--b-->"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "CommentNode",
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 211 - insert comment between element and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><!--b--><h1>c</h1>`, [
    {
      "rangeOffset": 10,
      "rangeLength": 0,
      "text": "<!--b-->"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "CommentNode",
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 212 - insert comment between element and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<h1>a</h1><!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<h1>a</h1><!--b--><!--c-->`, [
    {
      "rangeOffset": 10,
      "rangeLength": 0,
      "text": "<!--b-->"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "CommentNode",
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 221 - insert comment between comment and element`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a--><h1>c</h1>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a--><!--b--><h1>c</h1>`, [
    {
      "rangeOffset": 8,
      "rangeLength": 0,
      "text": "<!--b-->"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "CommentNode",
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`insert 222 - insert comment between comment and comment`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<!--a--><!--c-->`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<!--a--><!--b--><!--c-->`, [
    {
      "rangeOffset": 8,
      "rangeLength": 0,
      "text": "<!--b-->"
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "elementInsert",
      "payload": {
        "nodeType": "CommentNode",
        "text": "b"
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})

test(`test because of bug #1`, () => {
  const parser = createParser()
  const previousDom = parser.parse(`<html>

<head>
  <title>Document</title>
  <style>
  </style>
</head>

<body>

</body>

</html>`)
  const oldNodeMap = parser.nodeMap
  const nextDom = parser.edit(`<html>

<head>
  <title>Document</title>
  <style>
    </style>
</head>

<body>

</body>

</html>`, [
    {
      "rangeOffset": 53,
      "rangeLength": 0,
      "text": "  "
    }
  ])
  const newNodeMap = parser.nodeMap
  const edits = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap})
  const expectedEdits = [
    {
      "command": "textReplace",
      "payload": {
        "text": "\n    "
      }
    }
  ]
  expect(adjustEdits(edits)).toEqual(adjustExpectedEdits(expectedEdits))
})