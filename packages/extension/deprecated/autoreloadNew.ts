import * as http from 'http'
import * as vscode from 'vscode'

vscode.commands.executeCommand('htmlPreview.openPreview')

const server = http
  .createServer((req, res) =>
    res.end(() =>
      server.close(() => vscode.commands.executeCommand('workbench.action.reloadWindow'))
    )
  )
  .listen(7575)
