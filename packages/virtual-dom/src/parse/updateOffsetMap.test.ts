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
        0: 0 /* h1 */,
        4: 1 /* hello world */,
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
    0: 0 /* h1 */,
    11: 1 /* hello world */,
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
        0: 0 /* h1 */,
        5: 1 /* p */,
        11: 2 /* hello world */,
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
    0: 0 /* h1 */,
    4: 2 /* hello world */,
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
        0: 0 /* h1 */,
        4: 1 /* hello world */,
      },
      [
        {
          text: '<br>',
          rangeLength: 0,
          rangeOffset: 0,
        },
      ]
    )
  ).toEqual({
    4: 0 /* h1 */,
    8: 1 /* hello world */,
  })
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
        0: 0 /* br */,
        4: 1 /* h1 */,
        8: 2 /* hello world */,
      },
      [
        {
          text: '',
          rangeLength: 4,
          rangeOffset: 0,
        },
      ]
    )
  ).toEqual({
    0: 1 /* h1 */,
    4: 2 /* hello world */,
  })
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
        0: 0 /* h1 */,
        4: 1 /* hello world */,
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
    4: 0 /* h1 */,
    12: 1 /* hello world */,
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
        0: 1 /* br */,
        4: 2 /* h1 */,
        8: 3 /* br */,
        12: 4 /* hello  */,
        18: 5 /* br */,
        22: 6 /* world */,
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
    0: 2 /* h1 */,
    4: 4 /* hello */,
    10: 6 /* world */,
  })
})

test('move down', () => {
  /**
   * Before:
   * <section>
   *   <h1>hello world</h1>
   * </section>
   *
   *
   * After:
   * <section>
   * </section>
   * <h1>hello world</h1>
   *
   */
  expect(
    updateOffsetMap(
      {
        0: 1 /* section */,
        9: 2 /* \n   */,
        12: 3 /* h1 */,
        16: 4 /* hello world */,
        32: 5 /* \n */,
        43: 6 /* \n */,
      },
      [
        {
          rangeOffset: 10,
          rangeLength: 2,
          text: '</section>\n',
        },
        {
          rangeOffset: 32,
          rangeLength: 11,
          text: '',
        },
      ]
    )
  ).toEqual({
    0: 1 /* section */,
    9: 2 /* \n */,
    21: 3 /* h1 */,
    25: 4 /* hello world */,
    41: 6 /* \n */,
  })
})

test('move up', () => {
  /**
   * Before:
   * <section>
   * </section>
   * <h1>hello world</h1>
   *
   *
   * After:
   * <section>
   *   <h1>hello world</h1>
   * </section>
   *
   */
  expect(
    updateOffsetMap(
      {
        0: 1 /* section */,
        9: 2 /* \n */,
        20: 3 /* \n */,
        21: 4 /* h1 */,
        25: 5 /* hello world */,
        41: 6 /* \n */,
      },
      [
        {
          rangeOffset: 10,
          rangeLength: 11,
          text: '',
        },
        {
          rangeOffset: 21,
          rangeLength: 0,
          text: '  ',
        },
        {
          rangeOffset: 41,
          rangeLength: 0,
          text: '\n</section>',
        },
      ]
    )
  ).toEqual({
    0: 1 /* section */,
    9: 2 /* \n   */,
    12: 4 /* h1 */,
    16: 5 /* hello world */,
    43: 6 /* \n */,
  })
})

test('weird edits', () => {
  /**
   * Before:
   * <h1>hello world</h1>
   *
   * After:
   * hello world
   */
  expect(
    updateOffsetMap(
      {
        0: 1 /* h1 */,
        4: 2 /* hello world */,
      },
      [
        {
          rangeOffset: 15,
          rangeLength: 5,
          text: '',
        },
        {
          rangeOffset: 2,
          rangeLength: 3,
          text: '',
        },
        {
          rangeOffset: 0,
          rangeLength: 1,
          text: '',
        },
      ]
    )
  ).toEqual({})
})
