// export type Command<K extends keyof RemoteCommandMap> = (payload: RemoteCommandMap[K]) => void;
// export const useCommand: <T>(fn: () => T) => T = fn => fn();

import { MessageChannel } from '../messageChannel'
/**
 * maps from id to node
 */
interface NodeMap {
  [key: number]: Node
}

export interface RemotePluginApi {
  nodeMap: NodeMap
  webSocket: {
    onMessage: (command: string, listener: (payload: any) => void) => void
    broadcastMessage: (command: string, payload: any) => void
  }
  hasBody: boolean
  hasHtml: boolean
  hasHead: boolean
  virtualDom: any
  messageChannel: MessageChannel
}

export type RemotePlugin = (api: RemotePluginApi) => void

export const mergePlugins: (...plugins: RemotePlugin[]) => RemotePlugin = (...plugins) => api =>
  plugins.forEach(plugin => plugin(api))
