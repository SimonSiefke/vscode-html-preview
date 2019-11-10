import { LocalPluginApi } from '../local-plugin-api/localPluginApi'

export type LocalPlugin = (api: LocalPluginApi) => void
