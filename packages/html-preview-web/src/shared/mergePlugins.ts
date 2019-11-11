import { RemotePlugin } from '../remote/remote-plugins/remotePlugin'
import { LocalPlugin } from '../local/local-plugins/localPlugin'
import { WorkerPlugin } from '../worker/worker-plugins/workerPlugin'

export const mergePlugins: <T extends RemotePlugin | LocalPlugin | WorkerPlugin>(
  ...plugins: T[]
) => T = ((...plugins) => api => plugins.forEach(plugin => plugin(api))) as any
