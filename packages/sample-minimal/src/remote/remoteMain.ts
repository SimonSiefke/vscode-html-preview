import {
  RemotePluginApi,
  remotePluginCore,
  remotePluginHighlight,
} from 'html-preview-web/dist/remote/remoteMain'
import { remoteConnectionProxy } from './remote-plugin-api/remoteConnectionProxy'

const api: RemotePluginApi = {
  connectionProxy: remoteConnectionProxy,
}

remotePluginCore(api)
remotePluginHighlight(api)
