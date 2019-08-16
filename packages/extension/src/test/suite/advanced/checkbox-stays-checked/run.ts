import * as path from 'path';
import * as Mocha from 'mocha';

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		timeout: 1000000
	});
	mocha.useColors(true);
	mocha.bail(true);

	return new Promise((resolve, reject) => {
		mocha.addFile(path.join(__dirname, 'checkbox-stays-checked.test.js'));
		try {
			// Run the mocha test
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
