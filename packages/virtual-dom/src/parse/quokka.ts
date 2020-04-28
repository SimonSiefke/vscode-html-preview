import * as fs from 'fs'
import { scan } from './scanner2'

const fixture = fs.readFileSync(`${__dirname}/fixture.txt`).toString()

scan(fixture) //?
