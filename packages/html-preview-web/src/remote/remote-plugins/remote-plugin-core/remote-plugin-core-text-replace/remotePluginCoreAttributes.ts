import { RemotePlugin } from '../../remotePlugin'

const fixAttributeValue: (value: string | null) => string = value => {
  if (value === null) {
    return ''
  }

  if (
    (value && value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1)
  }

  return value
}

export const remotePluginCoreAttributeChange: RemotePlugin = api => {
  api.connectionProxy.onRequest<{ id: number; attribute: string; value: string }, void>(
    'attributeChange',
    payload => {
      const $node = api.nodeMap[payload.id] as HTMLElement
      $node.setAttribute(payload.attribute, fixAttributeValue(payload.value))
    }
  )
}

export const remotePluginCoreAttributeAdd: RemotePlugin = api => {
  api.connectionProxy.onRequest<{ id: number; attribute: string; value: string }, void>(
    'attributeAdd',
    payload => {
      const $node = api.nodeMap[payload.id] as HTMLElement
      $node.setAttribute(payload.attribute, fixAttributeValue(payload.value))
    }
  )
}

export const remotePluginCoreAttributeDelete: RemotePlugin = api => {
  api.connectionProxy.onRequest<{ id: number; attribute: string }, void>(
    'attributeDelete',
    payload => {
      const $node = api.nodeMap[payload.id] as HTMLElement
      $node.removeAttribute(payload.attribute)
    }
  )
}
