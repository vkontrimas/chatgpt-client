const app = require('./app')
const { PORT } = require('./config')

const sequelize = require('./db/sequelize')
const User = require('./db/user')

// TODO: remove this when we switch from in-memory
sequelize.sync()

const bcrypt = require('bcrypt')

const { PASSWORD_HASH_ROUNDS } = require('./config')

const createDevAccount = async () => {
  const user = await User.create({
    email: 'vk@example.com',
    passwordHash: await bcrypt.hash('sekret', PASSWORD_HASH_ROUNDS),
  })
  console.log(user)
}
createDevAccount()

app.listen(PORT, () => { console.log(`Server listening on ${PORT}`)})
