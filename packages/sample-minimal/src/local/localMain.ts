import {
  LocalPluginApi,
  localPluginCore,
  localPluginHighlight,
} from 'html-preview-web/dist/local/localMain'
import { localConnectionProxy } from './local-plugin-api/localConnectionProxy'
import { editorProxy } from './local-plugin-api/localEditorProxy'
import { previewProxy } from './local-plugin-api/localPreviewProxy'

const api: LocalPluginApi = {
  connectionProxy: localConnectionProxy,
  editorProxy,
  previewProxy,
}

localPluginCore(api)
localPluginHighlight(api)
