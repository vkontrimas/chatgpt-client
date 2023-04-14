const uuid = require('uuid')
const base64 = require('../base64')

describe('base64', () => {
  test('encodes and decodes back to original', () => {
    const id = 'a8bcdb64-5024-44f9-aca8-4286e2824f7b'
    const b64 = base64.fromUUID(id)
    const out = base64.toUUID(b64)
    expect(out).toBe(id)
  })
})
