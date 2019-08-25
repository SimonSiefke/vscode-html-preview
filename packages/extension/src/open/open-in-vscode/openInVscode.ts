import * as vscode from 'vscode';
import {html} from './openInVscode.html';

export const openInVscode = ({relativePath}: {relativePath: string}) => {
	const webViewPanel = vscode.window.createWebviewPanel(
		'lll',
		'Html preview',
		{
			preserveFocus: true,
			viewColumn: vscode.ViewColumn.Beside
		},
		{
			enableScripts: true,
			enableCommandUris: true
		}
	);
	const webViewHtml = html.replace(
		/http:\/\/localhost:3000/g,
		'http://localhost:3000/' + relativePath
	);
	webViewPanel.webview.html = webViewHtml;
};
