import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const extension = vscode.extensions.getExtension('SimonSiefke.html-preview');

export async function activateExtension() {
	await extension.activate();
}

export interface TestCase {
	input: string
	type: string
	expect: string
	only?: boolean
	speed?: number
	skip?: boolean
	timeout?: 'never' | number
}

export async function createTestFile(fileName: string, content: string = ''): Promise<void> {
	const filePath = path.join(__dirname, fileName);
	fs.writeFileSync(filePath, content);
	const uri = vscode.Uri.file(filePath);
	await vscode.window.showTextDocument(uri);
}

export async function closeTestFile(): Promise<void> {
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

export async function setText(text: string): Promise<void> {
	const {document} = vscode.window.activeTextEditor;
	const all = new vscode.Range(
		document.positionAt(0),
		document.positionAt(document.getText().length)
	);
	await vscode.window.activeTextEditor.edit(editBuilder => editBuilder.replace(all, text));
}

// export async function run(testCases: TestCase[]) {
// 	const only = testCases.filter(testCase => testCase.only);
// 	const applicableTestCases = only.length ? only : testCases;
// 	for (const testCase of applicableTestCases) {
// 		if (testCase.skip) {
// 			continue;
// 		}

// 		const cursorOffset = testCase.input.indexOf('|');
// 		const input = testCase.input.replace('|', '');
// 		await setText(input);
// 		setCursorPosition(cursorOffset);
// 		await type(testCase.type, testCase.speed || 0);
// 		const timeout = testCase.timeout === undefined ? 40 : testCase.timeout;
// 		await waitForAutoComplete(timeout);
// 		const result = getText();
// 		assert.equal(result, testCase.expect);
// 	}
// }

export function setCursorPosition(offset: number): void {
	const position = vscode.window.activeTextEditor.document.positionAt(offset);
	vscode.window.activeTextEditor.selection = new vscode.Selection(position, position);
}

async function typeLiteral(text: string): Promise<void> {
	await vscode.window.activeTextEditor.insertSnippet(
		new vscode.SnippetString(text),
		vscode.window.activeTextEditor.selection.active,
		{
			undoStopAfter: false,
			undoStopBefore: false
		}
	);
}

async function typeDelete(times: number = 1): Promise<void> {
	const offset = vscode.window.activeTextEditor.document.offsetAt(
		vscode.window.activeTextEditor.selection.active
	);
	await new Promise(async resolve => {
		await vscode.window.activeTextEditor.edit(editBuilder => {
			editBuilder.delete(
				new vscode.Range(
					vscode.window.activeTextEditor.document.positionAt(offset - times),
					vscode.window.activeTextEditor.document.positionAt(offset)
				)
			);
		});
		resolve();
	});
}

export async function type(text: string, speed = 150): Promise<void> {
	for (let i = 0; i < text.length; i++) {
		if (i === 0) {
			await new Promise(resolve => setTimeout(resolve, speed / 2));
		} else {
			await new Promise(resolve => setTimeout(resolve, speed));
		}

		if (text.slice(i).startsWith('{backspace}')) {
			await typeDelete();
			i += '{backspace}'.length - 1;
		} else if (text.slice(i).startsWith('{undo}')) {
			await vscode.commands.executeCommand('undo');
			i += '{undo}'.length - 1;
		} else if (text.slice(i).startsWith('{redo}')) {
			await vscode.commands.executeCommand('redo');
			i += '{redo}'.length - 1;
		} else if (text.slice(i).startsWith('{tab}')) {
			await vscode.commands.executeCommand('html-expand-abbreviation');
			i += '{tab}'.length - 1;
		} else if (text.slice(i).startsWith('{end}')) {
			await vscode.commands.executeCommand('cursorEnd');
			i += '{end}'.length - 1;
		} else if (text.slice(i).startsWith('{down}')) {
			await vscode.commands.executeCommand('cursorDown');
			i += '{down}'.length - 1;
		} else if (text.slice(i).startsWith('{copyLineDown}')) {
			await vscode.commands.executeCommand('editor.action.copyLinesDownAction');
			i += '{copyLineDown}'.length - 1;
		} else {
			await typeLiteral(text[i]);
		}
	}
}
