const { loginTestUser } = require('../helper')
const { listChats, ChatDriver } = require('../../chat')

test('listChats', async () => {
  const [_, user] = await loginTestUser()

  const chats = await Promise.all([
    ChatDriver.create(user.id, 'potato'),
    ChatDriver.create(user.id, 'potato'),
    ChatDriver.create(user.id, 'potato'),
    ChatDriver.create(user.id, 'potato'),
    ChatDriver.create(user.id, 'potato'),
    ChatDriver.create(user.id, 'potato'),
  ])
  const expected = chats.map(chat => chat.id)

  const results = await listChats(user.id)

  expect(results.map(chat => chat.id).sort()).toMatchObject(expected.sort())
})
