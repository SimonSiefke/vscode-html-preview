const ONLY_HEAD_TAGS = new Set(['base']) // TODO title is allowed inside body but only in svg

export const isBodyTag = (tagName: string) => !ONLY_HEAD_TAGS.has(tagName)
