import * as http from 'http';
import * as vscode from 'vscode';

function afterActivate() {
	vscode.commands.executeCommand('htmlPreview.openPreview');
}

function clearRequireCache() {
	Object.keys(require.cache).forEach(key => {
		delete require.cache[key];
	});
}

export function activate(context: vscode.ExtensionContext) {
	afterActivate();
	let busy = false;
	const server = http
		.createServer((req, res) => {
			if (busy) {
				res.end();
				return;
			}

			busy = true;
			let data = '';
			req.on('data', chunk => {
				data += chunk;
			});
			req.on('end', () => {
				res.end();
				context.subscriptions.forEach(subscription => subscription.dispose());
				clearRequireCache();
				eval(data);
				console.log('---------------------------');
				console.log('---reactivated extension---');
				console.log('---------------------------');
				exports.activate(context);
				vscode.window.showInformationMessage('extension was reloaded');
				server.close();
				setTimeout(() => {
					activate(context);
				}, 30);
			});
		})
		.listen(7575);
}
