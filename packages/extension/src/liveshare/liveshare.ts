import { getApi, LiveShare } from 'vsls'
import { PreviewApi } from '../services/Preview'

const shareServer = async ({ api, liveshare }: { api: PreviewApi; liveshare: LiveShare }) => {
  const sharedServer = await liveshare.shareServer({
    port: 3000,
  })
  // @ts-ignore
  api.subscriptions.push({
    dispose() {
      sharedServer.dispose()
    },
  })
}

export const useLiveShare = async api => {
  const liveshare = await getApi()
  if (api.previewState === 'open') {
    await shareServer({ api, liveshare })
  } else {
    api.onDidOpen(() => shareServer({ api, liveshare }))
  }
}
