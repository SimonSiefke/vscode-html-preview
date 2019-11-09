import { LocalPluginApi } from './local-plugin-api/localPluginApi'
import { createEditorProxy } from './local-plugin-api/editor-proxy/editorProxy'
import { createLocalConnectionProxy } from './local-plugin-api/local-connection-proxy/localConnectionProxy'
import { createPreviewProxy } from './local-plugin-api/preview-proxy/previewProxy'
import { localPluginCore } from './local-plugins/local-plugin-core/localPluginCore'
import { adapterWeb } from './adapters/adapter-web/adapterWeb'

const api: LocalPluginApi = {
  editorProxy: createEditorProxy(),
  localConnectionProxy: createLocalConnectionProxy(adapterWeb),
  previewProxy: createPreviewProxy(),
}

localPluginCore(api)
