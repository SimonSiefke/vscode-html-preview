const fs = require('fs-extra')
const path = require('path')

const root = path.join(__dirname, '..')
const samples = fs.readdirSync(path.join(root, 'packages/samples'))

fs.ensureDirSync(path.join(root, 'website'))
fs.ensureDirSync(path.join(root, 'website/samples'))

for (const sample of samples) {
  fs.ensureDirSync(path.join(root, `website/samples/${sample}`))
  fs.copySync(
    path.join(root, `packages/samples/${sample}/index.html`),
    path.join(root, `website/samples/${sample}/index.html`)
  )
  fs.copySync(
    path.join(root, `packages/samples/${sample}/dist`),
    path.join(root, `website/samples/${sample}/dist`)
  )
  if (['minimal-sample', 'web-worker-sample'].includes(sample)) {
    fs.removeSync(path.join(root, `website/samples/${sample}/dist/remoteMain.js`))
    fs.removeSync(path.join(root, `website/samples/${sample}/dist/remoteMain.js.map`))
  }
}

const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <ul>
${samples
  .map(sample => ' '.repeat(6) + `<li><a href="/samples/${sample}">${sample}</a></li>`)
  .join('\n')}
    </ul>
  </body>
</html>
`.trimLeft()
fs.writeFileSync(path.join(root, 'website/index.html'), html)
