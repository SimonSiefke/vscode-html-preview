({
	ignoreExternalFileChanges: true
});
const HtmlSimpleDom = require('./HTMLSimpleDOM');

const text = '<div><p>unclosed para<h1>heading that closes para</h1></div>';

const result = build(text, true); // ?
