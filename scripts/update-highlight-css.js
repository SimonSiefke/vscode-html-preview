const path = require('path')
const fs = require('fs')
const root = path.join(__dirname, '..')

const highlightCss = fs.readFileSync(
  path.join(
    root,
    'packages/injected-code/src/plugins/remote-plugin-highlight/highlight-service/highlight.min.css'
  ),
  'utf-8'
)
let highlightTs = fs.readFileSync(
  path.join(
    root,
    'packages/injected-code/src/plugins/remote-plugin-highlight/highlight-service/highlightServiceMain.ts'
  ),
  'utf-8'
)

const baseStyleBlockRe = /const baseStyle =\s*'(.*?)'/

if (!baseStyleBlockRe.test(highlightTs)) {
  throw new Error('script does not work')
}

highlightTs = highlightTs.replace(baseStyleBlockRe, `const baseStyle = '${highlightCss}'`)

fs.writeFileSync(
  path.join(
    root,
    'packages/injected-code/src/plugins/remote-plugin-highlight/highlight-service/highlightServiceMain.ts'
  ),
  highlightTs
)

console.log('success')
