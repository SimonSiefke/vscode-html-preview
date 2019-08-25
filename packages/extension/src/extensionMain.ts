import * as Commands from './services/Commands';
import * as vscode from 'vscode';
import * as AutoReload from './autoreload';

export function activate(context: vscode.ExtensionContext) {
	// const fileSystemWatcher = vscode.workspace.createFileSystemWatcher(
	// 	new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], '*.{ts,js}')
	// );
	// console.log('active');
	// fileSystemWatcher.onDidChange(event => {
	// 	console.log('change');
	// });
	// fileSystemWatcher.onDidCreate(event => {
	// 	console.log('create');
	// });
	// fileSystemWatcher.onDidDelete(event => {
	// 	console.log('delete');
	// });
	Commands.activate(context);
	if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
		import('./autoreloadNew');
		console.log('autoreload');
	}
}
