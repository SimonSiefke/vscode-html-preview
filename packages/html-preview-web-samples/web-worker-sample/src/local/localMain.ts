import { LocalPluginApi, localPluginInit, localPluginUpdateOnChange } from 'html-preview-web'
import { createLocalConnectionProxy } from './local-plugin-api/localConnectionProxy'
import { createEditorProxy } from './local-plugin-api/localEditorProxy'
import { createPreviewProxy } from './local-plugin-api/localPreviewProxy'

const api: LocalPluginApi = {
  connectionProxy: createLocalConnectionProxy(),
  editorProxy: createEditorProxy(),
  previewProxy: createPreviewProxy(),
}

localPluginInit(api)
localPluginUpdateOnChange(api)
