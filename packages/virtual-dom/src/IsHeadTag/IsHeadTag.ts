const HEAD_TAGS = new Set(['meta', 'title', 'link', 'style', 'base', 'script', 'noscript'])

export const isHeadTag = (tagName: string) => HEAD_TAGS.has(tagName)
