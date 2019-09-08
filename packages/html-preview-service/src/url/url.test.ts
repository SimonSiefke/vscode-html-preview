import { urlPrettify, urlNormalize, urlParsePathname, urlParseQuery } from './url'

// Parse pathname
test('Parse pathname - http://localhost:3000/index.html', () => {
  expect(urlParsePathname('http://localhost:3000/index.html')).toEqual('/index.html')
})

// Normalize url
test('Normalize - /tmp/index.html', () => {
  expect(urlNormalize('/tmp/index.html')).toBe('/tmp/index.html')
})

test('Normalize - /tmp/about.html', () => {
  expect(urlNormalize('/tmp/about.html')).toBe('/tmp/about.html')
})

test('Normalize - /tmp', () => {
  expect(urlNormalize('/tmp')).toBe('/tmp/index.html')
})

test('Normalize - /tmp/', () => {
  expect(urlNormalize('/tmp/')).toBe('/tmp/index.html')
})

// Prettify url
test('Prettify url - /tmp/index.html', () => {
  expect(urlPrettify('/tmp/index.html')).toBe('/tmp')
})

test('Prettify url - /tmp/about.html', () => {
  expect(urlPrettify('/tmp/about.html')).toBe('/tmp/about.html')
})

test('Prettify url - /tmp', () => {
  expect(urlPrettify('/tmp')).toBe('/tmp')
})

// Parse Query
test('Parse query - http://localhost:3000?relativePath=/index.html', () => {
  expect(urlParseQuery('http://localhost:3000?relativePath=/index.html')).toEqual({
    relativePath: '/index.html',
  })
})
