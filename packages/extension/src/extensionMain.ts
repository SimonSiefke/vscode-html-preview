import * as Commands from './services/Commands';
import * as vscode from 'vscode';
import * as AutoReload from './autoreload';
import {localize} from './localize';

export function activate(context: vscode.ExtensionContext) {
	console.log('activate');
	Commands.activate(context);
	if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
		AutoReload.activate(context);
	}
}
