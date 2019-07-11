/* Unittests: HTML Instrumentation */

// Load dependent modules
const HTMLInstrumentation = require('../src/HTMLInstrumentation');
const HTMLSimpleDOM = require('../src/HTMLSimpleDom/HTMLSimpleDOM');
// let RemoteFunctions = require('text!LiveDevelopment/Agents/RemoteFunctions.js');
// const SpecRunnerUtils = require('spec/SpecRunnerUtils');
// const WellFormedDoc = require('text!spec/HTMLInstrumentation-test-files/wellformed.html');
// const NotWellFormedDoc = require('text!spec/HTMLInstrumentation-test-files/omitEndTags.html');
// const InvalidHTMLDoc = require('text!spec/HTMLInstrumentation-test-files/invalidHTML.html');

// RemoteFunctions = eval('(' + RemoteFunctions.trim() + ')()');

let editor;
let instrumentedHTML;
let elementCount;
let elementIds = {};

function createBlankDOM() {
	// This creates a DOM for a blank document that we can clone when we want to simulate
	// starting from an empty document (which, in the browser, includes implied html/head/body
	// tags). We have to also strip the tagIDs from this DOM since they won't appear in the
	// browser in this case.
	const dom = HTMLSimpleDOM.build('<html><head></head><body></body></html>', true);
	Object.keys(dom.nodeMap).forEach(key => {
		const node = dom.nodeMap[key];
		delete node.tagID;
	});
	dom.nodeMap = {};
	return dom;
}

function removeDescendentsFromNodeMap(nodeMap, node) {
	delete nodeMap[node.tagID];
	if (node.children) {
		node.children.forEach(child => {
			removeDescendentsFromNodeMap(nodeMap, child);
		});
	}
}

const entityParsingNode = window.document.createElement('div');

/**
 * DomFeatures is a prototype object that augments a SimpleDOM object to have more of the
 * features of a real DOM object. It specifically adds the features required for
 * the RemoteFunctions code that applies patches and is not a general DOM implementation.
 *
 * Standard DOM methods below are not documented, but the ones unique to this test harness
 * are.
 */
const domFeatures = Object.create(new HTMLSimpleDOM.SimpleNode(), {
	firstChild: {
		get() {
			return this.children[0];
		}
	},
	lastChild: {
		get() {
			return this.children[this.children.length - 1];
		}
	},
	siblings: {
		get() {
			return this.parent.children;
		}
	},
	nextSibling: {
		get() {
			const {siblings} = this;
			const index = siblings.indexOf(this);
			return siblings[index + 1];
		}
	},
	previousSibling: {
		get() {
			const {siblings} = this;
			const index = siblings.indexOf(this);
			return siblings[index - 1];
		}
	},
	nodeType: {
		get() {
			if (this.children) {
				return Node.ELEMENT_NODE;
			}

			if (this.content) {
				return Node.TEXT_NODE;
			}
		}
	},
	childNodes: {
		get() {
			const {children} = this;
			if (!children.item) {
				children.item = function (index) {
					return children[index];
				};
			}

			return children;
		}
	},

	// At this time, innerHTML and textContent are used for entity parsing
	// only. If that changes, we'll have bigger issues to deal with.
	innerHTML: {
		set(text) {
			entityParsingNode.innerHTML = text;
		},
		get() {
			return entityParsingNode.innerHTML;
		}
	},
	textContent: {
		set(text) {
			entityParsingNode.textContent = text;
		},
		get() {
			return entityParsingNode.textContent;
		}
	}
});

$.extend(domFeatures, {
	insertBefore(newElement, referenceElement) {
		if (newElement.parent && newElement.parent !== this) {
			newElement.remove();
		}

		const index = this.children.indexOf(referenceElement);
		if (index === -1) {
			console.error(
				'Unexpected attempt to reference a non-existent element:',
				referenceElement
			);
			console.log(this.children);
		}

		this.children.splice(index, 0, newElement);
		newElement.parent = this;
		newElement.addToNodeMap();
	},
	appendChild(newElement) {
		if (newElement.parent && newElement.parent !== this) {
			newElement.remove();
		}

		this.children.push(newElement);
		newElement.parent = this;
		newElement.addToNodeMap();
	},

	/**
	 * The nodeMap keeps track of the Brackets-assigned tag ID to node object mapping.
	 * This method adds this element to the nodeMap if it has a data-brackets-id
	 * attribute set (something that the client-side applyEdits code will do).
	 */
	addToNodeMap() {
		if (this.attributes && this.attributes['data-brackets-id']) {
			const nodeMap = this.getNodeMap();
			if (nodeMap) {
				nodeMap[this.attributes['data-brackets-id']] = this;
			} else {
				console.error('Unable to get nodeMap from', this);
			}
		}
	},
	remove() {
		if (this.tagID) {
			const nodeMap = this.getNodeMap();
			if (nodeMap) {
				removeDescendentsFromNodeMap(nodeMap, this);
			}
		}

		const {siblings} = this;
		const index = siblings.indexOf(this);
		if (index > -1) {
			siblings.splice(index, 1);
			this.parent = null;
		} else {
			console.error('Unexpected attempt to remove (not in siblings)', this);
		}
	},

	/**
	 * Search node by node up the tree until a nodeMap is found. Returns undefined
	 * if no nodeMap is found.
	 */
	getNodeMap() {
		let elem = this;
		let nodeMap;
		while (elem) {
			nodeMap = elem.nodeMap;
			if (nodeMap) {
				break;
			}

			elem = elem.parent;
		}

		return nodeMap;
	},
	setAttribute(key, value) {
		if (key === 'data-brackets-id') {
			this.tagID = value;
			const nodeMap = this.getNodeMap();
			if (nodeMap) {
				nodeMap[key] = this;
			} else {
				console.error('no nodemap found for ', this);
			}
		}

		this.attributes[key] = value;
	},
	removeAttribute(key) {
		delete this.attributes[key];
	},

	returnFailure(other) {
		console.log('TEST FAILURE AT TAG ID ', this.tagID, this, other);
		console.log('Patched: ', HTMLSimpleDOM._dumpDOM(this.parent || this));
		console.log(
			'DOM generated from revised text: ',
			HTMLSimpleDOM._dumpDOM(other.parent || other)
		);
		return false;
	},

	/**
	 * Compares two SimpleDOMs with the expectation that they are exactly the same.
	 */
	compare(other) {
		if (this.children) {
			if (this.tag !== other.tag) {
				expect('Tag ' + this.tag + ' for tagID ' + this.tagID).toEqual(
					other.tag
				);
				return this.returnFailure(other);
			}

			if (this.tagID !== other.tagID) {
				expect('tagID ' + this.tagID).toEqual(other.tagID);
				return this.returnFailure(other);
			}

			delete this.attributes['data-brackets-id'];
			expect(this.attributes).toEqual(other.attributes);

			// Skip implied tags in this (fake browser) DOM. (The editor's DOM
			// should never have implied tags.)
			const myChildren = [];
			this.children.forEach(child => {
				const isImplied =
					(child.tag === 'html' ||
						child.tag === 'head' ||
						child.tag === 'body') &&
					child.tagID === undefined;
				if (!isImplied) {
					myChildren.push(child);
				}
			});

			if (myChildren.length !== other.children.length) {
				expect(
					'tagID ' +
						this.tagID +
						' has ' +
						myChildren.length +
						' unimplied children'
				).toEqual(other.children.length);
				return this.returnFailure(other);
			}

			let i;
			for (i = 0; i < myChildren.length; i++) {
				if (!myChildren[i].compare(other.children[i])) {
					return false;
				}
			}
		} else if (this.content !== other.content) {
			expect(this.content).toEqual(other.content);
			return this.returnFailure(other);
		}

		return true;
	}
});

/**
 * Creates a deep clone of a SimpleDOM tree, adding the domFeatures as it goes
 * along.
 *
 * @param {Object} root root node of the SimpleDOM to clone
 * @return {Object} cloned SimpleDOM with domFeatures applied
 */
function cloneDOM(root) {
	const nodeMap = {};

	// If there's no DOM to clone, then we must be starting from an empty document,
	// so start with a document that already has implied <html>/<head>/<body>, since
	// that's what the browser does.
	if (!root) {
		root = createBlankDOM();
	}

	function doClone(parent, node) {
		const newNode = Object.create(domFeatures);
		newNode.parent = parent;
		if (node.tagID) {
			nodeMap[node.tagID] = newNode;
			newNode.tagID = node.tagID;
		}

		newNode.content = node.content;
		if (node.children) {
			newNode.tag = node.tag;
			newNode.attributes = $.extend({}, node.attributes);
			newNode.children = node.children.map(child => {
				return doClone(newNode, child);
			});
		} else {
			newNode.content = node.content;
		}

		return newNode;
	}

	const newRoot = doClone(null, root);
	newRoot.nodeMap = nodeMap;
	return newRoot;
}

/**
 * The RemoteFunctions code that applies edits to the DOM expects only a few things to
 * be present on the document object. This FakeDocument bridges the gap between a
 * SimpleDOM and real DOM for the purposes of applying edits.
 *
 * @param {Object} dom The DOM we're wrapping with this document.
 */
const FakeDocument = function (dom) {
	const self = this;
	this.dom = dom;
	this.nodeMap = dom.nodeMap;

	// Walk the DOM looking for html/head/body tags. We can't use the nodeMap for this
	// because it might be nulled out in the cases where we're simulating the browser
	// creating implicit html/head/body tags.
	function walk(node) {
		if (node.tag === 'html') {
			self.documentElement = node;
		} else if (node.tag === 'head' || node.tag === 'body') {
			self[node.tag] = node;
		}

		if (node.children) {
			node.children.forEach(walk);
		}
	}

	walk(dom);
};

// The DOM edit code only performs this kind of query
const bracketsIdQuery = /\[data-brackets-id='(\d+)'\]/;

FakeDocument.prototype = {
	createTextNode(content) {
		const text = Object.create(domFeatures);
		text.content = content;
		return text;
	},
	createElement(tag) {
		const el = Object.create(domFeatures);
		el.tag = tag;
		el.attributes = {};
		el.children = [];
		el.nodeMap = this.nodeMap;
		return el;
	},
	querySelectorAll(query) {
		const match = bracketsIdQuery.exec(query);
		expect(match).toBeTruthy();
		if (!match) {
			return [];
		}

		const id = match[1];

		function walk(node) {
			if (String(node.tagID) === id) {
				return node;
			}

			if (node.children) {
				let i; let result;
				for (i = 0; i < node.children.length; i++) {
					result = walk(node.children[i]);
					if (result) {
						return result;
					}
				}
			}
		}

		const element = walk(this.dom);

		if (element) {
			return [element];
		}
	}
};

