import { LocalConnectionProxy } from 'html-preview-web'

const worker = new Worker('/dist/workerMain.js')

export const sendRequest: LocalConnectionProxy['sendRequest'] = (requestType, params) => {
  return new Promise((resolve, reject) => {
    const message = {
      request: {
        method: requestType.method,
        params,
      },
    }
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
