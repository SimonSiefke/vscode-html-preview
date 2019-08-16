import * as path from 'path';
import * as Mocha from 'mocha';

const fileName = 'scroll-position-stays-the-same.test.js';

export function run(): Promise<void> {
	const mocha = new Mocha({
		ui: 'tdd',
		timeout: 1000000
	});
	mocha.useColors(true);
	mocha.bail(true);

	return new Promise((resolve, reject) => {
		mocha.addFile(path.join(__dirname, fileName));
		try {
			mocha.run(failures => {
				if (failures > 0) {
					reject(new Error(`${failures} tests failed.`));
				} else {
					resolve();
				}
			});
		} catch (err) {
			reject(err);
		}
	});
}
