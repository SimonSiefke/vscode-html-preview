import { RemotePluginApi, remotePluginCore } from 'html-preview-web'
import { createRemoteConnectionProxy } from './remote-plugin-api/remoteConnectionProxy'

const api: RemotePluginApi = {
  connectionProxy: createRemoteConnectionProxy(),
}

remotePluginCore(api)
