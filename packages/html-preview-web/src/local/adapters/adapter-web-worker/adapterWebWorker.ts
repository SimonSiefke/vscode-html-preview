// import { LocalConnectionProxy } from '../../local-plugin-api/local-connection-proxy/localConnectionProxy'

// const worker = new Worker('')

// export const sendRequest: LocalConnectionProxy['sendRequest'] = (requestType, params) => {
//   return new Promise((resolve, reject) => {
//     const message = {
//       request: {
//         method: requestType.method,
//         params,
//       },
//     }
//     worker.postMessage(JSON.stringify(message))
//     worker.onmessage = ({ data }) => {
//       const parsedData = JSON.parse(data)
//       if (parsedData.error) {
//         reject(parsedData.error)
//       } else {
//         resolve(parsedData.result)
//       }
//     }
//   })
// }
