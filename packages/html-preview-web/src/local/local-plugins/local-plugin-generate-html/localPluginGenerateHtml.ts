// import { LocalPlugin } from '../localPlugin'
// import { LocalPluginApi } from '../../local-plugin-api/localPluginApi'
// import { createRequestType } from '../../../shared/requestType'
// import { Thenable } from '../../../shared/thenable'

// type Params = { text: string }
// type Result = string

// const askWorkerForGeneratedHtml: (api: LocalPluginApi, params: Params) => Thenable<Result> = async (
//   api,
//   params
// ) => {
//   return api.localConnectionProxy.sendRequest(requestTypeGetGeneratedHtml, params)
// }

// const localPluginInitialHtml: LocalPlugin = async api => {
//   const initialText = api.editorProxy.getText()
//   const initialHtml = await askWorkerForGeneratedHtml(api, { text: initialText })
//   await api.previewProxy.setHtml(initialHtml)
// }
