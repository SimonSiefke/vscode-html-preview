import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

// const testFiles = '**/**.test.js';
// const testFiles = '**/extension.test.js';
// const testFiles = '**/extension2.test.js';
const failing = [
	'replace-element-with-text.test.txt',
	'delete-first-element-node.test.txt',
	'delete-element-before-element.test.txt',
	'delete-text-before-text.test.txt',
	'delete-text-after-element.test.txt',
	'delete-element-before-text.test.txt',
	'delete-011-delete-text-between-element-and-element.test.txt',
	'delete-020-delete-text-between-comment-and-text.test.txt',
	'delete-021-delete-text-between-comment-and-element.test.txt',
	'delete-100-delete-element-between-text-and-text.test.txt',
	'delete-110-delete-element-between-element-and-text.test.txt',
	'delete-111-delete-element-between-element-and-element.test.txt',
	'delete-112-delete-element-between-element-and-comment.test.txt',
	'delete-120-delete-element-between-comment-and-text.test.txt',
	'delete-121-delete-element-between-comment-and-element.test.txt',
	'delete-122-delete-element-between-comment-and-comment.test.txt',
	'delete-200-delete-comment-between-text-and-text.test.txt',
	'delete-210=delete-comment-between-element-and-text.test.txt',
	'delete-211-delete-comment-between-element-and-element.test.txt',
	'delete-212-delete-comment-between-element-and-comment.test.txt',
	'delete-220-delete-comment-between-comment-and-text.test.txt',
	'delete-221-delete-comment-between-comment-and-element.test.txt',
	'delete-222-delete-comment-between-comment-and-comment.test.txt'
]; // TODO
const testFileNames = [
	'basic.test.txt',
	'emmet.test.txt',
	'text-from-scratch.test.txt',
	'attribute-delete-1.test.txt',
	'useless-whitespace-change-1.test.txt',
	'useless-whitespace-change-2.test.txt',
	'attribute-change-1.test.txt',
	'attribute-change-2.test.txt',
	'basic-text-insertion.test.txt',
	'basic-element-insertion.test.txt',
	'basic-text-replace.test.txt',
	'basic-text-addition.test.txt',
	'element-addition-at-the-end.test.txt',
	'element-addition-at-the-start.test.txt',
	'text-insertion-in-nested-html.test.txt',
	'insertion-of-attribute-with-value.test.txt',
	'insertion-of-attribute-without-value.test.txt',
	'insertion-of-multiple-elements-and-text-nodes.test.txt',
	'attribute-name-change.test.txt',
	'attribute-value-insertion-at-the-end.test.txt',
	'attribute-value-replacement.test.txt',
	'replace-text-with-element.test.txt',
	'basic-replace-text-#1.test.txt',
	'basic-replace-text-#2.test.txt',
	'replace-element-with-text.test.txt',
	'replace-text-inside-element-with-attributes.test.txt',
	'delete-first-element-node.test.txt',
	'delete-element-before-element.test.txt',
	'delete-text-before-text.test.txt',
	'delete-text-after-text.test.txt',
	'delete-text-before-element.test.txt',
	'delete-text-after-element.test.txt',
	'delete-element-before-text.test.txt',
	'delete-000-delete-text-between-text-and-text.test.txt',
	'delete-001-delete-text-between-text-and-element.test.txt',
	'delete-002-delete-text-between-text-and-comment.test.txt',
	'delete-011-delete-text-between-element-and-element.test.txt',
	'delete-020-delete-text-between-comment-and-text.test.txt',
	'delete-021-delete-text-between-comment-and-element.test.txt',
	'delete-100-delete-element-between-text-and-text.test.txt',
	'delete-101-delete-element-between-text-and-element.test.txt',
	'delete-102-delete-element-between-text-and-comment.test.txt',
	'delete-110-delete-element-between-element-and-text.test.txt',
	'delete-111-delete-element-between-element-and-element.test.txt',
	'delete-112-delete-element-between-element-and-comment.test.txt',
	'delete-120-delete-element-between-comment-and-text.test.txt',
	'delete-121-delete-element-between-comment-and-element.test.txt',
	'delete-122-delete-element-between-comment-and-comment.test.txt',
	'delete-200-delete-comment-between-text-and-text.test.txt',
	'delete-201-delete-comment-between-text-and-element.test.txt',
	'delete-202-delete-comment-between-text-and-comment.test.txt',
	'delete-210=delete-comment-between-element-and-text.test.txt',
	'delete-211-delete-comment-between-element-and-element.test.txt',
	'delete-212-delete-comment-between-element-and-comment.test.txt',
	'delete-220-delete-comment-between-comment-and-text.test.txt',
	'delete-221-delete-comment-between-comment-and-element.test.txt',
	'delete-222-delete-comment-between-comment-and-comment.test.txt',
	'insert-000-insert-text-between-text-and-text.test.txt',
	'insert-001-insert-text-between-text-and-element.test.txt'
].filter(t => !failing.includes(t));

const only = undefined;
const testFiles = `**/generated-tests/+(${only ||
	testFileNames.map(fileName => fileName.replace('.test.txt', '')).join('|')}).test.js`;
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
