const uuid = require('uuid')
const { sequelize, RegistrationCode, RegistrationCodeUses } = require('db')

const { createUser } = require('./users')

const createRegistrationCode = async (data) => {
  if (typeof data.remainingUses !== 'number') { throw 'expected remaining registration uses' }
  if (data.remainingUses <= 0) { throw 'remaining registration uses lower than 1' }

  const id = uuid.v4()
  const model = await RegistrationCode.create({
    id,
    remainingUses: data.remainingUses,
    note: data.note,
  })
  return model
}

const createUserWithRegistrationCode = async ({ user, codeId }) => {
  if (!codeId) { throw 'missing registration code'}

  return await sequelize.transaction(async (transaction) => {
    const code = await RegistrationCode.findByPk(codeId, { transaction })
    if (!code) { throw 'invalid registration code' }
    if (code.remainingUses <= 0) { throw 'no registration code uses left' } 

    const userModel = await createUser(user, { transaction })
    if (!userModel) { throw 'registration code: failed to create user' }

    await code.decrement('remainingUses', { transaction })

    /*const use = await RegistrationCodeUses.create({
      UserId: user.id,
      RegistrationCodeId: code.id,
    }, { transaction })*/

    return [userModel, code.remainingUses]
  })
}

module.exports = {
  createRegistrationCode,
  createUserWithRegistrationCode
}
