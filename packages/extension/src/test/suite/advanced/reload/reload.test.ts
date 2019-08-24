import {activateExtension} from '../../../test-util';
import * as puppeteer from 'puppeteer';
import * as vscode from 'vscode';
import * as path from 'path';

const headless = true;

function getBrowser() {
	return puppeteer.launch({headless, args: ['--no-sandbox']});
}

function getUri(file) {
	return vscode.Uri.file(path.join(__dirname, 'reload-workspace-dist', file).replace('dist', 'src'));
}

test('reloading works', async () => {
	await activateExtension();
	const uri = getUri('index.html');
	const document = await vscode.workspace.openTextDocument(uri);
	await vscode.window.showTextDocument(document);
	const browser = await getBrowser();
	const page = await browser.newPage();
	page.on('dialog', () => {
		console.error('did not expect alert');
		// process.exit(1);
	});
	await vscode.commands.executeCommand('htmlPreview.openPreview');
	await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'});

	const checkContentEmpty = () =>
		page.evaluate(() => {
			// @ts-ignore
			const content = document.body.innerHTML.replace(/ data-id="\d+"/g, '');
			if (content !== '\n') {
				throw new Error('invalid content, expected , got ' + content);
			}
		});
	const checkContentH1 = () =>
		page.evaluate(() => {
			// @ts-ignore
			const content = document.body.innerHTML.replace(/ data-id="\d+"/g, '');
			if (content !== '<h1>hello world</h1>\n') {
				throw new Error('invalid content, expected' + '<h1>hello world</h1>\n' + 'got' + content);
			}
		});
	const edit = {
		rangeOffset: 0,
		rangeLength: '<h1>hello world</h1>'.length,
		text: ''
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
	await checkContentEmpty();
	const nextEdit = {
		rangeOffset: 0,
		rangeLength: 0,
		text: '<h1>hello world</h1>'
	};
	const nextVscodeEdit = new vscode.WorkspaceEdit();
	nextVscodeEdit.replace(
		uri,
		new vscode.Range(
			document.positionAt(nextEdit.rangeOffset),
			document.positionAt(nextEdit.rangeOffset + nextEdit.rangeLength)
		),
		nextEdit.text
	);
	await vscode.workspace.applyEdit(nextVscodeEdit);

	await checkContentH1();
	await page.reload({waitUntil: 'networkidle2'});
	await checkContentH1();
	await browser.close();
});
