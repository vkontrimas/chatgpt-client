const uuid = require('uuid')
const { RegistrationCode } = require('db')

const createRegistrationCode = async ({ remainingUses }) => {
  if (typeof remainingUses !== 'number') { throw 'expected remaining registration uses' }
  if (remainingUses <= 0) { throw 'remaining registration uses lower than 1' }

  const id = uuid.v4()
  const model = await RegistrationCode.create({ id, remainingUses })
  return model
}

module.exports = {
  createRegistrationCode,
}
