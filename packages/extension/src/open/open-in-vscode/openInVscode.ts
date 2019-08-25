import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {config} from '../../config';

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
	const html = fs
		.readFileSync(
			path.join(config.root, 'packages/extension/src/open/open-in-vscode/openInVscode.html'),
			'utf-8'
		)
		.replace(/http:\/\/localhost:3000/g, 'http://localhost:3000/' + relativePath);
	webViewPanel.webview.html = html;
};
