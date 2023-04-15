const streamToArray = require('../stream_to_array')
const { Readable } = require('stream')

class TestStream extends Readable {
  constructor(itemsToRead) {
    super({ objectMode: true })
    this.itemsToRead = itemsToRead
  }

  _read() {
    const item = this.itemsToRead.shift()
    this.push(item)
    if (this.itemsToRead.length === 0) {
      this.push(null)
    }
  }
}

describe('streamToArray', () => {
  test('empty stream gives empty array', async () => {
    const stream = new TestStream([])
    const arr = await streamToArray(stream)
    expect(arr).toMatchObject([])
  })

  test('stream with items gives matching array', async () => {
    const getExpected = () => ([
      'this is a string',
      {
        number: 19,
        note: 'complex object',
        obj: {
          notes: ['foo', 'bar'],
        },
      },
      10,
      11,
      15,
    ])
    const stream = new TestStream(getExpected())
    const arr = await streamToArray(stream)
    expect(arr).toMatchObject(getExpected())
  })
})
