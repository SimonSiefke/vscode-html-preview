import { LocalConnectionProxy } from 'html-preview-web'

const worker = new Worker('/dist/workerMain.js')

const waitForIdle: () => Promise<void> = () =>
  new Promise(resolve => {
    if ('requestIdleCallback' in window) {
      window['requestIdleCallback'](() => resolve())
    } else {
      requestAnimationFrame(() => resolve())
    }
  })

export const sendRequest: LocalConnectionProxy['sendRequest'] = (requestType, params) => {
  return new Promise(async (resolve, reject) => {
    const message = {
      request: {
        method: requestType.method,
        params,
      },
    }
    await waitForIdle()
    worker.postMessage(JSON.stringify(message))
    worker.onmessage = ({ data }) => {
      const parsedData = JSON.parse(data)
      if (parsedData.error) {
        reject(parsedData.error)
      } else {
        resolve(parsedData.result)
      }
    }
  })
}

export const createLocalConnectionProxy: () => LocalConnectionProxy = () => ({
  sendRequest,
})
