import { urlPrettify, urlNormalize, urlParse } from './url'

// Parse url
test.skip('parse url', () => {
  expect(urlParse('http://localhost:3000/index.html')).toEqual({
    pathname: '/index.html',
  })
})

// Normalize url
test.skip('normalize /tmp/index.html', () => {
  expect(urlNormalize('/tmp/index.html')).toBe('/tmp/index.html')
})

test('normalize /tmp/about.html', () => {
  expect(urlNormalize('/tmp/about.html')).toBe('/tmp/about.html')
})

test.skip('normalize /tmp', () => {
  expect(urlNormalize('/tmp')).toBe('/tmp/index.html')
})

test.skip('normalize /tmp/', () => {
  expect(urlNormalize('/tmp/')).toBe('/tmp/index.html')
})

// Prettify url
test.skip('prettify /tmp/index.html', () => {
  expect(urlPrettify('/tmp/index.html')).toBe('/tmp')
})

test.skip('prettify /tmp/about.html', () => {
  expect(urlPrettify('/tmp/about.html')).toBe('/tmp/about.html')
})

test.skip('prettify /tmp', () => {
  expect(urlPrettify('/tmp')).toBe('/tmp')
})

test.skip('prettify /tmp/', () => {
  expect(urlPrettify('/tmp/')).toBe('/tmp')
})
