import { RemotePluginApi } from '../remote-plugin-api/remotePluginApi'

export type RemotePlugin = (api: RemotePluginApi) => void
