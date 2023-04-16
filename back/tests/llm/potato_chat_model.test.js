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

  test('can access config', () => {
    const model = new PotatoChatModel({ deltaCount: 3, delayMs: 121 })
    expect(model.config).toMatchObject({ deltaCount: 3, delayMs: 121 })
  })
})
