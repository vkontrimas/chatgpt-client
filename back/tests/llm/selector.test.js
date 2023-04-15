const { 
  selectChatModel,
  PotatoChatModel,
  OpenAIChatModel,
} = require('../../llm')
const streamToArray = require('../../stream_to_array')

describe('selectChatModel', () => {
  test('"potato" returns PotatoChatModel', () => {
    const model = selectChatModel('potato')
    expect(model instanceof PotatoChatModel).toBe(true)
  })

  test('"potato" model gets configured', async () => {
    const deltaCount = 4
    const model = selectChatModel('potato', { deltaCount })

    const input = [{ role: 'user', content: 'Hello!' }]
    const expected = new Array(deltaCount).fill({ delta: 'potato' })
    const result = await streamToArray(await model.getCompletionStream(input))
    expect(result).toMatchObject(expected)
  })

  test('"openai" returns OpenAIChatModel', () => {
    const model = selectChatModel('openai')
    expect(model instanceof OpenAIChatModel).toBe(true)
  })

  test('invalid string throws', () => {
    expect(() => { selectChatModel('thismodeldefinitelydoesnotexist') })
      .toThrow('invalid chat model name')
  })
})
