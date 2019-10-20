import * as path from 'path'
import * as fs from 'fs-extra'
import { runTests } from 'vscode-test'

const extensionRoot = path.join(__dirname, '../../')
const vscodeVersion = '1.39.0'
interface Test {
  testPath: string
  workspace: string
}

async function run(test: Test) {
  const workspacePathSrc = path.join(extensionRoot, `src/test/suite/${test.workspace}`)
  const workspacePathDist = path.join(extensionRoot, `src/test/suite/${test.workspace}-dist`)
  await fs.copy(workspacePathSrc, workspacePathDist)
  const extensionTestsPath = path.join(__dirname, test.testPath)
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../')

    // Download VS Code, unzip it and run the integration test
    await runTests({
      version: vscodeVersion,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ['--disable-extensions', workspacePathDist],
    })
  } catch (err) {
    console.error('Failed to run tests :(')
    process.exit(1)
  }
}

const tests: Test[] = [
  {
    workspace: 'basic/basic-test-workspace',
    testPath: 'suite/index',
  },
  {
    workspace: 'advanced/checkbox-stays-checked/checkbox-stays-checked-workspace',
    testPath: 'suite/advanced/checkbox-stays-checked/run',
  },
  {
    workspace: 'advanced/scroll-position-stays-the-same/scroll-position-stays-the-same-workspace',
    testPath: 'suite/advanced/scroll-position-stays-the-same/run',
  },
  {
    workspace: 'advanced/with-external-assets/with-external-assets-workspace',
    testPath: 'suite/advanced/with-external-assets/run',
  },
  {
    workspace: 'advanced/with-query-string/with-query-string-workspace',
    testPath: 'suite/advanced/with-query-string/run',
  },
  {
    workspace: 'advanced/reload/reload-workspace',
    testPath: 'suite/advanced/reload/run',
  },
  {
    workspace: 'advanced/down-up-down-up/down-up-down-up-workspace',
    testPath: 'suite/advanced/down-up-down-up/run',
  },
]
;(async () => {
  for (const test of tests) {
    await run(test)
  }
})()
