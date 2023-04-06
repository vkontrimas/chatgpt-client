const { addMessage, getAllMessages } = require('../../message/messages')

const MESSAGE_ENDPOINT = '/api/message'

// TODO: deep freeze
const initialMessages = getAllMessages()

const getStoredMessages = () => {
  return getAllMessages().map((message, i) => ({
    ...message,
    id: i,
  }))
}

module.exports = {
  MESSAGE_ENDPOINT,
  initialMessages,
  getStoredMessages,
}
