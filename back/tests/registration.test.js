const {
  createRegistrationCode,
} = require('../registration')

const { RegistrationCode } = require('db')

describe('createRegistrationCode', () => {
  test('adds new code to db', async () => {
    const codesBefore = await RegistrationCode.findAll({ raw: true })

    const code = {
      remainingUses: 5
    }
    const model = await createRegistrationCode(code)
    const codesAfter = await RegistrationCode.findAll({ raw: true })

    expect(codesAfter.length).toBe(codesBefore.length + 1)
    expect(codesAfter).toContainEqual(model.toJSON())
  })

  test('throws if remaining uses missing', async () => {
    const codesBefore = await RegistrationCode.findAll({ raw: true })

    const code = { }
    await expect(createRegistrationCode(code)).rejects.toMatch('expected remaining registration uses')

    const codesAfter = await RegistrationCode.findAll({ raw: true })
    expect(codesAfter).toMatchObject(codesBefore)
  })

  test('throws if remaining uses 0 or negative', async () => {
    const codesBefore = await RegistrationCode.findAll({ raw: true })

    const code = {
      remainingUses: -1
    }
    await expect(createRegistrationCode(code)).rejects.toMatch('remaining registration uses lower than 1')

    const codesAfter = await RegistrationCode.findAll({ raw: true })
    expect(codesAfter).toMatchObject(codesBefore)
  })
})
