const PotatoChatModel = require('./potato_chat_model')
const OpenAIChatModel = require('./openai_chat_model')

const selectChatModel = (name, config) => {
  switch (name) {
  case 'potato':
    return new PotatoChatModel(config)
  case 'openai':
    return new OpenAIChatModel(config)
  default:
    throw 'invalid chat model name'
  }
}

module.exports = {
  PotatoChatModel,
  OpenAIChatModel,
  selectChatModel,
}
