import { WorkerPlugin } from '../workerPlugin'
import { mergePlugins } from '../../../shared/mergePlugins'
import { workerPluginGetDiffs } from './worker-plugin-get-diffs/workerPluginGetDiffs'
import { workerPluginGetGeneratedHtml } from './worker-plugin-get-generated-html/workerPluginGenerateHtml'

export const workerPluginCore: WorkerPlugin = mergePlugins(
  workerPluginGetDiffs,
  workerPluginGetGeneratedHtml
)
