import { EditorProxy } from './editor-proxy/editorProxy'
import { LocalConnectionProxy } from './local-connection-proxy/localConnectionProxy'
import { PreviewProxy } from './preview-proxy/previewProxy'

export interface LocalPluginApi {
  readonly localConnectionProxy: LocalConnectionProxy
  readonly editorProxy: EditorProxy
  readonly previewProxy: PreviewProxy
}
