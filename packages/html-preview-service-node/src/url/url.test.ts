import { urlPrettify, urlParseQuery, urlParseHtmlPathname } from './url'

// Parse html pathname
test('Parse html pathname - /tmp/index.html', () => {
  expect(urlParseHtmlPathname('/tmp/index.html')).toBe('/tmp/index.html')
})

test('Parse html pathname - /tmp/about.html', () => {
  expect(urlParseHtmlPathname('/tmp/about.html')).toBe('/tmp/about.html')
})

test.skip('Parse html pathname - /tmp', () => {
  expect(urlParseHtmlPathname('/tmp')).toBe('/tmp/index.html')
})

test('Parse html pathname - /tmp/', () => {
  expect(urlParseHtmlPathname('/tmp/')).toBe('/tmp/index.html')
})

// Prettify
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
