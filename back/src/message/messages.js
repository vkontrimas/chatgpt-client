const User = require('../message/user')
const { getCompletion } = require('../openai/openai')

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

const generateNextReply = async () => {
  const completion = await getCompletion(messages)
  const { role, content } = completion?.choices[0]?.message

  const assistantReply = {
    id: fakeId(),
    user: role,
    content,
  }
  messages.push(assistantReply)
  return assistantReply
}

const getAllMessages = () => messages

module.exports = {
  addMessage,
  getAllMessages,
  generateNextReply,
}
