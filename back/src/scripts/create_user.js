const inquirer = require('inquirer')
const bcrypt = require('bcrypt')

const { User } = require('../db/db')
const { PASSWORD_HASH_ROUNDS } = require('../config')

const run = async () => {
  const { name, email, password } = await inquirer.prompt([
    {
      name: 'name',
      message: 'Name:',
    },
    {
      name: 'email',
      validate: (input) => {
        if (!/.+@.+\..+/.test(input)) {
          return "doesn't look like a valid email"
        }
        return true
      },
      message: 'Email address:',
    },
    {
      name: 'password',
      type: 'password',
      message: 'Password:',
    }
  ])

  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS)

  try {
    const user = await User.create({ name, email, passwordHash, })
    console.log('Created user!')
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('email in use')
    } else {
      throw error
    }
  }
}

run()
