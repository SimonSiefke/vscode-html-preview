import * as fs from 'fs'

const fixture = fs.readFileSync(`${__dirname}/fixture.txt`).toString()

// const tokens = parse(fixture) //?

// if (tokens.status === 'invalid') {
//   console.log(fixture.slice(tokens.index, tokens.index + 100))
// }
