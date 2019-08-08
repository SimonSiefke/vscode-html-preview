const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');

const highlightCss = fs.readFileSync(
	path.join(root, 'packages/injected-code/src/highlight/highlight.min.css'),
	'utf-8'
);
let highlightTs = fs.readFileSync(
	path.join(root, 'packages/injected-code/src/highlight/highlight.ts'),
	'utf-8'
);

const baseStyleBlockRe = /const baseStyle = '(.*?)'/;

if (!baseStyleBlockRe.test(highlightTs)) {
	throw new Error('script does not work');
}

highlightTs = highlightTs.replace(baseStyleBlockRe, `const baseStyle = '${highlightCss}'`);

fs.writeFileSync(path.join(root, 'packages/injected-code/src/highlight/highlight.ts'), highlightTs);

console.log('success');
