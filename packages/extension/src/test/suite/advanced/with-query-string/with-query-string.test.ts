import {activateExtension} from '../../../test-util';
import * as puppeteer from 'puppeteer';
import * as vscode from 'vscode';
import * as path from 'path';

const headless = true;

function getBrowser() {
	return puppeteer.launch({headless, args: ['--no-sandbox']});
}

function getUri(file) {
	return vscode.Uri.file(
		path.join(__dirname, 'with-query-string-workspace-dist', file).replace('dist', 'src')
	);
}

test('files with query string load correctly', async () => {
	await activateExtension();
	const uri = getUri('index.html');
	const document = await vscode.workspace.openTextDocument(uri);
	await vscode.window.showTextDocument(document);
	const browser = await getBrowser();
	const page = await browser.newPage();
	await vscode.commands.executeCommand('htmlPreview.openPreview');
	await page.goto('http://localhost:3000/index.html?wwwwww=eeee', {
		waitUntil: 'networkidle2',
		timeout: 5000
	});
	await page.evaluate(() => {
		// @ts-ignore
		const $h1 = document.querySelector('h1');
		// @ts-ignore
		const color = window.getComputedStyle($h1).getPropertyValue('color');
		// @ts-ignore
		if (color !== 'rgb(186, 219, 173)') {
			throw new Error(`style did not load correctly, was ${color}, expected rgb(186, 219, 173) `);
		}
	});
	await browser.close();
});
