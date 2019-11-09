import { RemoteConnectionProxy } from './remote-connection-proxy/remoteConnectionProxy'

export interface RemotePluginApi {
  readonly connectionProxy: RemoteConnectionProxy
  nodeMap?: any
}
