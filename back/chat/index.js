const { Chat } = require('db')
const ChatDriver = require('./chat_driver')

const listChats = async (userId) => {
  return await Chat.findAll({
    where: {
      UserId: userId,
    },
    attributes: [ 'id' ],
    raw: true,
  })
}

module.exports = { ChatDriver, listChats }
