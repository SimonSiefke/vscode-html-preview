import * as fs from 'fs'
import * as path from 'path'
import { scan } from '../scanner2'
import { measureStart, measureEnd } from './measure'
import * as assert from 'assert'
import { parseHtml } from '../parse'

const fixtures = [
  fs.readFileSync(path.join(__dirname, 'fixtures/html5-spec.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/github.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/google.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/codepen.txt')).toString(),
]

scan2: {
  measureStart('scan2')
  for (const fixture of fixtures) {
    const result = scan(fixture)
    assert.equal(result.status, 'success')
  }
  measureEnd('scan2')
}

// parse1: {
//   measureStart('parse1')
//   for (const fixture of fixtures) {
//     const result = parseHtml(fixture)
//     assert.equal(result.htmlDocument !== undefined, true)
//   }
// }
