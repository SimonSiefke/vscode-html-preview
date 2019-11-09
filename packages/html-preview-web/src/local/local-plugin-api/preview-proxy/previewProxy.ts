import { Thenable } from '../../../shared/thenable'

export interface PreviewProxy {
  readonly setHtml: (html: string) => Thenable<void>
  readonly sendMessage: (message: string) => Thenable<void>
}
