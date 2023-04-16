const uuid = require('uuid')
const { idToBase64 } = require('../base64_id')
const { createUser, createSessionToken } = require('../users') 

const uniqueUser = () => {
  const name = `testUser_${idToBase64(uuid.v4())}`
  return {
    name,
    email: `${name}@example.com`,
    password: name,
  }
} 

const loginTestUser = async () => {
  const user = uniqueUser()
  await createUser(user)
  const [token, model] = await createSessionToken(user)
  return [ `Bearer ${token}`, model ]
}

module.exports = {
  uniqueUser,
  loginTestUser,
}
