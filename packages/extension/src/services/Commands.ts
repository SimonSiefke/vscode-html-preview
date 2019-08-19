import * as vscode from 'vscode';
import {Preview} from './Preview';

export function activate(context: vscode.ExtensionContext) {
	const registerCommand = (commandName: string, command: () => void) =>
		context.subscriptions.push(vscode.commands.registerCommand(commandName, command));
	registerCommand('htmlPreview.openPreview', async () => {
		await Preview.open();
	});
	registerCommand('htmlPreview.openWithHtmlPreview', async () => {
		await Preview.open();
	});
	registerCommand('htmlPreview.closePreviewServer', async () => {
		if (Preview.state !== 'closing' && Preview.state !== 'closed') {
			await Preview.dispose();
		}
	});
}
