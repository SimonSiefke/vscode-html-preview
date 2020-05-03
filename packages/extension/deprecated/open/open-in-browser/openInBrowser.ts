import * as vscode from 'vscode'
import * as path from 'path'
import { openInBrowser as open } from 'html-preview-service-node'

export const openInBrowser = async ({ relativePath }: { relativePath: string }) => {
  const url = path.join('http://localhost:3000', relativePath)
  try {
    await open(url)
  } catch (error) {
    vscode.window.showErrorMessage('failed to open in browser')
    throw error
  }
}