describe('HTML Instrumentation', () => {
	function getIdToTagMap(instrumentedHTML, map) {
		let count = 0;

		const elementIdRegEx = /<(\w+?)\s+(?:[^<]*?\s)*?data-brackets-id='(\S+?)'/gi;
		let match;
		let tagID;
		let tagName;

		do {
			match = elementIdRegEx.exec(instrumentedHTML);
			if (match) {
				tagID = match[2];
				tagName = match[1];

				// Verify that the newly found ID is unique.
				expect(map[tagID]).toBeUndefined();

				map[tagID] = tagName.toLowerCase();
				count++;
			}
		} while (match);

		return count;
	}

	function checkTagIdAtPos(pos, expectedTag) {
		const tagID = HTMLInstrumentation._getTagIDAtDocumentPos(editor, pos);
		if (!expectedTag) {
			expect(tagID).toBe(-1);
		} else {
			expect(elementIds[tagID]).toBe(expectedTag);
		}
	}

	function verifyMarksCreated() {
		const cm = editor._codeMirror;
		const marks = cm.getAllMarks();

		expect(marks.length).toBeGreaterThan(0);
	}

	describe('interaction with document and editor', () => {
		beforeEach(() => {
			HTMLInstrumentation._resetCache();

			runs(() => {
				editor = SpecRunnerUtils.createMockEditor(WellFormedDoc, 'html').editor;
				expect(editor).toBeTruthy();
			});
		});

		it('should properly regenerate marks when instrumented HTML is re-requested after document is edited', () => {
			runs(() => {
				let instrumented = HTMLInstrumentation.generateInstrumentedHTML(editor);
				getIdToTagMap(instrumented, elementIds);
				checkTagIdAtPos({line: 12, ch: 1}, 'h1');

				editor.document.replaceRange('123456789012345678901234567890', {
					line: 12,
					ch: 0
				});
				instrumented = HTMLInstrumentation.generateInstrumentedHTML(editor);
				elementIds = {};
				getIdToTagMap(instrumented, elementIds);
				checkTagIdAtPos({line: 12, ch: 1}, 'body');
				checkTagIdAtPos({line: 12, ch: 31}, 'h1');

				const lines = instrumented.split('\n');
				expect(lines[12]).toMatch(
					/^123456789012345678901234567890<h1 data-brackets-id='[0-9]+'>GETTING STARTED WITH BRACKETS<\/h1>$/
				);
			});
		});
	});

	describe('HTML Instrumentation in wellformed HTML', () => {
		beforeEach(() => {
			runs(() => {
				editor = SpecRunnerUtils.createMockEditor(WellFormedDoc, 'html').editor;
				expect(editor).toBeTruthy();

				spyOn(editor.document, 'getText').andCallThrough();
				instrumentedHTML = HTMLInstrumentation.generateInstrumentedHTML(editor);
				elementCount = getIdToTagMap(instrumentedHTML, elementIds);

				if (elementCount) {
					HTMLInstrumentation._markText(editor);
					verifyMarksCreated();
				}
			});
		});

		afterEach(() => {
			SpecRunnerUtils.destroyMockEditor(editor.document);
			editor = null;
			instrumentedHTML = '';
			elementCount = 0;
			elementIds = {};
		});

		it('should instrument all start tags except some empty tags', () => {
			runs(() => {
				expect(elementCount).toEqual(15);
			});
		});

		it('should have created cache and never call document.getText() again', () => {
			runs(() => {
				// ScanDocument call here is to test the cache.
				// HTMLInstrumentation.generateInstrumentedHTML call in "beforeEach"
				// in turn calls scanDocument. Each function calls document.getText once
				// and hence we've already had 2 calls from "beforeEach", but the following
				// call should not call it again.
				HTMLInstrumentation.scanDocument(editor.document);
				expect(editor.document.getText.callCount).toBe(2);
			});
		});

		it('should have recreated cache when document timestamp is different', () => {
			runs(() => {
				// Update document timestamp with current time.
				editor.document.diskTimestamp = new Date();

				// This is an intentional repeat call to recreate the cache.
				HTMLInstrumentation.scanDocument(editor.document);

				// 2 calls from generateInstrumentedHTML call and one call
				// from above scanDocument call. so total is 3.
				expect(editor.document.getText.callCount).toBe(3);
			});
		});

		it('should get \'img\' tag for cursor positions inside img tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 37, ch: 4}, 'img'); // Before <img
				checkTagIdAtPos({line: 37, ch: 95}, 'img'); // After />
				checkTagIdAtPos({line: 37, ch: 65}, 'img'); // Inside src attribute value
			});
		});

		it('should get the parent \'a\' tag for cursor positions between \'img\' and its parent \'a\' tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 37, ch: 1}, 'a'); // Before "   <img"
				checkTagIdAtPos({line: 38, ch: 0}, 'a'); // Before </a>
			});
		});

		it('No tag at cursor positions outside of the \'html\' tag', () => {
			runs(() => {
				checkTagIdAtPos({line: 0, ch: 4}, ''); // Inside 'doctype' tag
				checkTagIdAtPos({line: 41, ch: 0}, ''); // After </html>
			});
		});

		it('Should get parent tag (body) for all cursor positions inside an html comment', () => {
			runs(() => {
				checkTagIdAtPos({line: 15, ch: 1}, 'body'); // Cursor between < and ! in the comment start
				checkTagIdAtPos({line: 16, ch: 15}, 'body');
				checkTagIdAtPos({line: 17, ch: 3}, 'body'); // Cursor after -->
			});
		});

		it('should get \'meta/link\' tag for cursor positions in meta/link tags, not \'head\' tag', () => {
			runs(() => {
				checkTagIdAtPos({line: 5, ch: 64}, 'meta');
				checkTagIdAtPos({line: 8, ch: 12}, 'link');
			});
		});

		it('Should get \'title\' tag at cursor positions (either in the content or begin/end tag)', () => {
			runs(() => {
				checkTagIdAtPos({line: 6, ch: 11}, 'title'); // Inside the begin tag
				checkTagIdAtPos({line: 6, ch: 30}, 'title'); // In the content
				checkTagIdAtPos({line: 6, ch: 50}, 'title'); // Inside the end tag
			});
		});

		it('Should get \'h2\' tag at cursor positions (either in the content or begin or end tag)', () => {
			runs(() => {
				checkTagIdAtPos({line: 13, ch: 1}, 'h2'); // Inside the begin tag
				checkTagIdAtPos({line: 13, ch: 20}, 'h2'); // In the content
				checkTagIdAtPos({line: 13, ch: 27}, 'h2'); // Inside the end tag
			});
		});
	});

	describe('HTML Instrumentation in valid but not wellformed HTML', () => {
		beforeEach(() => {
			runs(() => {
				editor = SpecRunnerUtils.createMockEditor(NotWellFormedDoc, 'html')
					.editor;
				expect(editor).toBeTruthy();

				instrumentedHTML = HTMLInstrumentation.generateInstrumentedHTML(editor);
				elementCount = getIdToTagMap(instrumentedHTML, elementIds);

				if (elementCount) {
					HTMLInstrumentation._markText(editor);
					verifyMarksCreated();
				}
			});
		});

		afterEach(() => {
			SpecRunnerUtils.destroyMockEditor(editor.document);
			editor = null;
			instrumentedHTML = '';
			elementCount = 0;
			elementIds = {};
		});

		it('should instrument all start tags except some empty tags', () => {
			runs(() => {
				expect(elementCount).toEqual(43);
			});
		});

		it('should get \'p\' tag for cursor positions before the succeding start tag of an unclosed \'p\' tag', () => {
			runs(() => {
				checkTagIdAtPos({line: 8, ch: 36}, 'p'); // At the end of the line that has p start tag
				checkTagIdAtPos({line: 8, ch: 2}, 'p'); // At the beginning of the <p>
				checkTagIdAtPos({line: 8, ch: 4}, 'p'); // Inside <p> tag
				checkTagIdAtPos({line: 8, ch: 5}, 'p'); // After <p> tag
				checkTagIdAtPos({line: 9, ch: 0}, 'p'); // Before <h1> tag, but considered to be the end of 'p' tag
			});
		});

		it('should get \'h1\' tag for cursor positions inside \'h1\' that is following an unclosed \'p\' tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 9, ch: 20}, 'h1'); // Inside text content of h1 tag
				checkTagIdAtPos({line: 9, ch: 52}, 'h1'); // Inside </h1>
			});
		});

		it('should get \'wbr\' tag for cursor positions inside <wbr>, not its parent \'h1\' tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 9, ch: 10}, 'wbr'); // Inside <wbr> that is in h1 content
			});
		});

		it('should get \'li\' tag for cursor positions inside the content of an unclosed \'li\' tag', () => {
			runs(() => {
				checkTagIdAtPos({line: 12, ch: 12}, 'li'); // Inside first list item
				checkTagIdAtPos({line: 14, ch: 12}, 'li'); // Inside third list item
				checkTagIdAtPos({line: 15, ch: 0}, 'li'); // Before </ul> tag that follows an unclosed 'li'
			});
		});

		it('should get \'br\' tag for cursor positions inside <br>, not its parent \'li\' tag', () => {
			runs(() => {
				checkTagIdAtPos({line: 13, ch: 22}, 'br'); // Inside the <br> tag of the second list item
			});
		});

		it('should get \'ul\' tag for cursor positions within \'ul\' but outside of any unclosed \'li\'.', () => {
			runs(() => {
				checkTagIdAtPos({line: 12, ch: 0}, 'ul'); // Before first '<li>' tag
				checkTagIdAtPos({line: 15, ch: 8}, 'ul'); // Inside </ul>
			});
		});

		it('should get \'table\' tag for cursor positions that are not in any unclosed child tags', () => {
			runs(() => {
				checkTagIdAtPos({line: 17, ch: 17}, 'table'); // Inside an attribute of table tag
				checkTagIdAtPos({line: 32, ch: 6}, 'table'); // Inside </table> tag
			});
		});

		it('should get \'tr\' tag for cursor positions between child tags', () => {
			runs(() => {
				checkTagIdAtPos({line: 21, ch: 0}, 'tr'); // After a 'th' but before the start tag of another one
			});
		});

		it('should get \'input\' tag for cursor positions inside one of the \'input\' tags.', () => {
			runs(() => {
				checkTagIdAtPos({line: 34, ch: 61}, 'input'); // At the end of first input tag
				checkTagIdAtPos({line: 35, ch: 4}, 'input'); // At the first position of the 2nd input tag
			});
		});
		it('should get \'option\' tag for cursor positions in any unclosed \'option\' tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 40, ch: 0}, 'option'); // Before second '<option>' tag
				checkTagIdAtPos({line: 41, ch: 28}, 'option'); // After third option tag that is unclosed
			});
		});

		it('should NOT get \'option\' tag for cursor positions in the parent tags of an unclosed \'option\'.', () => {
			runs(() => {
				checkTagIdAtPos({line: 42, ch: 5}, 'select'); // Inside '</select>' tag
				checkTagIdAtPos({line: 43, ch: 5}, 'form'); // Inside '</form>' tag
			});
		});

		it('should get \'label\' tag for cursor positions in the \'label\' tag or its content.', () => {
			runs(() => {
				checkTagIdAtPos({line: 37, ch: 17}, 'label'); // In the attribute of 'label' tag
				checkTagIdAtPos({line: 37, ch: 49}, 'label'); // In the text content
				checkTagIdAtPos({line: 37, ch: 55}, 'label'); // In the end 'label' tag
			});
		});

		it('should get \'form\' tag for cursor positions NOT in any form element.', () => {
			runs(() => {
				checkTagIdAtPos({line: 35, ch: 0}, 'form'); // Between two input tags
				checkTagIdAtPos({line: 43, ch: 2}, 'form'); // Before </form> tag
			});
		});

		it('should get \'hr\' tag for cursor positions in <hr> tag, not its parent <form> tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 36, ch: 6}, 'hr'); // Inside <hr>
			});
		});

		it('should get \'script\' tag for cursor positions anywhere inside the tag including CDATA.', () => {
			runs(() => {
				checkTagIdAtPos({line: 46, ch: 6}, 'script'); // Before '<' of CDATA
				checkTagIdAtPos({line: 48, ch: 7}, 'script'); // Right before '>' of CDATA
				checkTagIdAtPos({line: 45, ch: 18}, 'script'); // Inside an attribute value of 'script' tag
				checkTagIdAtPos({line: 47, ch: 20}, 'script'); // Before '<' of a literal string
				checkTagIdAtPos({line: 49, ch: 9}, 'script'); // Inside 'script' end tag
			});
		});

		it('should get \'footer\' tag that is explicitly using all uppercase tag names.', () => {
			runs(() => {
				checkTagIdAtPos({line: 50, ch: 3}, 'footer'); // In <FOOTER>
				checkTagIdAtPos({line: 50, ch: 20}, 'footer'); // In the text content
				checkTagIdAtPos({line: 50, ch: 30}, 'footer'); // In </FOOTER>
			});
		});

		it('should get \'body\' for text after an h1 that closed a previous uncleosd paragraph', () => {
			runs(() => {
				checkTagIdAtPos({line: 53, ch: 2}, 'body'); // In the text content after the h1
			});
		});
	});

	describe('HTML Instrumentation in an HTML page with some invalid markups', () => {
		beforeEach(() => {
			runs(() => {
				editor = SpecRunnerUtils.createMockEditor(InvalidHTMLDoc, 'html').editor;
				expect(editor).toBeTruthy();

				instrumentedHTML = HTMLInstrumentation.generateInstrumentedHTML(editor);
				elementCount = getIdToTagMap(instrumentedHTML, elementIds);

				if (elementCount) {
					HTMLInstrumentation._markText(editor);
					verifyMarksCreated();
				}
			});
		});

		afterEach(() => {
			SpecRunnerUtils.destroyMockEditor(editor.document);
			editor = null;
			instrumentedHTML = '';
			elementCount = 0;
			elementIds = {};
		});

		it('should instrument all start tags except some empty tags', () => {
			runs(() => {
				expect(elementCount).toEqual(39);
			});
		});

		it('should get \'script\' tag for cursor positions anywhere inside the tag including CDATA.', () => {
			runs(() => {
				checkTagIdAtPos({line: 6, ch: 11}, 'script'); // Before '<' of CDATA
				checkTagIdAtPos({line: 8, ch: 12}, 'script'); // Right before '>' of CDATA
				checkTagIdAtPos({line: 5, ch: 33}, 'script'); // Inside an attribute value of 'script' tag
				checkTagIdAtPos({line: 7, ch: 25}, 'script'); // After '<' of a literal string
				checkTagIdAtPos({line: 9, ch: 9}, 'script'); // Inside 'script' end tag
			});
		});

		it('should get \'style\' tag for cursor positions anywhere inside the tag including CDATA.', () => {
			runs(() => {
				checkTagIdAtPos({line: 11, ch: 11}, 'style'); // Before '<' of CDATA
				checkTagIdAtPos({line: 13, ch: 12}, 'style'); // Right before '>' of CDATA
				checkTagIdAtPos({line: 10, ch: 26}, 'style'); // Before '>' of the 'style' tag
				checkTagIdAtPos({line: 12, ch: 33}, 'style'); // Inside a property value
				checkTagIdAtPos({line: 14, ch: 9}, 'style'); // Inside 'style' end tag
			});
		});

		it('should get \'i\' tag for cursor position before </b>.', () => {
			runs(() => {
				checkTagIdAtPos({line: 18, ch: 20}, 'i'); // After <i> and before </b>
				checkTagIdAtPos({line: 18, ch: 28}, 'i'); // Immediately before </b>
			});
		});

		it('should get \'p\' tag after </b> because the </b> closed the overlapping <i>.', () => {
			runs(() => {
				checkTagIdAtPos({line: 18, ch: 34}, 'p'); // Between </b> and </i>
			});
		});

		it('should get \'body\' tag in a paragraph that has missing <p> tag, but has </p>', () => {
			runs(() => {
				checkTagIdAtPos({line: 19, ch: 15}, 'body'); // Before </p>
				checkTagIdAtPos({line: 19, ch: 38}, 'body'); // Inside </p>
			});
		});

		it('should get \'hr\' tag for cursor positions in any forms of <hr> tag', () => {
			runs(() => {
				checkTagIdAtPos({line: 48, ch: 7}, 'hr'); // Inside <hr>
				checkTagIdAtPos({line: 50, ch: 9}, 'hr'); // Inside <hr />
			});
		});

		it('should get \'h2\' tag for cursor positions between <wbr> and its invalide end tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 20, ch: 35}, 'h2'); // In the text between <wbr> and </wbr>
			});
		});

		it('should get \'wbr\' tag for cursor positions inside <wbr>, not its parent <h2> tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 20, ch: 30}, 'wbr'); // Inside <wbr>
			});
		});

		it('should get \'h2\' tag for cursor positions inside invalid </wbr> tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 20, ch: 40}, 'h2'); // Inside </wbr>
			});
		});

		it('should get \'name\' tag for cursor positions before <name> and </name>.', () => {
			runs(() => {
				checkTagIdAtPos({line: 21, ch: 8}, 'name'); // Inside <name>
				checkTagIdAtPos({line: 21, ch: 12}, 'name'); // Inside content of 'mame' tag
				checkTagIdAtPos({line: 21, ch: 22}, 'name'); // Inside </name>
			});
		});

		it('should get \'th\' tag for cursor positions in any \'th\' and their text contents.', () => {
			runs(() => {
				checkTagIdAtPos({line: 24, ch: 16}, 'th'); // Inside first th content
				checkTagIdAtPos({line: 25, ch: 21}, 'th'); // Inside second </th>
				checkTagIdAtPos({line: 26, ch: 17}, 'th'); // At the end of third th content
				checkTagIdAtPos({line: 27, ch: 0}, 'th'); // Before the next <tr>
			});
		});

		it('should get \'input\' tag for cursor positions in any input tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 39, ch: 57}, 'input'); // Inside value attribute that has <
				checkTagIdAtPos({line: 39, ch: 64}, 'input'); // Between / and > of input tag
				checkTagIdAtPos({line: 40, ch: 61}, 'input'); // Inside value attribute that has >
				checkTagIdAtPos({line: 40, ch: 63}, 'input'); // Right before the invalid </input>
			});
		});

		it('should get \'form\' tag for cursor positions in any invalid end tag inside the form.', () => {
			runs(() => {
				checkTagIdAtPos({line: 40, ch: 65}, 'form'); // Inside </input>
			});
		});

		it('should get \'p\' tag for cursor positions inside an unclosed paragraph nested in a link.', () => {
			runs(() => {
				checkTagIdAtPos({line: 49, ch: 71}, 'p'); // Before </a> but after <p> tag
			});
		});

		it('should get \'a\' tag for cursor positions not in the unclosed \'p\' child tag.', () => {
			runs(() => {
				checkTagIdAtPos({line: 49, ch: 32}, 'a'); // Inside </a>
				checkTagIdAtPos({line: 49, ch: 72}, 'a'); // Inside </a>
			});
		});
	});

	// Log useful information when debugging a test.
	function debuggingDump(result, previousDOM) {
		console.log('Old DOM', HTMLSimpleDOM._dumpDOM(previousDOM));
		console.log('New DOM', HTMLSimpleDOM._dumpDOM(result.dom));
		console.log('Edits', JSON.stringify(result.edits, null, 2));
	}

	// Workaround for JSHint to not complain about the unused function
	void debuggingDump;

	describe('HTML Instrumentation in dirty files', () => {
		let changeList; let offsets;

		function setupEditor(docText, useOffsets) {
			runs(() => {
				if (useOffsets) {
					const result = SpecRunnerUtils.parseOffsetsFromText(docText);
					docText = result.text;
					offsets = result.offsets;
				}

				editor = SpecRunnerUtils.createMockEditor(docText, 'html').editor;
				expect(editor).toBeTruthy();

				editor.on('change.instrtest', (event, editor, change) => {
					changeList = change;
				});

				instrumentedHTML = HTMLInstrumentation.generateInstrumentedHTML(editor);
				elementCount = getIdToTagMap(instrumentedHTML, elementIds);
			});
		}

		function checkMarkSanity() {
			// Ensure that we don't have multiple marks for the same tagID.
			const marks = editor._codeMirror.getAllMarks();
			const foundMarks = {};
			marks.forEach(mark => {
				if (mark.hasOwnProperty('tagID')) {
					if (foundMarks[mark.tagID]) {
						expect('mark with ID ' + mark.tagID).toBe('unique');
					}

					foundMarks[mark.tagID] = true;
				}
			});
		}

		afterEach(() => {
			SpecRunnerUtils.destroyMockEditor(editor.document);
			editor = null;
			instrumentedHTML = '';
			elementCount = 0;
			elementIds = {};
			changeList = null;
			offsets = null;
		});

		function doEditTest(
			origText,
			editFn,
			expectationFn,
			incremental,
			noRefresh
		) {
			// We need to fully reset the editor/mark state between the full and incremental tests
			// because if new DOM nodes are added by the edit, those marks will be present after the
			// full test, messing up the incremental test.
			if (!noRefresh) {
				editor.document.refreshText(origText);
			}

			const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
			let result;

			const clonedDOM = cloneDOM(previousDOM);

			HTMLInstrumentation._markTextFromDOM(editor, previousDOM);
			editFn(editor, previousDOM);

			// Note that even if we pass a change list, `_updateDOM` will still choose to do a
			// full reparse and diff if the change includes a structural character.
			result = HTMLInstrumentation._updateDOM(
				previousDOM,
				editor,
				incremental ? changeList : null
			);

			checkMarkSanity();

			const doc = new FakeDocument(clonedDOM);
			const editHandler = new RemoteFunctions.DOMEditHandler(doc);
			editHandler.apply(result.edits);
			clonedDOM.compare(result.dom);
			expectationFn(result, previousDOM, incremental);
		}

		function doFullAndIncrementalEditTest(editFn, expectationFn) {
			const origText = editor.document.getText();
			doEditTest(origText, editFn, expectationFn, false);
			changeList = null;

			if (HTMLInstrumentation._allowIncremental) {
				doEditTest(origText, editFn, expectationFn, true);
			}
		}

		// Common functionality between typeAndExpect() and deleteAndExpect().
		function doOperationAndExpect(
			editor,
			curDOM,
			pos,
			edits,
			wasInvalid,
			numIterations,
			operationFn,
			posUpdateFn
		) {
			let i; let result; let clonedDOM;
			for (i = 0; i < numIterations; i++) {
				clonedDOM = cloneDOM(curDOM);

				operationFn(i, pos);
				result = HTMLInstrumentation._updateDOM(
					curDOM,
					editor,
					wasInvalid ? null : changeList
				);
				if (!edits) {
					expect(Array.isArray(result.errors)).toBe(true);
					wasInvalid = true;
				} else {
					let expectedEdit = edits[i];
					if (typeof expectedEdit === 'function') {
						// This lets the caller access the most recent updated DOM values when
						// specifying the expected edit.
						expectedEdit = expectedEdit(result.dom);
					}

					expect(result.edits).toEqual(expectedEdit);
					wasInvalid = false;

					const doc = new FakeDocument(clonedDOM);
					const editHandler = new RemoteFunctions.DOMEditHandler(doc);
					editHandler.apply(result.edits);
					clonedDOM.compare(result.dom);

					checkMarkSanity();

					curDOM = result.dom;
				}

				posUpdateFn(pos);
			}

			return {finalDOM: curDOM, finalPos: pos, finalInvalid: wasInvalid};
		}

		/*
		 * Simulates typing the given string character by character. If edits is specified, then
		 * each successive character is expected to generate the edits at that position in the array.
		 * If edits is unspecified, then the document is expected to be in an invalid state at each
		 * step, so no edits should be generated.
		 * Returns the final DOM after all the edits, or the original DOM if the document is in an invalid state.
		 */
		function typeAndExpect(editor, curDOM, pos, str, edits, wasInvalid) {
			return doOperationAndExpect(
				editor,
				curDOM,
				pos,
				edits,
				wasInvalid,
				str.length,
				(i, pos) => {
					editor.document.replaceRange(str.charAt(i), pos);
				},
				pos => {
					pos.ch++;
				}
			);
		}

		/*
		 * Simulates deleting the specified number of characters one at a time. If edits is specified, then
		 * each successive character is expected to generate the edits at that position in the array.
		 * If edits is unspecified, then the document is expected to be in an invalid state at each
		 * step, so no edits should be generated.
		 * Returns the final DOM after all the edits, or the original DOM if the document is in an invalid state.
		 */
		function deleteAndExpect(
			editor,
			curDOM,
			pos,
			numToDelete,
			edits,
			wasInvalid
		) {
			return doOperationAndExpect(
				editor,
				curDOM,
				pos,
				edits,
				wasInvalid,
				numToDelete,
				(i, pos) => {
					editor.document.replaceRange(
						'',
						{line: pos.line, ch: pos.ch - 1},
						pos
					);
				},
				pos => {
					pos.ch--;
				}
			);
		}

		it('should re-instrument after document is dirtied', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				const pos = {line: 15, ch: 0};
				editor.document.replaceRange('<div>New Content</div>', pos);

				const newInstrumentedHTML = HTMLInstrumentation.generateInstrumentedHTML(
					editor
				);
				const newElementIds = {};
				const newElementCount = getIdToTagMap(newInstrumentedHTML, newElementIds);

				expect(newElementCount).toBe(elementCount + 1);
			});
		});

		it('should mark editor text based on the simple DOM', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				const dom = HTMLSimpleDOM.build(editor.document.getText());
				HTMLInstrumentation._markTextFromDOM(editor, dom);
				expect(editor._codeMirror.getAllMarks().length).toEqual(15);
			});
		});

		it('should handle no diff', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);
				const result = HTMLInstrumentation._updateDOM(previousDOM, editor);
				expect(result.edits).toEqual([]);
				expect(result.dom).toEqual(previousDOM);
			});
		});

		it('should handle attribute change', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				let tagID; let origParent;
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange(', awesome', {line: 7, ch: 56});
						tagID = previousDOM.children[1].children[7].tagID;
						origParent = previousDOM.children[1];
					},
					(result, previousDOM, incremental) => {
						expect(result.edits.length).toEqual(1);
						expect(result.edits[0]).toEqual({
							type: 'attrChange',
							tagID,
							attribute: 'content',
							value:
								'An interactive, awesome getting started guide for Brackets.'
						});

						if (incremental) {
							// This should have been a true incremental edit
							expect(result._wasIncremental).toBe(true);
							// Make sure the parent of the change is still the same node as in the old tree
							expect(result.dom.nodeMap[tagID].parent).toBe(origParent);
						} else {
							// Entire tree should be different
							expect(result.dom.nodeMap[tagID].parent).not.toBe(origParent);
						}
					}
				);
			});
		});

		it('should handle new attributes', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				let tagID; let origParent;
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange(' class=\'supertitle\'', {
							line: 12,
							ch: 3
						});
						tagID = previousDOM.children[3].children[1].tagID;
						origParent = previousDOM.children[3];
					},
					(result, previousDOM, incremental) => {
						expect(result.edits.length).toEqual(1);
						expect(result.edits[0]).toEqual({
							type: 'attrAdd',
							tagID,
							attribute: 'class',
							value: 'supertitle'
						});

						if (incremental) {
							// This should not have been a true incremental edit since it changed the attribute structure
							expect(result._wasIncremental).toBe(false);
						}

						// Entire tree should be different
						expect(result.dom.nodeMap[tagID].parent).not.toBe(origParent);
					}
				);
			});
		});

		it('should handle deleted attributes', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				let tagID; let origParent;
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange(
							'',
							{line: 7, ch: 32},
							{line: 7, ch: 93}
						);
						tagID = previousDOM.children[1].children[7].tagID;
						origParent = previousDOM.children[1];
					},
					(result, previousDOM, incremental) => {
						expect(result.edits.length).toEqual(1);
						expect(result.edits[0]).toEqual({
							type: 'attrDelete',
							tagID,
							attribute: 'content'
						});

						if (incremental) {
							// This should not have been a true incremental edit since it changed the attribute structure
							expect(result._wasIncremental).toBe(false);
						}

						// Entire tree should be different
						expect(result.dom.nodeMap[tagID].parent).not.toBe(origParent);
					}
				);
			});
		});

		it('should handle simple altered text', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				let tagID; let origParent;
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange(
							'AWESOMER',
							{line: 12, ch: 12},
							{line: 12, ch: 19}
						);
						tagID = previousDOM.children[3].children[1].tagID;
						origParent = previousDOM.children[3];
					},
					(result, previousDOM, incremental) => {
						expect(result.edits.length).toEqual(1);
						expect(previousDOM.children[3].children[1].tag).toEqual('h1');

						expect(result.edits[0]).toEqual({
							type: 'textReplace',
							parentID: tagID,
							content: 'GETTING AWESOMER WITH BRACKETS'
						});

						if (incremental) {
							// This should have been an incremental edit since it was just typing
							expect(result._wasIncremental).toBe(true);
							// Make sure the parent of the change is still the same node as in the old tree
							expect(result.dom.nodeMap[tagID].parent).toBe(origParent);
						} else {
							// Entire tree should be different
							expect(result.dom.nodeMap[tagID].parent).not.toBe(origParent);
						}
					}
				);
			});
		});

		it('should handle two incremental text edits in a row', () => {
			// Short-circuit this test if we're running without incremental updates
			if (!HTMLInstrumentation._allowIncremental) {
				return;
			}

			setupEditor(WellFormedDoc);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				const {tagID} = previousDOM.children[3].children[1];
				let result;
				const origParent = previousDOM.children[3];
				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				editor.document.replaceRange(
					'AWESOMER',
					{line: 12, ch: 12},
					{line: 12, ch: 19}
				);

				result = HTMLInstrumentation._updateDOM(previousDOM, editor, changeList);

				// TODO: how to test that only an appropriate subtree was reparsed/diffed?
				expect(result.edits.length).toEqual(1);
				expect(result.dom.children[3].children[1].tag).toEqual('h1');
				expect(result.dom.children[3].children[1].tagID).toEqual(tagID);
				expect(result.edits[0]).toEqual({
					type: 'textReplace',
					parentID: tagID,
					content: 'GETTING AWESOMER WITH BRACKETS'
				});
				// This should have been an incremental edit since it was just typing
				expect(result._wasIncremental).toBe(true);
				// Make sure the parent of the change is still the same node as in the old tree
				expect(result.dom.nodeMap[tagID].parent).toBe(origParent);

				editor.document.replaceRange(
					'MOAR AWESOME',
					{line: 12, ch: 12},
					{line: 12, ch: 20}
				);

				result = HTMLInstrumentation._updateDOM(previousDOM, editor, changeList);

				// TODO: how to test that only an appropriate subtree was reparsed/diffed?
				expect(result.edits.length).toEqual(1);
				expect(result.dom.children[3].children[1].tag).toEqual('h1');
				expect(result.dom.children[3].children[1].tagID).toEqual(tagID);
				expect(result.edits[0]).toEqual({
					type: 'textReplace',
					parentID: tagID,
					content: 'GETTING MOAR AWESOME WITH BRACKETS'
				});

				// This should have been an incremental edit since it was just typing
				expect(result._wasIncremental).toBe(true);
				// Make sure the parent of the change is still the same node as in the old tree
				expect(result.dom.nodeMap[tagID].parent).toBe(origParent);
			});
		});

		it('should avoid updating while typing an incomplete tag, then update when it\'s done', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				let result;

				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				// While the tag is incomplete, we should get no edits.
				result = typeAndExpect(editor, previousDOM, {line: 12, ch: 38}, '<p');
				expect(result.finalInvalid).toBe(true);

				// This simulates our autocomplete behavior. The next case simulates the non-autocomplete case.
				editor.document.replaceRange('></p>', {line: 12, ch: 40});

				// We don't pass the changeList here, to simulate doing a full rebuild (which is
				// what the normal incremental update logic would do after invalid edits).
				// TODO: a little weird that we're not going through the normal update logic
				// (in getUnappliedEditList, etc.)
				result = HTMLInstrumentation._updateDOM(previousDOM, editor);

				// This should really only have one edit (the tag insertion), but it also
				// deletes and recreates the whitespace after it, similar to other insert cases.
				const newElement = result.dom.children[3].children[2];
				const parentID = newElement.parent.tagID;
				const afterID = result.dom.children[3].children[1].tagID;
				const beforeID = result.dom.children[3].children[4].tagID;
				expect(result.edits.length).toEqual(3);
				expect(newElement.tag).toEqual('p');
				expect(result.edits[0]).toEqual({
					type: 'textDelete',
					parentID,
					afterID,
					beforeID
				});
				expect(result.edits[1]).toEqual({
					type: 'elementInsert',
					tag: 'p',
					tagID: newElement.tagID,
					attributes: {},
					parentID,
					beforeID // TODO: why is there no afterID here?
				});
				expect(result.edits[2]).toEqual({
					type: 'textInsert',
					content: '\n',
					parentID,
					afterID: newElement.tagID,
					beforeID
				});
			});
		});

		it('should handle typing of a <p> without a </p> and then adding it later', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				let previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				let result;

				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				// No edits should occur while we're invalid.
				result = typeAndExpect(editor, previousDOM, {line: 12, ch: 38}, '<p');
				expect(result.finalInvalid).toBe(true);

				// This simulates what would happen if autocomplete were off. We're actually
				// valid at this point since <p> is implied close. We want to make sure that
				// basically nothing happens if the user types </p> after this.
				editor.document.replaceRange('>', {line: 12, ch: 40});

				// We don't pass the changeList here, to simulate doing a full rebuild (which is
				// what the normal incremental update logic would do after invalid edits).
				// TODO: a little weird that we're not going through the normal update logic
				// (in getUnappliedEditList, etc.)
				result = HTMLInstrumentation._updateDOM(previousDOM, editor);

				// Since the <p> is unclosed, we think the whitespace after it is inside it.
				let newElement = result.dom.children[3].children[2];
				const parentID = newElement.parent.tagID;
				const afterID = result.dom.children[3].children[1].tagID;
				let beforeID = result.dom.children[3].children[3].tagID;
				expect(result.edits.length).toEqual(3);
				expect(newElement.tag).toEqual('p');
				expect(newElement.children.length).toEqual(1);
				expect(newElement.children[0].content).toEqual('\n');
				expect(result.edits[0]).toEqual({
					type: 'textDelete',
					parentID,
					afterID,
					beforeID
				});
				expect(result.edits[1]).toEqual({
					type: 'elementInsert',
					tag: 'p',
					tagID: newElement.tagID,
					attributes: {},
					parentID,
					beforeID // No afterID because beforeID is preferred given the insertBefore DOM API
				});
				expect(result.edits[2]).toEqual({
					type: 'textInsert',
					content: '\n',
					parentID: newElement.tagID,
					lastChild: true
				});

				// We should get no edits while typing the close tag.
				previousDOM = result.dom;
				result = typeAndExpect(editor, previousDOM, {line: 12, ch: 41}, '</p');
				expect(result.finalInvalid).toBe(true);

				// When we type the ">" at the end, we should get a delete of the text inside the <p>
				// and an insert of text after the </p> since we now know that the close is before the
				// text.
				editor.document.replaceRange('>', {line: 12, ch: 44});
				result = HTMLInstrumentation._updateDOM(previousDOM, editor);

				newElement = result.dom.children[3].children[2];
				beforeID = result.dom.children[3].children[4].tagID;
				expect(newElement.children.length).toEqual(0);
				expect(result.dom.children[3].children[3].content).toEqual('\n');
				expect(result.edits.length).toEqual(2);
				expect(result.edits[0]).toEqual({
					type: 'textInsert',
					content: '\n',
					parentID: newElement.parent.tagID,
					afterID: newElement.tagID,
					beforeID
				});
				expect(result.edits[1]).toEqual({
					type: 'textDelete',
					parentID: newElement.tagID
				});
			});
		});

		it('should handle deleting of an empty tag character-by-character', () => {
			setupEditor('<p><img>{{0}}</p>', true);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				const imgTagID = previousDOM.children[0].tagID;
				let result;

				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				// First four deletions should keep it in an invalid state.
				result = deleteAndExpect(editor, previousDOM, offsets[0], 4);
				expect(result.finalInvalid).toBe(true);

				// We're exiting an invalid state, so we pass "true" for the final argument
				// here, which forces a full reparse (the same as getUnappliedEdits() does).
				deleteAndExpect(
					editor,
					result.finalDOM,
					result.finalPos,
					1,
					[[{type: 'elementDelete', tagID: imgTagID}]],
					true
				);
			});
		});

		it('should handle deleting of a non-empty tag character-by-character', () => {
			setupEditor('<div><b>deleteme</b>{{0}}</div>', true);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				const pTagID = previousDOM.children[0].tagID;
				let result;

				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				// All the deletions until we get to the "<" should leave the document in an invalid state.
				result = deleteAndExpect(editor, previousDOM, offsets[0], 14);
				expect(result.finalInvalid).toBe(true);

				// We're exiting an invalid state, so we pass "true" for the final argument
				// here, which forces a full reparse (the same as getUnappliedEdits() does).
				deleteAndExpect(
					editor,
					result.finalDOM,
					result.finalPos,
					1,
					[[{type: 'elementDelete', tagID: pTagID}]],
					true
				);
			});
		});

		it('should handle deleting of a single character exactly between two elements', () => {
			setupEditor('<p><br>X{{0}}<br></p>', true);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				const pTagID = previousDOM.tagID;
				const br1TagID = previousDOM.children[0].tagID;
				const br2TagID = previousDOM.children[2].tagID;

				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				deleteAndExpect(editor, previousDOM, offsets[0], 1, [
					[
						{
							type: 'textDelete',
							parentID: pTagID,
							afterID: br1TagID,
							beforeID: br2TagID
						}
					]
				]);
			});
		});

		it('should handle typing of a new attribute character-by-character', () => {
			setupEditor('<p{{0}}>some text</p>', true);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				const {tagID} = previousDOM;
				let result;

				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				// Type a space after the tag name, then the attribute name. After the space,
				// it should be valid but there should be no actual edits. After that, it should
				// look like we're repeatedly adding a new empty attribute and deleting the old one.
				// edits to be generated.
				result = typeAndExpect(editor, previousDOM, offsets[0], ' class', [
					[], // " "
					[
						// " c"
						{type: 'attrAdd', tagID, attribute: 'c', value: ''}
					],
					[
						// " cl"
						{type: 'attrAdd', tagID, attribute: 'cl', value: ''},
						{type: 'attrDelete', tagID, attribute: 'c'}
					],
					[
						// " cla"
						{type: 'attrAdd', tagID, attribute: 'cla', value: ''},
						{type: 'attrDelete', tagID, attribute: 'cl'}
					],
					[
						// " clas"
						{type: 'attrAdd', tagID, attribute: 'clas', value: ''},
						{type: 'attrDelete', tagID, attribute: 'cla'}
					],
					[
						// " class"
						{type: 'attrAdd', tagID, attribute: 'class', value: ''},
						{type: 'attrDelete', tagID, attribute: 'clas'}
					]
				]);

				// While typing the "=" and quoted value, nothing should happen until the quote is balanced.
				result = typeAndExpect(
					editor,
					result.finalDOM,
					result.finalPos,
					'=\'myclass'
				);
				expect(result.finalInvalid).toBe(true);

				// We're exiting an invalid state, so we pass "true" for the final argument
				// here, which forces a full reparse (the same as getUnappliedEdits() does).

				// When the close quote is typed, we should get an attribute change.
				typeAndExpect(
					editor,
					result.finalDOM,
					result.finalPos,
					'\'',
					[
						[
							{
								type: 'attrChange',
								tagID,
								attribute: 'class',
								value: 'myclass'
							}
						]
					],
					true
				);
			});
		});

		it('should handle deleting of an attribute character-by-character', () => {
			setupEditor('<p class=\'myclass\'{{0}}>some text</p>', true);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				const {tagID} = previousDOM;
				let result;

				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				// Delete the attribute value starting from the end quote. We should be invalid until
				// we delete the = sign.
				result = deleteAndExpect(editor, previousDOM, offsets[0], 9);
				expect(result.finalInvalid).toBe(true);

				// We're exiting an invalid state, so we pass "true" for the final argument
				// here, which forces a full reparse (the same as getUnappliedEdits() does)
				// for the first edit.

				// Delete the = sign, then the name, then the space. This should look like
				// setting the value to "", then changing the attribute name, then an empty edit.
				deleteAndExpect(
					editor,
					result.finalDOM,
					result.finalPos,
					6,
					[
						[
							// " class"
							{
								type: 'attrChange',
								tagID,
								attribute: 'class',
								value: ''
							}
						],
						[
							// " clas"
							{type: 'attrAdd', tagID, attribute: 'clas', value: ''},
							{type: 'attrDelete', tagID, attribute: 'class'}
						],
						[
							// " cla"
							{type: 'attrAdd', tagID, attribute: 'cla', value: ''},
							{type: 'attrDelete', tagID, attribute: 'clas'}
						],
						[
							// " cl"
							{type: 'attrAdd', tagID, attribute: 'cl', value: ''},
							{type: 'attrDelete', tagID, attribute: 'cla'}
						],
						[
							// " c"
							{type: 'attrAdd', tagID, attribute: 'c', value: ''},
							{type: 'attrDelete', tagID, attribute: 'cl'}
						],
						[
							// " "
							{type: 'attrDelete', tagID, attribute: 'c'}
						],
						[] // Deletion of space
					],
					true
				);
			});
		});

		it('should handle wrapping a tag around some text character by character', () => {
			setupEditor('<p>{{0}}some text{{1}}</p>', true);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				let result;

				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				// Type the opening tag--should be invalid all the way
				result = typeAndExpect(editor, previousDOM, offsets[0], '<span>');
				expect(result.finalInvalid).toBe(true);

				// Type the end tag--should be invalid until we type the closing character
				// The offset is 6 characters later than the original position of offset 1 since we
				// inserted the opening tag.
				result = typeAndExpect(
					editor,
					result.finalDOM,
					{line: offsets[1].line, ch: offsets[1].ch + 6},
					'</span',
					null,
					true
				);
				expect(result.finalInvalid).toBe(true);

				// Finally become valid by closing the end tag.
				typeAndExpect(
					editor,
					result.finalDOM,
					result.finalPos,
					'>',
					[
						function (dom) {
							// Check for tagIDs relative to the DOM after typing
							return [
								{
									type: 'textDelete',
									parentID: dom.tagID
								},
								{
									type: 'elementInsert',
									tag: 'span',
									attributes: {},
									tagID: dom.children[0].tagID,
									parentID: dom.tagID,
									lastChild: true
								},
								{
									type: 'textInsert',
									parentID: dom.children[0].tagID,
									content: 'some text',
									lastChild: true
								}
							];
						}
					],
					true
				); // Because we were invalid before this operation
			});
		});

		it('should handle adding an <html> tag into an empty document', () => {
			setupEditor('');
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				let result;

				// Nothing to mark since it's currently an empty document.
				expect(previousDOM).toBe(null);

				// Type the opening tag--should be invalid all the way
				result = typeAndExpect(editor, previousDOM, {line: 0, ch: 0}, '<html');
				expect(result.finalInvalid).toBe(true);

				// Finally become valid by closing the start tag. Note that this elementInsert
				// should be treated specially by RemoteFunctions not to actually insert the
				// element, but just copy its ID to the autocreated HTML element.
				result = typeAndExpect(
					editor,
					result.finalDOM,
					result.finalPos,
					'>',
					[
						function (dom) {
							// Check for tagIDs relative to the DOM after typing
							return [
								{
									type: 'elementInsert',
									tag: 'html',
									attributes: {},
									tagID: dom.tagID,
									parentID: null
								}
							];
						}
					],
					true
				); // Because we were invalid before this operation

				// Make sure the mark got properly applied
				const marks = editor._codeMirror.getAllMarks();
				expect(marks.length).toBe(1);
				expect(marks[0].tagID).toEqual(result.finalDOM.tagID);
			});
		});

		it('should handle adding a <head> tag into a document', () => {
			setupEditor('<html>{{0}}</html>', true);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				let result;

				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				// Type the opening tag--should be invalid all the way
				result = typeAndExpect(editor, previousDOM, offsets[0], '<head></head');
				expect(result.finalInvalid).toBe(true);

				// Finally become valid by closing the end tag. Note that this elementInsert
				// should be treated specially by RemoteFunctions not to actually insert the
				// element, but just copy its ID to the autocreated HTML element.
				result = typeAndExpect(
					editor,
					result.finalDOM,
					result.finalPos,
					'>',
					[
						function (dom) {
							// Check for tagIDs relative to the DOM after typing
							return [
								{
									type: 'elementInsert',
									tag: 'head',
									attributes: {},
									tagID: dom.children[0].tagID,
									parentID: dom.tagID,
									lastChild: true
								}
							];
						}
					],
					true
				); // Because we were invalid before this operation
			});
		});

		it('should handle adding a <body> tag into a document', () => {
			setupEditor('<html><head></head>{{0}}</html>', true);
			runs(() => {
				const previousDOM = HTMLSimpleDOM.build(editor.document.getText());
				let result;

				HTMLInstrumentation._markTextFromDOM(editor, previousDOM);

				// Type the opening tag--should be invalid all the way
				result = typeAndExpect(editor, previousDOM, offsets[0], '<body');
				expect(result.finalInvalid).toBe(true);

				// Finally become valid by closing the start tag. Note that this elementInsert
				// should be treated specially by RemoteFunctions not to actually insert the
				// element, but just copy its ID to the autocreated HTML element.
				result = typeAndExpect(
					editor,
					result.finalDOM,
					result.finalPos,
					'>',
					[
						function (dom) {
							// Check for tagIDs relative to the DOM after typing
							return [
								{
									type: 'elementInsert',
									tag: 'body',
									attributes: {},
									tagID: dom.children[1].tagID,
									parentID: dom.tagID,
									lastChild: true
								}
							];
						}
					],
					true
				); // Because we were invalid before this operation
			});
		});

		it('should handle adding a space after </html>', () => {
			setupEditor('<html></html>', true);
			runs(() => {
				doEditTest(
					editor.document.getText(),
					(editor, previousDOM) => {
						editor.document.replaceRange(' ', {line: 0, ch: 13});
					},
					(result, previousDOM, incremental) => {},
					true
				);
			});
		});

		it('should represent simple new tag insert', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange('<div>New Content</div>', {
							line: 15,
							ch: 0
						});
					},
					(result, previousDOM, incremental) => {
						const newDOM = result.dom;
						const newElement = newDOM.children[3].children[5];
						expect(newElement.tag).toEqual('div');
						expect(newElement.tagID).not.toEqual(newElement.parent.tagID);
						expect(newElement.children[0].content).toEqual('New Content');
						expect(result.edits.length).toEqual(4);
						const beforeID = newElement.parent.children[7].tagID;
						const afterID = newElement.parent.children[3].tagID;

						expect(result.edits[0]).toEqual({
							type: 'textReplace',
							parentID: newElement.parent.tagID,
							afterID,
							beforeID,
							content: '\n\n'
						});
						expect(result.edits[1]).toEqual({
							type: 'elementInsert',
							tag: 'div',
							attributes: {},
							tagID: newElement.tagID,
							parentID: newElement.parent.tagID,
							beforeID
						});
						expect(result.edits[2]).toEqual({
							type: 'textInsert',
							parentID: newElement.parent.tagID,
							afterID: newElement.tagID,
							beforeID,
							content: '\n\n'
						});
						expect(result.edits[3]).toEqual({
							type: 'textInsert',
							parentID: newElement.tagID,
							content: 'New Content',
							lastChild: true
						});

						if (incremental) {
							// This should not have been an incremental edit since it changed the DOM structure
							expect(result._wasIncremental).toBe(false);
						}
					}
				);
			});
		});

		it('should be able to add two tags at once', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange(
							'<div>New Content</div><div>More new content</div>',
							{line: 15, ch: 0}
						);
					},
					(result, previousDOM, incremental) => {
						const newDOM = result.dom;
						const newElement = newDOM.children[3].children[5];
						const newElement2 = newDOM.children[3].children[6];
						expect(newElement.tag).toEqual('div');
						expect(newElement2.tag).toEqual('div');
						expect(newElement.tagID).not.toEqual(newElement.parent.tagID);
						expect(newElement2.tagID).not.toEqual(newElement.tagID);
						expect(newElement.children[0].content).toEqual('New Content');
						expect(newElement2.children[0].content).toEqual('More new content');
						expect(result.edits.length).toEqual(6);
						const beforeID = newElement.parent.children[8].tagID;
						const afterID = newElement.parent.children[3].tagID;
						expect(result.edits[0]).toEqual({
							type: 'textReplace',
							parentID: newElement.parent.tagID,
							afterID,
							beforeID,
							content: '\n\n'
						});
						expect(result.edits[1]).toEqual({
							type: 'elementInsert',
							tag: 'div',
							attributes: {},
							tagID: newElement.tagID,
							parentID: newElement.parent.tagID,
							beforeID
						});
						expect(result.edits[2]).toEqual({
							type: 'elementInsert',
							tag: 'div',
							attributes: {},
							tagID: newElement2.tagID,
							parentID: newElement2.parent.tagID,
							beforeID
						});
						expect(result.edits[3]).toEqual({
							type: 'textInsert',
							parentID: newElement2.parent.tagID,
							afterID: newElement2.tagID,
							beforeID,
							content: '\n\n'
						});
						expect(result.edits[4]).toEqual({
							type: 'textInsert',
							parentID: newElement2.tagID,
							content: 'More new content',
							lastChild: true
						});
						expect(result.edits[5]).toEqual({
							type: 'textInsert',
							parentID: newElement.tagID,
							content: 'New Content',
							lastChild: true
						});

						if (incremental) {
							// This should not have been an incremental edit since it changed the DOM structure
							expect(result._wasIncremental).toBe(false);
						}
					}
				);
			});
		});

		it('should be able to paste a tag with a nested tag', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange(
							'<div>New <em>Awesome</em> Content</div>',
							{line: 13, ch: 0}
						);
					},
					(result, previousDOM, incremental) => {
						const newDOM = result.dom;

						const newElement = newDOM.children[3].children[3];
						const newChild = newElement.children[1];
						expect(newElement.tag).toEqual('div');
						expect(newElement.tagID).not.toEqual(newElement.parent.tagID);
						expect(newElement.children.length).toEqual(3);
						expect(newElement.children[0].content).toEqual('New ');
						expect(newChild.tag).toEqual('em');
						expect(newChild.tagID).not.toEqual(newElement.tagID);
						expect(newChild.children.length).toEqual(1);
						expect(newChild.children[0].content).toEqual('Awesome');
						expect(newElement.children[2].content).toEqual(' Content');
						expect(result.edits.length).toEqual(5);

						const beforeID = newElement.parent.children[4].tagID;
						expect(result.edits[0]).toEqual({
							type: 'elementInsert',
							tag: 'div',
							attributes: {},
							tagID: newElement.tagID,
							parentID: newElement.parent.tagID,
							beforeID
						});
						expect(result.edits[1]).toEqual({
							type: 'textInsert',
							parentID: newElement.tagID,
							content: 'New ',
							lastChild: true
						});
						expect(result.edits[2]).toEqual({
							type: 'elementInsert',
							tag: 'em',
							attributes: {},
							tagID: newChild.tagID,
							parentID: newElement.tagID,
							lastChild: true
						});
						expect(result.edits[3]).toEqual({
							type: 'textInsert',
							parentID: newElement.tagID,
							content: ' Content',
							lastChild: true
						});
						expect(result.edits[4]).toEqual({
							type: 'textInsert',
							parentID: newChild.tagID,
							content: 'Awesome',
							lastChild: true
						});

						if (incremental) {
							// This should not have been an incremental edit since it changed the DOM structure
							expect(result._wasIncremental).toBe(false);
						}
					}
				);
			});
		});

		it('should handle inserting an element as the first child', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange('<div>New Content</div>', {
							line: 10,
							ch: 12
						});
					},
					(result, previousDOM, incremental) => {
						const newDOM = result.dom;
						const newElement = newDOM.children[3].children[0];
						const {parent} = newElement;
						const parentID = parent.tagID;
						const beforeID = parent.children[2].tagID;

						// TODO: More optimally, this would take
						// 2 edits rather than 4:
						// * an elementInsert for the new element
						// * a textInsert for the new text of the
						//   new element.
						//
						// It current requires 4 edits because the
						// whitespace text node that comes after
						// the body tag is deleted and recreated
						expect(result.edits.length).toBe(4);
						expect(result.edits[0]).toEqual({
							type: 'textDelete',
							parentID,
							beforeID
						});
						expect(result.edits[1]).toEqual({
							type: 'elementInsert',
							parentID,
							tag: 'div',
							attributes: {},
							tagID: newElement.tagID,
							beforeID
						});
						expect(result.edits[2]).toEqual({
							type: 'textInsert',
							parentID,
							content: '\n\n',
							afterID: newElement.tagID,
							beforeID
						});
						expect(result.edits[3]).toEqual({
							type: 'textInsert',
							parentID: newElement.tagID,
							content: 'New Content',
							lastChild: true
						});

						if (incremental) {
							// This should not have been an incremental edit since it changed the DOM structure
							expect(result._wasIncremental).toBe(false);
						}
					}
				);
			});
		});

		it('should handle inserting an element as the last child', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						// Insert a new element at the end of a paragraph
						editor.document.replaceRange('<strong>New Content</strong>', {
							line: 33,
							ch: 0
						});
					},
					(result, previousDOM, incremental) => {
						const newDOM = result.dom;
						const newElement = newDOM.children[3].children[7].children[3];
						const {parent} = newElement;
						const parentID = parent.tagID;

						expect(result.edits.length).toBe(2);
						expect(result.edits[0]).toEqual({
							type: 'elementInsert',
							parentID,
							lastChild: true,
							tag: 'strong',
							attributes: {},
							tagID: newElement.tagID
						});
						expect(result.edits[1]).toEqual({
							type: 'textInsert',
							parentID: newElement.tagID,
							content: 'New Content',
							lastChild: true
						});

						if (incremental) {
							// This should not have been an incremental edit since it changed the DOM structure
							expect(result._wasIncremental).toBe(false);
						}
					}
				);
			});
		});

		it('should handle inserting an element before an existing text node', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				editor.document.replaceRange('<strong>pre-edit child</strong>', {
					line: 33,
					ch: 0
				});

				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange('<strong>New Content</strong>', {
							line: 29,
							ch: 59
						});
					},
					(result, previousDOM, incremental) => {
						const newDOM = result.dom;
						const newElement = newDOM.children[3].children[7].children[2];
						const {parent} = newElement;
						const parentID = parent.tagID;
						const afterID = parent.children[1].tagID;
						const beforeID = parent.children[4].tagID;

						expect(result.edits.length).toBe(4);
						expect(result.edits[0]).toEqual({
							type: 'textDelete',
							parentID,
							afterID,
							beforeID
						});

						expect(result.edits[1]).toEqual({
							type: 'elementInsert',
							parentID,
							beforeID,
							tag: 'strong',
							attributes: {},
							tagID: newElement.tagID
						});
						expect(result.edits[2]).toEqual({
							type: 'textInsert',
							parentID,
							content: jasmine.any(String),
							afterID: newElement.tagID,
							beforeID
						});

						if (incremental) {
							// This should not have been an incremental edit since it changed the DOM structure
							expect(result._wasIncremental).toBe(false);
						}
					}
				);
			});
		});

		it('should represent simple new tag insert immediately after previous tag before text before tag', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				let ed;

				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						ed = editor;
						editor.document.replaceRange('<div>New Content</div>', {
							line: 12,
							ch: 38
						});
					},
					(result, previousDOM, incremental) => {
						const newDOM = result.dom;

						// First child is whitespace, second child is <h1>, third child is new tag
						const newElement = newDOM.children[3].children[2];
						const afterID = newElement.parent.children[1].tagID;
						const beforeID = newElement.parent.children[4].tagID;
						expect(newElement.tag).toEqual('div');
						expect(newElement.tagID).not.toEqual(newElement.parent.tagID);
						expect(newElement.children[0].content).toEqual('New Content');

						// 4 edits:
						// - delete original \n
						// - insert new tag
						// - insert text in tag
						// - re-add \n after tag
						expect(result.edits.length).toEqual(4);
						expect(result.edits[0]).toEqual({
							type: 'textDelete',
							parentID: newElement.parent.tagID,
							afterID,
							beforeID
						});
						expect(result.edits[1]).toEqual({
							type: 'elementInsert',
							tag: 'div',
							attributes: {},
							tagID: newElement.tagID,
							parentID: newElement.parent.tagID,
							beforeID
						});
						expect(result.edits[2]).toEqual({
							type: 'textInsert',
							parentID: newElement.parent.tagID,
							content: jasmine.any(String),
							afterID: newElement.tagID,
							beforeID
						});
						expect(result.edits[3]).toEqual({
							type: 'textInsert',
							content: 'New Content',
							parentID: newElement.tagID,
							lastChild: true
						});

						if (incremental) {
							// This should not have been an incremental edit since it changed the DOM structure
							expect(result._wasIncremental).toBe(false);
						}
					}
				);
			});
		});

		it('should handle new text insert between tags after whitespace', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange('New Content', {line: 13, ch: 0});
					},
					(result, previousDOM, incremental) => {
						const newDOM = result.dom;
						const newElement = newDOM.children[3].children[2];
						expect(newElement.content).toEqual('\nNew Content');
						expect(result.edits.length).toEqual(1);
						expect(result.edits[0]).toEqual({
							type: 'textReplace',
							content: '\nNew Content',
							parentID: newElement.parent.tagID,
							afterID: newDOM.children[3].children[1].tagID,
							beforeID: newDOM.children[3].children[3].tagID
						});
						if (incremental) {
							// This should have been an incremental edit since it was just text
							expect(result._wasIncremental).toBe(true);
						}
					}
				);
			});
		});

		it('should handle inserting an element in the middle of text', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange('<img>', {line: 12, ch: 19});
					},
					(result, previousDOM, incremental) => {
						const newDOM = result.dom;
						const newElement = newDOM.children[3].children[1].children[1];

						expect(newElement.tag).toEqual('img');
						expect(newDOM.children[3].children[1].children[0].content).toEqual(
							'GETTING STARTED'
						);
						expect(newDOM.children[3].children[1].children[2].content).toEqual(
							' WITH BRACKETS'
						);
						expect(result.edits.length).toEqual(3);
						expect(result.edits[0]).toEqual({
							type: 'textReplace',
							content: 'GETTING STARTED',
							parentID: newElement.parent.tagID
						});
						expect(result.edits[1]).toEqual({
							type: 'elementInsert',
							tag: 'img',
							attributes: {},
							tagID: newElement.tagID,
							parentID: newElement.parent.tagID,
							lastChild: true
						});
						expect(result.edits[2]).toEqual({
							type: 'textInsert',
							content: ' WITH BRACKETS',
							parentID: newElement.parent.tagID,
							lastChild: true
						});

						if (incremental) {
							// This should not have been an incremental edit since it changed the DOM structure
							expect(result._wasIncremental).toBe(false);
						}
					}
				);
			});
		});

		it('should handle reordering of children in one step as a delete/insert', () => {
			setupEditor('<p>{{0}}<img><br>{{1}}</p>', true);
			let oldImgID; let oldBrID;
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						oldImgID = previousDOM.children[0].tagID;
						oldBrID = previousDOM.children[1].tagID;
						editor.document.replaceRange('<br><img>', offsets[0], offsets[1]);
					},
					(result, previousDOM, incremental) => {
						const newBrElement = result.dom.children[0];
						const newImgElement = result.dom.children[1];

						expect(result.edits.length).toEqual(4);
						expect(result.edits[0]).toEqual({
							type: 'elementDelete',
							tagID: oldImgID
						});
						expect(result.edits[1]).toEqual({
							type: 'elementDelete',
							tagID: oldBrID
						});
						expect(result.edits[2]).toEqual({
							type: 'elementInsert',
							tag: 'br',
							attributes: {},
							tagID: newBrElement.tagID,
							parentID: result.dom.tagID,
							lastChild: true
						});
						expect(result.edits[3]).toEqual({
							type: 'elementInsert',
							tag: 'img',
							attributes: {},
							tagID: newImgElement.tagID,
							parentID: result.dom.tagID,
							lastChild: true
						});

						if (incremental) {
							// This should not have been an incremental edit since it changed the DOM structure
							expect(result._wasIncremental).toBe(false);
						}
					}
				);
			});
		});

		it('should support deleting across tags', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						editor.document.replaceRange(
							'',
							{line: 20, ch: 11},
							{line: 28, ch: 3}
						);
					},
					(result, previousDOM, incremental) => {
						if (incremental) {
							return;
						}

						const newDOM = result.dom;
						const modifiedParagraph = newDOM.children[3].children[5];
						expect(modifiedParagraph.tag).toEqual('p');
						expect(modifiedParagraph.children.length).toEqual(3);

						const emTag = modifiedParagraph.children[1];
						expect(emTag.tag).toEqual('em');

						const deletedParagraph = previousDOM.children[3].children[7];
						expect(deletedParagraph.tag).toEqual('p');

						const aTag = previousDOM.children[3].children[9];
						expect(aTag.tag).toEqual('a');

						expect(result.edits.length).toEqual(6);
						expect(result.edits[0]).toEqual({
							type: 'rememberNodes',
							tagIDs: [emTag.tagID]
						});

						expect(result.edits[1]).toEqual({
							type: 'elementDelete',
							tagID: deletedParagraph.tagID
						});
						expect(result.edits[2]).toEqual({
							type: 'textReplace',
							content: '\n\n\n',
							parentID: modifiedParagraph.parent.tagID,
							afterID: modifiedParagraph.tagID,
							beforeID: aTag.tagID
						});
						expect(result.edits[3]).toEqual({
							type: 'textReplace',
							content: '\n    Welcome\n    ',
							parentID: modifiedParagraph.tagID
						});
						expect(result.edits[4]).toEqual({
							type: 'elementMove',
							tagID: emTag.tagID,
							parentID: modifiedParagraph.tagID,
							lastChild: true
						});
						expect(result.edits[5]).toEqual({
							type: 'textInsert',
							parentID: modifiedParagraph.tagID,
							lastChild: true,
							content: jasmine.any(String)
						});
					}
				);
			});
		});

		it('should support reparenting a node with new parent under the old parent', () => {
			setupEditor(WellFormedDoc);
			let currentText = WellFormedDoc;
			let movingParagraph; let newDiv;
			runs(() => {
				doEditTest(
					currentText,
					(editor, previousDOM) => {
						editor.document.replaceRange('<div>Hello</div>', {
							line: 14,
							ch: 0
						});
						currentText = editor.document.getText();
					},
					(result, previousDOM, incremental) => {},
					false
				);
			});
			runs(() => {
				doEditTest(
					currentText,
					(editor, previousDOM) => {
						movingParagraph = previousDOM.children[3].children[7];
						newDiv = previousDOM.children[3].children[5];
						editor.document.replaceRange(
							'',
							{line: 14, ch: 10},
							{line: 14, ch: 16}
						);
						editor.document.replaceRange('</div>', {line: 24, ch: 0});
					},
					(result, previousDOM, incremental) => {
						expect(movingParagraph.tag).toBe('p');
						expect(newDiv.tag).toBe('div');
						expect(result.edits.length).toBe(5);
						expect(result.edits[0].type).toBe('rememberNodes');
						expect(result.edits[0].tagIDs).toEqual([movingParagraph.tagID]);

						// The text replace should not refer to the moving node, because it is
						// going to be removed from the DOM.
						expect(result.edits[1].type).toEqual('textReplace');
						expect(result.edits[1].afterID).not.toEqual(movingParagraph.tagID);
						expect(result.edits[1].beforeID).not.toEqual(movingParagraph.tagID);

						expect(result.edits[3].type).toBe('elementMove');
						expect(result.edits[3].tagID).toBe(movingParagraph.tagID);
						expect(result.edits[3].parentID).toBe(newDiv.tagID);
					},
					false
				);
			});
		});

		it('should support undo of a tag merge', () => {
			setupEditor(WellFormedDoc);
			let currentText = WellFormedDoc;
			runs(() => {
				doEditTest(
					currentText,
					(editor, previousDOM) => {
						editor.document.replaceRange(
							'',
							{line: 23, ch: 0},
							{line: 29, ch: 0}
						);
						currentText = editor.document.getText();
					},
					(result, previousDOM, incremental) => {},
					false
				);
			});
			runs(() => {
				doEditTest(
					currentText,
					(editor, previousDOM) => {
						editor.undo();
					},
					(result, previousDOM, incremental) => {
						const emNode = previousDOM.children[3].children[5].children[1];
						expect(emNode.tag).toBe('em');

						expect(result.edits.length).toBe(7);

						let edit = result.edits[0];
						expect(edit.type).toBe('rememberNodes');
						expect(edit.tagIDs).toEqual([emNode.tagID]);

						edit = result.edits[1];
						expect(edit.type).toBe('elementInsert');
						expect(edit.tag).toBe('p');
						const newParaID = edit.tagID;

						edit = result.edits[5];
						expect(edit.type).toBe('elementMove');
						expect(edit.tagID).toBe(emNode.tagID);
						expect(edit.parentID).toBe(newParaID);
					},
					false,
					true
				);
			});
		});

		it('should handle tag changes', () => {
			setupEditor(WellFormedDoc);
			let heading; let h1; let para;
			runs(() => {
				doEditTest(
					WellFormedDoc,
					(editor, previousDOM) => {
						heading = previousDOM.children[3].children[3];
						h1 = previousDOM.children[3].children[1];
						para = previousDOM.children[3].children[5];
						editor.document.replaceRange(
							'h3',
							{line: 13, ch: 1},
							{line: 13, ch: 3}
						);
						editor.document.replaceRange(
							'h3',
							{line: 13, ch: 25},
							{line: 13, ch: 27}
						);
					},
					(result, previousDOM, incremental) => {
						expect(heading.tag).toBe('h2');
						expect(para.tag).toBe('p');

						const newHeading = result.dom.children[3].children[3];
						expect(newHeading.tag).toBe('h3');

						expect(result.edits.length).toBe(5);
						expect(result.edits[0]).toEqual({
							type: 'elementDelete',
							tagID: heading.tagID
						});
						expect(result.edits[1]).toEqual({
							type: 'textReplace',
							parentID: newHeading.parent.tagID,
							beforeID: para.tagID,
							afterID: h1.tagID,
							content: '\n'
						});
						expect(result.edits[2]).toEqual({
							type: 'elementInsert',
							tagID: newHeading.tagID,
							parentID: newHeading.parent.tagID,
							attributes: {},
							tag: 'h3',
							beforeID: para.tagID
						});
						expect(result.edits[3]).toEqual({
							type: 'textInsert',
							content: '\n\n\n\n',
							parentID: newHeading.parent.tagID,
							beforeID: para.tagID,
							afterID: newHeading.tagID
						});
						expect(result.edits[4]).toEqual({
							type: 'textInsert',
							content: 'This is your guide!',
							parentID: newHeading.tagID,
							lastChild: true
						});
					},
					false
				);
			});
		});

		it('should handle void element tag changes', () => {
			setupEditor(WellFormedDoc);
			runs(() => {
				doEditTest(
					WellFormedDoc,
					(editor, previousDOM) => {
						editor.document.replaceRange(
							'br',
							{line: 37, ch: 5},
							{line: 37, ch: 8}
						);
					},
					(result, previousDOM, incremental) => {
						const br = result.dom.children[3].children[9].children[1];
						const img = previousDOM.children[3].children[9].children[1];
						expect(br.tag).toBe('br');
						expect(img.tag).toBe('img');

						expect(result.edits.length).toBe(4);
						expect(result.edits[0]).toEqual({
							type: 'elementDelete',
							tagID: img.tagID
						});
						expect(result.edits[1]).toEqual({
							type: 'textReplace',
							content: '\n    ',
							parentID: br.parent.tagID
						});
						expect(result.edits[2]).toEqual({
							type: 'elementInsert',
							tagID: br.tagID,
							parentID: br.parent.tagID,
							attributes: {
								alt: 'A screenshot showing CSS Quick Edit',
								src: 'screenshots/brackets-quick-edit.png'
							},
							tag: 'br',
							lastChild: true
						});
						expect(result.edits[3]).toEqual({
							type: 'textInsert',
							content: '\n',
							parentID: br.parent.tagID,
							lastChild: true
						});
					},
					false
				);
			});
		});

		it('should handle tag changes with child elements', () => {
			setupEditor(WellFormedDoc);
			let para; let earlierPara;
			runs(() => {
				doEditTest(
					WellFormedDoc,
					(editor, previousDOM) => {
						para = previousDOM.children[3].children[7];
						earlierPara = previousDOM.children[3].children[5];
						editor.document.replaceRange(
							'div',
							{line: 28, ch: 1},
							{line: 28, ch: 2}
						);
						editor.document.replaceRange(
							'div',
							{line: 33, ch: 2},
							{line: 33, ch: 3}
						);
					},
					(result, previousDOM, incremental) => {
						const div = result.dom.children[3].children[7];
						const em = div.children[1];
						const a = result.dom.children[3].children[9];
						expect(para.tag).toBe('p');
						expect(div.tag).toBe('div');
						expect(em.tag).toBe('em');

						expect(result.edits.length).toBe(8);
						expect(result.edits[0]).toEqual({
							type: 'rememberNodes',
							tagIDs: [em.tagID]
						});

						expect(result.edits[1]).toEqual({
							type: 'elementDelete',
							tagID: para.tagID
						});

						expect(result.edits[2]).toEqual({
							type: 'textReplace',
							content: '\n\n\n',
							parentID: div.parent.tagID,
							afterID: earlierPara.tagID,
							beforeID: a.tagID
						});

						expect(result.edits[3]).toEqual({
							type: 'elementInsert',
							tag: 'div',
							tagID: div.tagID,
							parentID: div.parent.tagID,
							attributes: {},
							beforeID: a.tagID
						});

						expect(result.edits[4]).toEqual({
							type: 'textInsert',
							content: '\n\n\n',
							parentID: div.parent.tagID,
							afterID: div.tagID,
							beforeID: a.tagID
						});

						expect(result.edits[5]).toEqual({
							type: 'textInsert',
							content: '\n    ',
							parentID: div.tagID,
							lastChild: true
						});

						expect(result.edits[6]).toEqual({
							type: 'elementMove',
							tagID: em.tagID,
							parentID: div.tagID,
							lastChild: true
						});

						expect(result.edits[7]).toEqual({
							type: 'textInsert',
							parentID: div.tagID,
							content: jasmine.any(String),
							lastChild: true
						});
					},
					false
				);
			});
		});

		it('should handle multiple inserted tags and text', () => {
			setupEditor('<h1><strong>Emphasized</strong> Hello </h1>');
			let h1; let strong;
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						h1 = previousDOM;
						strong = previousDOM.children[0];
						editor.document.replaceRange(
							'<em>Foo</em> bar <strong>Baz!</strong>',
							{line: 0, ch: 4},
							{line: 0, ch: 31}
						);
					},
					(result, previousDOM, incremental) => {
						const em = result.dom.children[0];
						const strong2 = result.dom.children[2];

						expect(result.edits.length).toBe(8);
						expect(result.edits[0]).toEqual({
							type: 'elementDelete',
							tagID: strong.tagID
						});
						expect(result.edits[1]).toEqual({
							type: 'textDelete',
							parentID: h1.tagID
						});
						expect(result.edits[2]).toEqual({
							type: 'elementInsert',
							tag: 'em',
							tagID: em.tagID,
							parentID: h1.tagID,
							attributes: {},
							lastChild: true
						});
						expect(result.edits[3]).toEqual({
							type: 'textInsert',
							parentID: h1.tagID,
							lastChild: true,
							content: ' bar '
						});
						expect(result.edits[4]).toEqual({
							type: 'elementInsert',
							tag: 'strong',
							tagID: strong2.tagID,
							parentID: h1.tagID,
							lastChild: true,
							attributes: {}
						});
						expect(result.edits[5]).toEqual({
							type: 'textInsert',
							parentID: h1.tagID,
							lastChild: true,
							content: ' Hello '
						});

						expect(result.edits[6]).toEqual({
							type: 'textInsert',
							parentID: strong2.tagID,
							content: 'Baz!',
							lastChild: true
						});
						expect(result.edits[7]).toEqual({
							type: 'textInsert',
							parentID: em.tagID,
							content: 'Foo',
							lastChild: true
						});
					}
				);
			});
		});

		it('should handle pasting a tag over multiple tags and text', () => {
			setupEditor(
				'<h1>before<strong>Strong</strong>Hello<em>Emphasized</em>after</h1>'
			);
			let h1; let strong; let em;
			runs(() => {
				doFullAndIncrementalEditTest(
					(editor, previousDOM) => {
						h1 = previousDOM;
						strong = previousDOM.children[1];
						em = previousDOM.children[3];
						editor.document.replaceRange(
							'<i>Italic</i>',
							{line: 0, ch: 10},
							{line: 0, ch: 57}
						);
					},
					(result, previousDOM, incremental) => {
						const i = result.dom.children[1];

						expect(result.edits.length).toBe(5);
						expect(result.edits[0]).toEqual({
							type: 'elementDelete',
							tagID: strong.tagID
						});
						expect(result.edits[1]).toEqual({
							type: 'textReplace',
							parentID: h1.tagID,
							beforeID: em.tagID,
							content: 'before'
						});
						expect(result.edits[2]).toEqual({
							type: 'elementInsert',
							tag: 'i',
							tagID: i.tagID,
							parentID: h1.tagID,
							attributes: {},
							beforeID: em.tagID
						});
						expect(result.edits[3]).toEqual({
							type: 'elementDelete',
							tagID: em.tagID
						});
						expect(result.edits[4]).toEqual({
							type: 'textInsert',
							parentID: i.tagID,
							content: 'Italic',
							lastChild: true
						});
					}
				);
			});
		});
	});
});
