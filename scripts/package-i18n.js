/* eslint-disable max-depth */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const {validate} = require('jsonschema');

const i18nFileNames = fs.readdirSync(path.join(root, 'i18n'));

const [schema, ...i18nFiles] = i18nFileNames.map(fileName =>
	JSON.parse(fs.readFileSync(path.join(root, 'i18n', fileName), 'utf-8'))
);

for (let i = 0; i < i18nFileNames.length - 1; i++) {
	const i18nFile = i18nFiles[i];
	const i18nFileName = i18nFileNames[i + 1];
	const {valid, errors} = validate(i18nFile, schema);
	if (!valid) {
		throw new Error(`i18n/${i18nFileName} doesn't match schema: ${errors[0].message}`);
	}
}

const enFileIndex = i18nFileNames.findIndex(fileName => fileName === 'en.json'); // ?
if (enFileIndex === -1) {
	throw new Error('i18n/en.json is required');
}

const enFile = i18nFiles[enFileIndex - 1]; // ?

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'dist/package.json'), 'utf-8'));

const reverseEntries = Object.entries(enFile).map(x => x.reverse()); // ?
const findKey = name => {
	for (const entry of reverseEntries) {
		if (entry[0] === name) {
			return entry[1];
		}
	}

	throw new Error('not found');
};

const notFound = new Set(Object.keys(enFile));
for (const key in packageJson.contributes) {
	if (key === 'commands') {
		for (const command of packageJson.contributes.commands) {
			if (command.title) {
				const key = findKey(command.title);
				const i18nKey = `%${key}%`;
				command.title = i18nKey;
				notFound.delete(key);
			}
		}
	}
}

if (notFound.size > 0) {
	throw new Error(`"${Array.from(notFound.values())[0]}" not found in package.json`);
}

// if (!fs.existsSync(path.join(root, 'dist/i18n'))) {
// 	fs.mkdirSync(path.join(root, 'dist/i18n'));
// }

for (let i = 0; i < i18nFileNames.length - 1; i++) {
	const i18nFileName = i18nFileNames[i + 1];
	const i18nFile = i18nFiles[i];
	const stringifiedFile = JSON.stringify(i18nFile, null, 2) + '\n';
	if (i18nFileName === 'en.json') {
		fs.writeFileSync(path.join('dist', 'package.nls.json'), stringifiedFile);
	} else {
		fs.writeFileSync(path.join('dist', `package.nls.${i18nFileName}`), stringifiedFile);
	}
}

fs.writeFileSync(
	path.join(root, 'dist', 'package.json'),
	JSON.stringify(packageJson, null, 2) + '\n'
);
