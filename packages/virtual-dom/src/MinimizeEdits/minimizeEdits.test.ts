import { minimizeEdits } from './MinimizeEdits'

test('empty', () => {
  expect(minimizeEdits('', [])).toEqual([])
})

test('replace at start', () => {
  expect(
    minimizeEdits('hello world', [
      {
        rangeOffset: 0,
        rangeLength: 5,
        text: 'hello',
      },
    ])
  ).toEqual([])
})

test('replace at end', () => {
  expect(
    minimizeEdits('hello world', [
      {
        rangeOffset: 6,
        rangeLength: 5,
        text: 'world',
      },
    ])
  ).toEqual([])
})

test('partial replace', () => {
  expect(
    minimizeEdits('hello', [
      {
        rangeOffset: 0,
        rangeLength: 5,
        text: 'hi',
      },
    ])
  ).toEqual([
    {
      rangeOffset: 1,
      rangeLength: 4,
      text: 'i',
    },
  ])
})

test('multiple edits', () => {
  expect(
    minimizeEdits('hello world', [
      {
        rangeOffset: 0,
        rangeLength: 5,
        text: 'hello',
      },
      {
        rangeOffset: 6,
        rangeLength: 5,
        text: 'world',
      },
    ])
  ).toEqual([])
})

test('bug 1', () => {
  expect(
    minimizeEdits('<h1>a</h1>', [
      {
        rangeLength: 1,
        rangeOffset: 4,
        text: 'b',
      },
    ])
  ).toEqual([
    {
      rangeLength: 1,
      rangeOffset: 4,
      text: 'b',
    },
  ])
})

test('replace element with text', () => {
  expect(
    minimizeEdits(`<h1>hello world</h1>`, [
      {
        rangeOffset: 0,
        rangeLength: 20,
        text: 'hello world',
      },
    ])
  ).toEqual([
    {
      rangeOffset: 0,
      rangeLength: 20,
      text: 'hello world',
    },
  ])
})

test('replace element with style', () => {
  expect(
    minimizeEdits(`<h1>hello world</h1>`, [
      {
        rangeOffset: 0,
        rangeLength: 20,
        text: `<style>

  p{
    color:red;
    padding: 0.5rem;

  border: 1px solid;
    transform: rotate(-10deg)

  }

  p:nth-child(even){
      transform: rotate(10deg)


  }
</style>`,
      },
    ])
  ).toEqual([
    {
      rangeOffset: 1,
      rangeLength: 19,
      text: `style>

  p{
    color:red;
    padding: 0.5rem;

  border: 1px solid;
    transform: rotate(-10deg)

  }

  p:nth-child(even){
      transform: rotate(10deg)


  }
</style>`,
    },
  ])
})
