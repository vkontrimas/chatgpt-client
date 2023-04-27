const inquirer = require('inquirer')

const { sequelize } = require('../models')
const { ENVIRONMENT } = require('../config')
const { idToBase64 } = require('../base64_id')
const { createRegistrationCode } = require('../registration')

const run = async () => {
  const { remainingUses, note } = await inquirer.prompt([
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
    {
      name: 'note',
      message: 'Note:',
      type: 'input',
    },
  ])

  console.log(remainingUses)

  const code = await createRegistrationCode({ 
    remainingUses,
    note: note ? note : undefined,
  })
  if (!code) {
    throw 'failed to create code'
  }

  const url = () => {
    const b64id = idToBase64(code.id)
    if (ENVIRONMENT === 'production') {
      return `https://chat.vkon.io/register/${b64id}` 
    }
    else {
      return `http://localhost:5173/register/${b64id}\n  OR\n     http://localhost:3000/register/${b64id}`
    }
  }

  console.log('\nCreated code: \n\n    ', `${url()}\n`)

  await sequelize.close()
}

run()
