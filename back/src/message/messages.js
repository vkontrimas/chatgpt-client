const User = require('../message/user')

const initialMessages = () => [
  {
    id: 0,
    user: User.user,
    content: 'Hello!',
  },
  {
    id: 1,
    user: User.assistant,
    content: 'Hi! How can I assist you today?',
  },
]

let messages = initialMessages()
const fakeId = () => messages[messages.length - 1].id + 1

const addMessage = ({ content, user }) => {
  const addedMessage = {
    id: fakeId(),
    user: user || User.user,
    content: content
  }
  messages.push(addedMessage)
  return addedMessage
}

const generateNextReply = () => {
  const reply = {
    id: fakeId(),
    user: User.assistant,
    content: 'waaaaazaaaaaaaaaaaaaaaaaaaaaaaaap',
  }
  messages.push(reply)
  return reply
}

const getAllMessages = () => messages

module.exports = {
  addMessage,
  getAllMessages,
  generateNextReply,
}
