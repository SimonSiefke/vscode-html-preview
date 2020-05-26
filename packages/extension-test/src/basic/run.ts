import * as path from 'path'
import * as Mocha from 'mocha'
import * as glob from 'glob'

const only = 'remove-entity'
const testFiles = `**/generated-tests/${only || '*'}.test.js`

export const run = () => {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    timeout: 1000000,
    color: true,
    bail: true,
  })

  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((resolve, reject) => {
    glob(testFiles, { cwd: testsRoot }, (err, files) => {
      if (err) {
        return reject(err)
      }

      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))

      try {
        // Run the mocha test
        mocha.run(failures => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`))
          } else {
            resolve()
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  })
}
