const SELF_CLOSING_TAGS = new Set([
  '!DOCTYPE',
  '!doctype',
  'input',
  'br',
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export const isSelfClosingTag: (tagName: string) => boolean = tagName =>
  SELF_CLOSING_TAGS.has(tagName)
