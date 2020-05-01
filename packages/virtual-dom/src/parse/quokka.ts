import * as fs from 'fs'
import { scan } from './scanner2'
import { parse } from './parse2'

const fixture = fs.readFileSync(`${__dirname}/fixture.txt`).toString()

// const tokens = parse(fixture) //?

// if (tokens.status === 'invalid') {
//   console.log(fixture.slice(tokens.index, tokens.index + 100))
// }
