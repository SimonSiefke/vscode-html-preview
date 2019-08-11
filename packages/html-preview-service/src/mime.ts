import * as mimeLibrary from 'mime-types';

export const mime = {
	getType: (path: string) => mimeLibrary.lookup(path) || 'text/plain'
};
