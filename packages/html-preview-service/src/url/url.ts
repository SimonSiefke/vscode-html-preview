import { parse } from 'url'
import * as querystring from 'querystring'

export const urlNormalize = (url: string) => {
  if (url.endsWith('.html')) {
    return url
  }
  if (url.endsWith('/')) {
    return url + 'index.html'
  }
  return url + '/index.html'
}

export const urlPrettify = (url: string) => url

export const urlParse = (url: string): { pathname: string; query: object } => {
  const parsedUrl = parse(url)
  return {
    pathname: parsedUrl.pathname as string,
    query: parsedUrl.query ? querystring.parse(parsedUrl.query) : {},
  }
}
