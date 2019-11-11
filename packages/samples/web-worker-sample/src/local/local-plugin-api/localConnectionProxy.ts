import { LocalConnectionProxy } from 'html-preview-web/dist/local/localMain'

const worker = new Worker('./dist/workerMain.js')

const waitForIdle: () => Promise<void> = () =>
  new Promise(resolve => {
    if ('requestIdleCallback' in window) {
      // @ts-ignore
      window.requestIdleCallback(() => resolve())
    } else {
      requestAnimationFrame(() => resolve())
    }
  })

const sendRequest: LocalConnectionProxy['sendRequest'] = (requestType, params) => {
  return new Promise(async (resolve, reject) => {
    const message = {
      request: {
        method: requestType,
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

export const localConnectionProxy: LocalConnectionProxy = {
  sendRequest,
}
