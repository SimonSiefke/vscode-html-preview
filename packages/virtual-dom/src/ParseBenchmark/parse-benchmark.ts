import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from '../Parse/Parse'
import { scan } from '../Scanner/Scanner'
import { measureEnd, measureStart } from './measure'

const fixtures = [
  fs.readFileSync(path.join(__dirname, 'fixtures/html5-spec.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/google.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/codepen.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/vscode.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/soundcloud.txt')).toString(),
  // fs.readFileSync(path.join(__dirname, 'fixtures/riot.txt')).toString(), // invalid because of img inside head
  fs.readFileSync(path.join(__dirname, 'fixtures/discord.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/mozilla-addons.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/mdn.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/arch-linux.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/stackoverflow.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/travis.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/wikipedia.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/ubuntu.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/vue-docs.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/gatsby.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/next.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/intellij.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/netlify.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/syntax.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/deno.txt')).toString(),
  fs.readFileSync(path.join(__dirname, 'fixtures/postcss.txt')).toString(),
  // fs.readFileSync(path.join(__dirname, 'fixtures/whatwg-example.txt')).toString(),
  // fs.readFileSync(path.join(__dirname, 'fixtures/dev.txt')).toString(), // TODO
  // fs.readFileSync(path.join(__dirname, 'fixtures/json.txt')).toString(), // TODO
  // fs.readFileSync(path.join(__dirname, 'fixtures/whatwg.txt')).toString(), // TODO
]

scan2: {
  measureStart('scan2')
  for (const fixture of fixtures) {
    const result = scan(fixture)
    assert.equal(result.status, 'success')
  }
  measureEnd('scan2')
}

parse2: {
  measureStart('parse2')
  for (const fixture of fixtures) {
    const result = parse(
      fixture,
      (() => {
        let id = 0
        return () => id++
      })()
    )
    assert.equal(result.status, 'success')
  }
  measureEnd('parse2')
}
