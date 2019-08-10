import * as vscode from 'vscode';
import {WebSocketServer} from 'html-preview-service';

export interface LocalPluginApi {
	vscode: {
		Selection: typeof vscode.Selection
		window: {
			onDidChangeActiveTextEditor: (listener: (event: vscode.TextEditor) => void) => void
			onDidChangeTextEditorSelection: (
				listener: (event: vscode.TextEditorSelectionChangeEvent) => void
			) => void
			activeTextEditor: vscode.TextEditor | undefined
		}
		workspace: {
			onDidChangeTextDocument: (event: any) => any
			asRelativePath: (uri: any) => any
		}
	}
	// parser: ReturnType<typeof import('virtual-dom').createParser>
	parser: any
	diff: typeof import('virtual-dom').diff
	webSocketServer: WebSocketServer
}

export type LocalPlugin = (api: LocalPluginApi) => void;
