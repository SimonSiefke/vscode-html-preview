import { urlPrettify, urlNormalize, urlParse } from './url'

// Parse url
test('parse url', () => {
  expect(urlParse('http://localhost:3000/index.html')).toEqual({
    pathname: '/index.html',
  })
})

// Normalize url
test('normalize /tmp/index.html', () => {
  expect(urlNormalize('/tmp/index.html')).toBe('/tmp/index.html')
})

test('normalize /tmp/about.html', () => {
  expect(urlNormalize('/tmp/about.html')).toBe('/tmp/about.html')
})

test('normalize /tmp', () => {
  expect(urlNormalize('/tmp')).toBe('/tmp/index.html')
})

test('normalize /tmp/', () => {
  expect(urlNormalize('/tmp/')).toBe('/tmp/index.html')
})

// Prettify url
test('prettify /tmp/index.html', () => {
  expect(urlPrettify('/tmp/index.html')).toBe('/tmp')
})

test('prettify /tmp/about.html', () => {
  expect(urlPrettify('/tmp/about.html')).toBe('/tmp/about.html')
})

test('prettify /tmp', () => {
  expect(urlPrettify('/tmp')).toBe('/tmp')
})

test('prettify /tmp/', () => {
  expect(urlPrettify('/tmp/')).toBe('/tmp')
})
