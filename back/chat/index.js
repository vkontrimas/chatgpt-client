const { Chat } = require('../models')
const ChatDriver = require('./chat_driver')

const listChats = async (userId) => {
  return await Chat.findAll({
    where: {
      UserId: userId,
    },
    attributes: [ 'id', 'title' ],
    raw: true,
  })
}

module.exports = { ChatDriver, listChats }
