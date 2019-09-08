import { parse } from 'url'
import * as querystring from 'querystring'

/**
 * Normalize the url, useful for storing things by url
 * @example
 * urlNormalize('http://localhost:3000') // http://localhost:3000/index.html
 */
export const urlNormalize = (url: string) => {
  if (url.endsWith('.html')) {
    return url
  }
  if (url.endsWith('/')) {
    return url + 'index.html'
  }
  return url + '/index.html'
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
 * Get the pathname of the url
 * @example
 * urlParsePathname('http://localhost:3000/index.html') // /index.html
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
export const urlParseQuery = (url: string): object => {
  const parsedUrl = parse(url)
  return querystring.parse(parsedUrl.query as string)
}
