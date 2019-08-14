import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

// const testFiles = '**/**.test.js';
// const testFiles = '**/extension.test.js';
// const testFiles = '**/extension2.test.js';
const testFiles =
	'**/generated-tests/+(basic|emmet|text-from-scratch|attribute-delete-1|useless-whitespace-change-1|useless-whitespace-change-2|attribute-change-1|attribute-change-2|basic-text-insertion|basic-element-insertion|basic-text-replace|basic-text-addition|element-addition-at-the-end|element-addition-at-the-start|text-insertion-in-nested-html|insertion-of-attribute-with-value|insertion-of-attribute-without-value).test.js';
// const testFiles = '**/generated-tests/attribute-delete-1.test.js';
// const testFiles = '**/generated-tests/insert-doctype.test.js';
// const testFiles = '**/generated-tests/bug-1.test.js';
// const testFiles = '**/generated-tests/emmet.test.js';
// const testFiles = '**/generated-tests/basic.test.js';
// const testFiles = '**/+(emmetCompleteTag|autoCloseTag).test.js'
// const testFiles = '**/+(emmetCompleteTag).test.js'
// const testFiles = '**/+(recordVideo).test.js'
// const testFiles = '**/+(emmetCompleteTag).benchmark.js'

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		timeout: 1000000
	});
	mocha.useColors(true);

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((resolve, reject) => {
		glob(testFiles, {cwd: testsRoot}, (err, files) => {
			if (err) {
				return reject(err);
			}

			// Add files to the test suite
			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

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
	});
}
