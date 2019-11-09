import { RemotePluginApi } from './remotePluginApi'
import { remotePluginCore } from './remote-plugins/remote-plugin-core/remotePluginCore'

console.log('hello world')

const $h1 = document.querySelector('h1') as HTMLHeadingElement
$h1.style.color = 'red'

console.log(parent)

const listeners: any[] = []

const api: RemotePluginApi = {
  messageChannel: {
    onCommand: (command, listener) => {
      listeners.push(listener)
    },
  },
}

window.addEventListener('message', event => {
  const messages = JSON.parse(event.data)
  for (const { command, payload } of messages) {
    for (const listener of listeners) {
      listener(payload)
    }
  }
})

remotePluginCore(api)
