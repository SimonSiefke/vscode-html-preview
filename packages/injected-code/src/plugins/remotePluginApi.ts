// export type Command<K extends keyof RemoteCommandMap> = (payload: RemoteCommandMap[K]) => void;
// export const useCommand: <T>(fn: () => T) => T = fn => fn();

interface NodeMap {
  [key: number]: HTMLElement | Text | Comment | DocumentType | Document
}

export interface RemotePluginApi {
  nodeMap: NodeMap
  webSocket: {
    onMessage: (command: string, listener: (payload: any) => void) => void
  }
  hasBody: boolean
  hasHtml: boolean
  hasHead: boolean
  virtualDom: any
  messageChannel: {
    onMessage: (command: string, listener: (payload: any) => void) => void
    broadcastMessage: (command: string, payload: any) => void
  }
}

export type RemotePlugin = (api: RemotePluginApi) => void

export const mergePlugins: (...plugins: RemotePlugin[]) => RemotePlugin = (...plugins) => api =>
  plugins.forEach(plugin => plugin(api))
