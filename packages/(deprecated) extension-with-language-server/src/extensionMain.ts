import * as vscode from 'vscode';
import {createHtmlPreviewLanguageClient} from './services/htmlPreviewLanguageClient';

export async function activate(context: vscode.ExtensionContext) {
	await createHtmlPreviewLanguageClient(context);
}
