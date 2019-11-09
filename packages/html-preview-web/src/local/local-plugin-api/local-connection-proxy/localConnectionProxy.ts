import { RequestType } from '../../../shared/requestType'

export interface LocalConnectionProxy {
  readonly sendRequest: <Params, Result>(
    requestType: RequestType<Params, Result>,
    params: Params
  ) => Promise<Result>
}

export const createLocalConnectionProxy: ({
  sendRequest,
}: {
  sendRequest: LocalConnectionProxy['sendRequest']
}) => LocalConnectionProxy = ({ sendRequest }) => {
  return {
    sendRequest,
  }
}
