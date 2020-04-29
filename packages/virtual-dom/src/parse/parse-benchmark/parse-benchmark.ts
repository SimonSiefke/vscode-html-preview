import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { scan } from '../scanner2'
import { measureEnd, measureStart } from './measure'

const fixtures = [
  fs.readFileSync(path.join(__dirname, 'fixtures/html5-spec.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/github.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/google.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/codepen.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/vscode.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/soundcloud.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/riot.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/discord.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/mozilla-addons.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/mdn.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/arch-linux.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/stackoverflow.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/travis.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/wikipedia.txt')).toString(),
]

scan2: {
  measureStart('scan2')
  for (const fixture of fixtures) {
    const result = scan(fixture)
    assert.equal(result.status, 'success')
  }
  measureEnd('scan2')
}
