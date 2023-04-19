const uuid = require('uuid')
const { idToBase64 } = require('../base64_id')
const { createUser, createSessionToken } = require('../users') 

const uniqueTestUser = () => {
  const name = `testUser_${idToBase64(uuid.v4())}`
  return {
    name,
    email: `${name}@example.com`,
    password: `${name}_password!`,
  }
} 

const createTestUser = async () => {
  const user = uniqueTestUser()
  const model = await createUser(user)
  return { email: user.email, password: user.password, user: model }
}

const loginTestUser = async () => {
  const user = uniqueTestUser()
  await createUser(user)
  const [token, model] = await createSessionToken(user)
  return [ `Bearer ${token}`, model ]
}

module.exports = {
  uniqueTestUser,
  createTestUser,
  loginTestUser,
}
