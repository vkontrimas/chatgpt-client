const uuid = require('uuid')
const { keyFromBase64, keyToBase64 } = require('../base64_key')

describe('base64', () => {
  test('key encodes and decodes back to original', () => {
    const id = 'a8bcdb64-5024-44f9-aca8-4286e2824f7b'
    const b64 = keyToBase64(id)
    const out = keyFromBase64(b64)
    expect(out).toBe(id)
  })

  test('throws if base64 id malformed', () => {
    expect(() => keyFromBase64('bhjkafgdsf23gfag.gsdgas'))
      .toThrow('invalid base64 id')
    expect(() => keyFromBase64('MWFmMThiNTItY2Z'))
      .toThrow('invalid base64 id')
  })

  test('throws if key malformed', () => {
    expect(() => keyToBase64('000sadf-015124lgas'))
      .toThrow('invalid key')
    expect(() => keyToBase64('39bab72c-baf9-4606b8119c38657539'))
      .toThrow('invalid key')
  })
})
