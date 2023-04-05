const User = require('../message/user')

let messages = [
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

const addMessage = ({ content, user }) => {
  const addedMessage = {
    id: messages[messages.length - 1].id + 1,
    user: user || User.user,
    content: content
  }
  messages.push(addedMessage)
  return addedMessage
}

const getAllMessages = () => messages


module.exports = {
  addMessage,
  getAllMessages,
}
