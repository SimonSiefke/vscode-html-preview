import * as fs from 'fs'
import { scan } from './scanner2'

const fixture = fs.readFileSync(`${__dirname}/fixture.txt`).toString()

const tokens = scan(fixture) //?

if (tokens.status === 'invalid') {
  console.log(fixture.slice(tokens.index, tokens.index + 100))
}
