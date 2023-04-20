const uuid = require('uuid')
const {
  createRegistrationCode,
  createUserWithRegistrationCode,
  getRegistrationCode,
} = require('../registration')

const { User, RegistrationCode, RegistrationCodeUse } = require('db')

const { uniqueTestUser } = require('./helper')


describe('createRegistrationCode', () => {
  test('adds new code to db', async () => {
    const code = {
      remainingUses: 5
    }
    const model = await createRegistrationCode(code)
    const foundModel = await RegistrationCode.findByPk(model.id, { raw: true })
    expect(foundModel).toMatchObject(model.toJSON())
  })

  test('throws if remaining uses missing', async () => {
    const code = { }
    await expect(createRegistrationCode(code)).rejects.toMatch('expected remaining registration uses')
  })

  test('throws if remaining uses 0 or negative', async () => {
    const code = {
      remainingUses: -1
    }
    await expect(createRegistrationCode(code)).rejects.toMatch('remaining registration uses lower than 1')
  })

  test('saves note if given', async () => {
    const codeWith = await createRegistrationCode({ remainingUses: 1, note: 'test note!' })
    expect(codeWith.note).toBe('test note!')
    const codeWithFound = await RegistrationCode.findByPk(codeWith.id, { raw: true })
    expect(codeWithFound).toMatchObject(codeWith.toJSON())

    const codeWithout = await createRegistrationCode({ remainingUses: 1 })
    expect(codeWithout.note).toBeNull()
    const codeWithoutFound = await RegistrationCode.findByPk(codeWithout.id, { raw: true })
    expect(codeWithoutFound).toMatchObject(codeWithout.toJSON())
  })
})

describe('createUserWithRegistrationCode', () => {
  test('missing code throws', async () => {
    const user = uniqueTestUser()
    await expect(createUserWithRegistrationCode({ user }))
      .rejects.toMatch('missing registration code')
    await expect(createUserWithRegistrationCode({ user, codeId: null }))
      .rejects.toMatch('missing registration code')
    await expect(createUserWithRegistrationCode({ user, codeId: '' }))
      .rejects.toMatch('missing registration code')
  })

  test('missing user throws', async () => {
    const model = await createRegistrationCode({ remainingUses: 1 })
    await expect(createUserWithRegistrationCode({ codeId: model.id }))
      .rejects.toMatch('missing user')
    await expect(createUserWithRegistrationCode({ user: null, codeId: model.id }))
      .rejects.toMatch('missing user')
  })

  test('code with no uses left throws', async () => {
    const user = uniqueTestUser()
    const model = await RegistrationCode.create({ id: uuid.v4(), remainingUses: 0 })
    await expect(createUserWithRegistrationCode({ user, codeId: model.id }))
      .rejects.toMatch('no registration code uses left')
  })

  test('invalid code throws', async () => {
    const model = await createRegistrationCode({ remainingUses: 1 })
    const id = model.id
    await model.destroy()

    const user = uniqueTestUser()
    await expect(createUserWithRegistrationCode({ user, codeId: id }))
      .rejects.toMatch('invalid registration code')
  })

  test('sign up creates RegistrationCodeUse record', async () => {
    const user = uniqueTestUser()

    const { id } = await createRegistrationCode({ remainingUses: 1 })
    const [createdUser] = await createUserWithRegistrationCode({ codeId: id, user })

    const createdUse = await RegistrationCodeUse.findOne({
      where: {
        UserId: createdUser.id,
        RegistrationCodeId: id,
      },
      raw: true,
    })
    expect(createdUse).toBeDefined()
    expect(createdUse).not.toBeNull()
  })
})

describe('createUserWithRegistrationCode', () => {
  test('valid code creates correct user', async () => {
    const initialUses = 100
    const code = await createRegistrationCode({ remainingUses: initialUses })
    const user = uniqueTestUser()
    
    const [createdUser, usesLeft] = await createUserWithRegistrationCode({ codeId: code.id, user })
    expect(createdUser.toJSON()).toMatchObject({
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash: expect.stringMatching(/.+/),
    })

    expect(usesLeft).toBe(initialUses - 1)
  })

  test('valid code adds user to DB', async () => {
    const code = await createRegistrationCode({ remainingUses: 100 })
    const user = uniqueTestUser()
    
    const [createdUser, usesLeft] = await createUserWithRegistrationCode({ codeId: code.id, user })

    const foundUser = await User.findByPk(createdUser.id, { raw: true })
    expect(foundUser).toMatchObject(createdUser.toJSON())
  })

  test('code with two uses can be used twice ', async () => {
    const users = [ uniqueTestUser(), uniqueTestUser(), uniqueTestUser() ]

    const { id } = await createRegistrationCode({ remainingUses: 2 })
    const [alice] = await createUserWithRegistrationCode({ codeId: id, user: users[0], })
    const [bob] = await createUserWithRegistrationCode({ codeId: id, user: users[1], })
    await expect(createUserWithRegistrationCode({ codeId: id, user: users[2], }))
      .rejects.toMatch('no registration code uses left')

    const foundAlice = await User.findByPk(alice.id, { raw: true })
    expect(foundAlice).toMatchObject(alice.toJSON())
    const foundBob = await User.findByPk(bob.id, { raw: true })
    expect(foundBob).toMatchObject(bob.toJSON())
  })
})

describe('getRegistrationCode', () => {
  test('throws if no code', async () => {
    await expect(getRegistrationCode()).rejects.toMatch('missing registration code')
  })

  test('throws if code invalid', async () => {
    const code = await createRegistrationCode({ remainingUses: 1 })
    const id = code.id
    await code.destroy()
    await expect(getRegistrationCode(id)).rejects.toMatch('invalid registration code')
  })

  test('returns registration code', async () => {
    const expected = await createRegistrationCode({ remainingUses: 2, note: 'test' })
    const got = await getRegistrationCode(expected.id)
    expect(got.toJSON()).toMatchObject(expected.toJSON())
  })
})
