import * as Commands from './services/Commands';

export function activate(context) {
	Commands.activate(context);
	if (process.env.NODE_ENV !== 'production') {
		import('./autoreload');
	}
}
