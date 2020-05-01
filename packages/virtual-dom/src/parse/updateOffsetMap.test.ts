import { updateOffsetMap } from './updateOffsetMap'

test('empty map, no edits', () => {
  expect(updateOffsetMap({}, [])).toEqual({})
})

test('empty map, single edit', () => {
  expect(
    updateOffsetMap({}, [
      {
        rangeOffset: 0,
        text: ' ',
        rangeLength: 0,
      },
    ])
  ).toEqual({})
})

test('update after second offset', () => {
  /*
   * Before:
   * <h1>hello world</h1>
   *
   * After:
   * <h1><p></p>hello world</h1>
   */
  expect(
    updateOffsetMap(
      {
        1: 0,
        4: 1,
      },
      [
        {
          rangeOffset: 4,
          text: '<p></p>',
          rangeLength: 0,
        },
      ]
    )
  ).toEqual({
    1: 0,
    11: 1,
  })
})

test('delete after second offset', () => {
  /*
   * Before:
   * <h1><p></p>hello world</h1>
   *
   * After:
   * <h1>hello world</h1>
   */
  expect(
    updateOffsetMap(
      {
        1: 0,
        5: 1,
        11: 2,
      },
      [
        {
          rangeOffset: 4,
          text: '',
          rangeLength: 7,
        },
      ]
    )
  ).toEqual({
    1: 0,
    4: 2,
  })
})

test('insert at start', () => {
  /*
   * Before:
   * <h1>hello world</h1>
   *
   * After:
   * <br><h1>hello world</h1>
   */
  expect(
    updateOffsetMap(
      {
        1: 0,
        4: 1,
      },
      [
        {
          text: '<br>',
          rangeLength: 0,
          rangeOffset: 0,
        },
      ]
    )
  ).toEqual({ 5: 0, 8: 1 })
})

test('delete at start', () => {
  /*
   * Before:
   * <br><h1>hello world</h1>
   *
   *
   * After:
   * <h1>hello world</h1>
   */
  expect(
    updateOffsetMap(
      {
        1: 0,
        5: 1,
        9: 2,
      },
      [
        {
          text: '',
          rangeLength: 4,
          rangeOffset: 0,
        },
      ]
    )
  ).toEqual({ 1: 1, 5: 2 })
})

test('multiple insertions', () => {
  /*
   * Before:
   * <h1>hello world</h1>
   *
   * After:
   * <br><h1><br>hello<br>world</h1>
   */
  expect(
    updateOffsetMap(
      {
        1: 0,
        4: 1,
      },
      [
        {
          rangeOffset: 0,
          text: '<br>',
          rangeLength: 0,
        },
        {
          rangeOffset: 4,
          text: '<br>',
          rangeLength: 0,
        },
        {
          rangeOffset: 10,
          text: '<br>',
          rangeLength: 0,
        },
      ]
    )
  ).toEqual({
    5: 0,
    12: 1,
  })
})

test('multiple deletions', () => {
  /*
   * Before:
   * <br><h1><br>hello <br>world</h1>
   *
   * After:
   * <h1>hello world</h1>
   */
  expect(
    updateOffsetMap(
      {
        1: 0,
        5: 1,
        9: 2,
        12: 3,
        19: 4,
        22: 5,
      },
      [
        {
          rangeOffset: 0,
          text: '',
          rangeLength: 4,
        },
        {
          rangeOffset: 8,
          text: '',
          rangeLength: 4,
        },
        {
          rangeOffset: 18,
          text: '',
          rangeLength: 4,
        },
      ]
    )
  ).toEqual({
    1: 1,
    4: 3,
    10: 5,
  })
})
