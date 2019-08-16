import * as path from 'path';
import * as fs from 'fs-extra';
import {runTests} from 'vscode-test';

const extensionRoot = path.join(__dirname, '../../');

interface Test {
	testPath: string
	workspace: string
}

async function run(test: Test) {
	const workspacePathSrc = path.join(extensionRoot, `src/test/suite/${test.workspace}`);
	const workspacePathDist = path.join(extensionRoot, `src/test/suite/${test.workspace}-dist`);
	await fs.copy(workspacePathSrc, workspacePathDist);
	const extensionTestsPath = path.join(__dirname, test.testPath);
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// Download VS Code, unzip it and run the integration test
		await runTests({
			version: '1.37.0',
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: ['--disable-extensions', workspacePathDist]
		});
	} catch (err) {
		console.error('Failed to run tests :(');
		process.exit(1);
	}
}

const tests: Test[] = [
	{
		workspace: 'basic/basic-test-workspace',
		testPath: 'suite/index'
	},
	{
		workspace: 'advanced/checkbox-stays-checked/checkbox-stays-checked-workspace',
		testPath: 'suite/advanced/checkbox-stays-checked/run'
	},
	{
		workspace: 'advanced/scroll-position-stays-the-same/scroll-position-stays-the-same-workspace',
		testPath: 'suite/advanced/scroll-position-stays-the-same/run'
	}
];
(async () => {
	for (const test of tests) {
		await run(test);
	}
})();
