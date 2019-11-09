export interface RemotePluginApi {
  messageChannel: {
    onCommand: (command: string, listener: (payload: any) => void) => void
  }
}
