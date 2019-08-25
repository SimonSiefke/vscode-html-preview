const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');

const highlightCss = fs.readFileSync(
	path.join(root, 'packages/extension/src/open/open-in-vscode/openInVscode.html'),
	'utf-8'
);

const code = `export const html = \`${highlightCss}\``;
fs.writeFileSync(
	path.join(root, 'packages/extension/src/open/open-in-vscode/openInVscodeHtml.ts'),
	code
);

console.log('success');
