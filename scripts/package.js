const path = require('path');
const fs = require('fs-extra');

const root = path.join(__dirname, '..');

if (!fs.existsSync(path.join(root, 'dist'))) {
	fs.mkdirSync(path.join(root, 'dist'));
}

// @ts-ignore
const pkg = require('../packages/extension/package.json');

pkg.main = `./packages/extension/${pkg.main}`;

delete pkg.dependencies;
delete pkg.devDependencies;
delete pkg.enableProposedApi;
pkg.activationEvents = pkg.activationEvents.filter(event => event !== 'onLanguage:html');

fs.writeFileSync(path.join(root, 'dist/package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

for (const file of ['README.md', 'LICENSE', 'CHANGELOG.md']) {
	fs.copySync(path.join(root, file), `dist/${file}`);
}

for (const file of fs.readdirSync(path.join(root, 'packages/extension/images'))) {
	if (
		[
			'icon.png',
			'bolt_original_darkgray_optimized.svg',
			'bolt_original_lightgray_optimized.svg',
			'refresh_original_darkgray_optimized.svg',
			'refresh_original_lightgray_optimized.svg'
		].includes(file)
	) {
		fs.copySync(path.join(root, `packages/extension/images/${file}`), `dist/images/${file}`);
	} else if (
		['bolt_original_yellow_optimized.svg', 'bolt_original_red_optimized.svg'].includes(file)
	) {
		fs.copySync(
			path.join(root, `packages/extension/images/${file}`),
			`dist/packages/extension/images/${file}`
		);
	}
}

fs.copySync(
	path.join(root, 'packages/injected-code/dist'),
	path.join(root, 'dist/packages/injected-code/dist')
);

require('./package-i18n');
