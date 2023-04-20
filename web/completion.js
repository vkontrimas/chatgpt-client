const parseJSON = {
  start() {},

  async transform(line, controller) {
    let start = 0
    let end = 0
    while (end !== line.length) {
      const index = line.indexOf('}{', start)
      end = index === -1 ? line.length : index + 1
      controller.enqueue(
        JSON.parse(
          line.substring(start, end)
        )
      )
      start = end
    }
  },

  flush() {},
}

const completeMessage = async (bearer, chatId, addMessage, updateMessage) => {
  let messageId = null
  const addInitialMessage = {
    start() {},
    flush() {},

    async transform(delta, controller) {
      if (delta.status === 'pending') {
        messageId = delta.id
        addMessage({
          content: '',
          role: 'assistant',
          ...delta,
        })
      }
      else {
        controller.enqueue(delta)
      }
    }
  }

  const delayMs = 12
  let content = ''
  const typeMessage = {
    start() { },

    async write(delta, controller) {
      if (delta.status === 'done') {
        updateMessage({ id: messageId, status: "done" })
      }
      else if (delta.status === 'completing') {
        for (const char of delta.delta) {
          content += char
          updateMessage({ id: messageId, content })
          // delay for typing effect
          await new Promise(res => setTimeout(res, delayMs))
        }
      }
    }
  }

  const response = await fetch(`/api/chat/${chatId}/complete`, {
    method: 'POST',
    headers: {
      'Authorization': bearer,
    },
  })

  const stream = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TransformStream(parseJSON))
    .pipeThrough(new TransformStream(addInitialMessage))
    .pipeTo(new WritableStream(typeMessage))
}

export default completeMessage
