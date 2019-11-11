import { parse } from 'url'
import * as querystring from 'querystring'

/**
 * Normalize the url, useful for storing things by url
 * @example
 * urlParseHtmlPathname('http://localhost:3000/') // /index.html
 */
export const urlParseHtmlPathname = (url: string): string | undefined => {
  const pathname = parse(url).pathname as string
  if (pathname.endsWith('.html')) {
    return pathname
  }
  if (pathname.endsWith('/')) {
    return pathname + 'index.html'
  }
  // TODO if url is http://localhost:3000/.hidden is file or folder requested?
  return undefined
}

/**
 * Prettifies the url, useful when opening it in the browser
 * @example urlPrettify('http://localhost:3000/index.html') // http://localhost:3000
 */
export const urlPrettify = (url: string) => {
  if (url.endsWith('/index.html')) {
    return url.slice(0, -'/index.html'.length)
  }
  return url
}

/**
 * Get the relative path of the url
 * @example
 * urlRelativePath('http://localhost:3000/index.html') // /index.html
 */
export const urlParsePathname = (url: string): string => {
  const parsedUrl = parse(url)
  return parsedUrl.pathname as string
}

/**
 * Get the query of the url
 * @example
 * urlParseQuery('http://localhost:3000?relativePath=http://localhost:3000/index.html') // { relativePath: '/index.html' }
 */
export const urlParseQuery = (url: string): any => {
  const parsedUrl = parse(url)
  return querystring.parse(parsedUrl.query as string)
}
