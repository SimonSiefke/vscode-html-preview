const fs = require('fs-extra')
const path = require('path')

const root = path.join(__dirname, '..')
const samples = ['minimal-sample', 'web-worker-sample']

fs.ensureDirSync(path.join(root, 'website'))
fs.ensureDirSync(path.join(root, 'website/samples'))

for (const sample of samples) {
  fs.ensureDirSync(path.join(root, `website/samples/${sample}`))
  fs.copySync(
    path.join(root, `packages/html-preview-web-samples/${sample}/index.html`),
    path.join(root, `website/samples/${sample}/index.html`)
  )
  fs.copySync(
    path.join(root, `packages/html-preview-web-samples/${sample}/dist`),
    path.join(root, `website/samples/${sample}/dist`)
  )
}
