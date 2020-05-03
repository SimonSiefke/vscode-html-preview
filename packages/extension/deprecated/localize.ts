import * as fs from 'fs';
import * as path from 'path';
import {config} from './config';

let i18nFile: any;
export function localize(key: string): string {
	console.log(process.env.VSCODE_NLS_CONFIG);
	return '';
	if (!i18nFile) {
		// i18nFile = JSON.parse(fs.readFileSync(path.join(config.root, 'i18n/de.json'), 'utf-8'));
	}

	const result = i18nFile[key];
	if (result === undefined) {
		throw new Error(`cannot localize ${key}`);
	}

	return result;
}
