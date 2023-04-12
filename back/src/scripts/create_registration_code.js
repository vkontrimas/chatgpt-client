const inquirer = require('inquirer')
const bcrypt = require('bcrypt')

const { RegistrationCode } = require('../db/db')
const { ENVIRONMENT } = require('../config')

const run = async () => {
  const { remainingUses } = await inquirer.prompt([
    {
      name: 'remainingUses',
      message: 'Maximum uses:',
      type: 'number',
      validate: (val) => {
        if (val <= 0) {
          return 'must be 1 or greater'
        }
        return true
      },
    },
  ])

  console.log(remainingUses)

  const code = await RegistrationCode.create({ remainingUses })
  if (!code) {
    throw 'failed to create code'
  }

  const urlPrefix = ENVIRONMENT === 'production' 
    ? 'https://chat.vkon.io/register' 
    : 'http://localhost:5173/register'

  console.log('\nCreated code: \n\n    ', `${urlPrefix}/${code.id}\n`)
}

run()
