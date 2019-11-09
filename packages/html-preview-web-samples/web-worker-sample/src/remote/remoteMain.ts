import { RemotePluginApi, remotePluginTextReplace, remotePluginHydrate } from 'html-preview-web'
import { createRemoteConnectionProxy } from './remote-plugin-api/remoteConnectionProxy'

const api: RemotePluginApi = {
  connectionProxy: createRemoteConnectionProxy(),
}

remotePluginHydrate(api)
remotePluginTextReplace(api)
