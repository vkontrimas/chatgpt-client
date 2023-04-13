const bcrypt = require('bcrypt')
const uuid = require('uuid')

const { sequelize, User, Message, RegistrationCode } = require('db')

const MessageType = require('../chat/message_type.js')
const { PASSWORD_HASH_ROUNDS } = require('../config')

const modelUser = () => ({
  name: 'Eve',
  email: 'eve@example.com',
  password: 'topsekret',
})

const initialUsers = [
  {
    name: 'Bob',
    email: 'bob@example.com',
    password: 'sekret',

    messages: [
      {
        content: 'Hello',
        type: MessageType.USER,
      },
      {
        content: 'hi! how can I help?',
        type: MessageType.ASSISTANT,
      },
      {
        content: 'bye!',
        type: MessageType.USER,
      },
    ],
  },
  {
    name: 'Alice',
    email: 'alice@example.com',
    password: 'password123',

    messages: [
      {
        content: 'Wazaaaaap',
        type: MessageType.USER,
      },
      {
        content: 'Waaaaaaazaaaaaaaaaaaap',
        type: MessageType.ASSISTANT,
      },
      {
        content: 'Waaaaaaaaaaaaaaaaaazaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaap',
        type: MessageType.USER,
      },
      {
        content: 'Waaaaaaazaaaaaaaaaaaap',
        type: MessageType.ASSISTANT,
      },
      {
        content: ':(',
        type: MessageType.USER,
      },
    ],
  },
]

const fetchAllUsers = async () => {
  return await User.findAll()
}

const fetchUserMessages = async (id) => {
  const user = await User.findByPk(id)
  return user.getMessages()
}

const initializeDB = async () => {
  await sequelize.sync()
  await sequelize.truncate({
    cascade: true,
  })

  for (const user of initialUsers) {
    const newUser = await User.create({
      id: uuid.v4(),
      name: user.name,
      email: user.email,
      passwordHash: await bcrypt.hash(user.password, PASSWORD_HASH_ROUNDS),
    })
    user.id = newUser.id

    /*
    for (const message of user.messages) {
      const newMessage = await Message.create({
        ...message,
        UserId: user.id,
      })
      message.id = newMessage.id
    }
    */
  }
}

module.exports = {
  modelUser,
  initialUsers,
  fetchAllUsers,
  initializeDB,
  fetchUserMessages,
}
