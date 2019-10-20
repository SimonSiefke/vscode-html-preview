export interface MessageChannel {
  onMessage: (command: string, listener: (payload: any) => void) => void
  broadcastMessage: (command: string, payload: any) => void
}

export const createMessageChannel: () => MessageChannel = () => {
  const listeners: { [command: string]: any[] } = {}
  return {
    onMessage: (command: string, listener: (payload: any) => void) => {
      listeners[command] = listeners[command] || []
      listeners[command].push(listener)
    },
    broadcastMessage: (command: string, payload: any) => {
      if (!listeners[command]) {
        return
      }
      for (const listener of listeners[command]) {
        listener(payload)
      }
    },
  }
}
