const uuid = require('uuid')
const { sequelize, RegistrationCode, RegistrationCodeUse } = require('./models')

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

    const use = await RegistrationCodeUse.create({
      UserId: userModel.id,
      RegistrationCodeId: code.id,
    }, { transaction })

    return [userModel, code.remainingUses]
  })
}

const getRegistrationCode = async (id) => {
  if (!id) { throw 'missing registration code' }

  const code = await RegistrationCode.findByPk(id)
  if (!code) { throw 'invalid registration code' }

  return code
}

module.exports = {
  createRegistrationCode,
  createUserWithRegistrationCode,
  getRegistrationCode,
}
