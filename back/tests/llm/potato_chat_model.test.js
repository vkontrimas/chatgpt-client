const { PotatoChatModel } = require('../../llm')
const streamToArray = require('../../stream_to_array')

describe('Potato chat completion model 🥔', () => {
  test('if no messages given, throws', async () => {
    const model = new PotatoChatModel()
    await expect(model.getCompletionStream()).rejects.toMatch('no messages')
    await expect(model.getCompletionStream(null)).rejects.toMatch('no messages')
    await expect(model.getCompletionStream([])).rejects.toMatch('no messages')
  })

  test('if given messages, returns singular potato', async () => {
    const messages = [{ role: 'user', content: 'what is your favourite vegetable?' }]
    const model = new PotatoChatModel()
    const stream = await model.getCompletionStream(messages)
    const output = await streamToArray(stream)
    expect(output).toMatchObject([{ delta: 'potato' }])
  })

  test('if configged returns multiple potatoes', async () => {
    const messages = [{ role: 'user', content: 'what is your favourite vegetable?' }]
    const model = new PotatoChatModel({ deltaCount: 3 })
    const stream = await model.getCompletionStream(messages)
    const output = await streamToArray(stream)
    expect(output).toMatchObject(new Array(3).fill({ delta: 'potato' }))
  })

  test('if configged, throws on n-th delta', async () => {
    const messages = [{ role: 'user', content: 'what is your favourite vegetable?' }]
    const model = new PotatoChatModel({ deltaCount: 3, throwOn: 2, })
    const stream = await model.getCompletionStream(messages)
    let count = 0
    await expect(async () => {
      for await (const potato of stream) {
        ++count
      }
    }).rejects.toMatch('throw potato')
    expect(count).toBe(1)
  })

  test('if configged, throws immediately', async () => {
    const messages = [{ role: 'user', content: 'what is your favourite vegetable?' }]
    const model = new PotatoChatModel({ deltaCount: 3, throwImmediately: true, })
    await expect(model.getCompletionStream(messages)).rejects.toMatch('throw immediately')
  })

  test('can access config', () => {
    const model = new PotatoChatModel({ deltaCount: 3, delayMs: 121 })
    expect(model.config).toMatchObject({ deltaCount: 3, delayMs: 121 })
  })
})
