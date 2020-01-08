const fs = require('fs-extra')
const path = require('path')
const root = path.join(__dirname, '..')
fs.copySync(path.join(root, 'package.json'), path.join(root, 'dist/package.json'))
