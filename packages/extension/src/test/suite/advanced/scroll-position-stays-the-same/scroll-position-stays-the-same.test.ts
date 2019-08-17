import {activateExtension} from '../../../test-util';
import * as puppeteer from 'puppeteer';
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';

const headless = false;

function getBrowser() {
	return puppeteer.launch({headless, args: ['--no-sandbox']});
}

function getUri(file) {
	return vscode.Uri.file(
		path
			.join(__dirname, 'scroll-position-stays-the-same-workspace-dist', file)
			.replace('dist', 'src')
	);
}

test('scroll position stays the same', async () => {
	await activateExtension();
	const uri = getUri('index.html');
	const document = await vscode.workspace.openTextDocument(uri);
	const text = document.getText();
	vscode.window.showTextDocument(document);
	const browser = await getBrowser();
	const page = await browser.newPage();
	await vscode.commands.executeCommand('htmlPreview.openPreview');
	await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'});
	await page.evaluate(() => {
		// @ts-ignore
		window.scrollTo(0, 1000);
		// @ts-ignore
		if (document.documentElement.scrollTop !== 1000) {
			// @ts-ignore
			throw new Error('didn\'t scroll' + document.documentElement.scrollTop);
		}
	});
	const edit = {
		rangeOffset: text.indexOf('</body'),
		rangeLength: 0,
		text: '<div class="yellow">'
	};
	const vscodeEdit = new vscode.WorkspaceEdit();
	vscodeEdit.replace(
		uri,
		new vscode.Range(
			document.positionAt(edit.rangeOffset),
			document.positionAt(edit.rangeOffset + edit.rangeLength)
		),
		edit.text
	);
	await vscode.workspace.applyEdit(vscodeEdit);
	await page.evaluate(() => {
		// @ts-ignore
		if (document.documentElement.scrollTop !== 1000) {
			// @ts-ignore
			throw new Error('scroll position changed' + document.documentElement.scrollTop);
		}
	});
	await browser.close();
});
