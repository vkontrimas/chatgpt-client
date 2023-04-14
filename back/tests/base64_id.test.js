const uuid = require('uuid')
const { idFromBase64, idToBase64 } = require('../base64_id')

describe('base64', () => {
  test('key encodes and decodes back to original', () => {
    const id = 'a8bcdb64-5024-44f9-aca8-4286e2824f7b'
    const b64 = idToBase64(id)
    const out = idFromBase64(b64)
    expect(out).toBe(id)
  })

  test('throws if base64 id malformed', () => {
    expect(() => idFromBase64('bhjkafgdsf23gfag.gsdgas'))
      .toThrow('invalid base64 id')
    expect(() => idFromBase64('MWFmMThiNTItY2Z'))
      .toThrow('invalid base64 id')
  })

  test('throws if key malformed', () => {
    expect(() => idToBase64('000sadf-015124lgas'))
      .toThrow('invalid id')
    expect(() => idToBase64('39bab72c-baf9-4606b8119c38657539'))
      .toThrow('invalid id')
  })
})
