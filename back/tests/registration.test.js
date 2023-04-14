const uuid = require('uuid')
const {
  createRegistrationCode,
  createUserWithRegistrationCode,
} = require('../registration')

const { User, RegistrationCode } = require('db')

const { initializeDB } = require('./db_helper')

beforeEach(async () => {
  await initializeDB()
})

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

describe('createUserWithRegistrationCode', () => {
  let usersBefore = []
  let usesBefore = []

  beforeEach(async () => {
    const [users, uses] = await Promise.all([
      User.findAll({ raw: true }),
      // RegistrationCodeUse.findAll({ raw: true })
    ])
    usersBefore = users
    // usesBefore = uses
  })

  afterEach(async () => {
    const [usersAfter, usesAfter] = await Promise.all([
      User.findAll({ raw: true }),
      // RegistrationCodeUse.findAll({ raw: true }),
    ])
    expect(usersAfter).toMatchObject(usersBefore)
    // expect(usesAfter).toMatchObject(usesBefore)
  })

  test('missing code throws', async () => {
    const user = {
      name: 'Jim',
      email: 'jim@example.com',
      password: 'lol',
    }
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
    const user = {
      name: 'Jim',
      email: 'jim@example.com',
      password: 'lol',
    }
    const model = await RegistrationCode.create({ id: uuid.v4(), remainingUses: 0 })
    await expect(createUserWithRegistrationCode({ user, codeId: model.id }))
      .rejects.toMatch('no registration code uses left')
  })

  test('invalid code throws', async () => {
    const model = await createRegistrationCode({ remainingUses: 1 })
    const id = model.id
    await model.destroy()

    const user = {
      name: 'Jim',
      email: 'jim@example.com',
      password: 'lol',
    }
    await expect(createUserWithRegistrationCode({ user, codeId: id }))
      .rejects.toMatch('invalid registration code')
  })
})

describe('createUserWithRegistrationCode', () => {
  test('valid code creates correct user', async () => {
    const initialUses = 100
    const code = await createRegistrationCode({ remainingUses: initialUses })
    const user = {
      name: 'Jim',
      email: 'jim@example.com',
      password: 'lol',
    }
    
    const [createdUser, usesLeft] = await createUserWithRegistrationCode({ codeId: code.id, user })
    expect(createdUser.toJSON()).toMatchObject({
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
      name: user.name,
      email: user.email,
      passwordHash: expect.stringMatching(/.+/),
    })

    expect(usesLeft).toBe(initialUses - 1)
  })

  test('valid code adds user to DB', async () => {
    const usersBefore = await User.findAll({ raw: true })

    const code = await createRegistrationCode({ remainingUses: 100 })
    const user = {
      name: 'Jim',
      email: 'jim@example.com',
      password: 'lol',
    }
    
    const [createdUser, usesLeft] = await createUserWithRegistrationCode({ codeId: code.id, user })
    const usersAfter = await User.findAll({ raw: true })

    expect(usersAfter.length).toBe(usersBefore.length + 1)
    expect(usersAfter).toContainEqual(createdUser.toJSON())
  })

  test('code with two uses can be used twice ', async () => {
    const users = [
      {
        name: 'Alice',
        email: 'alice12512@example.com',
        password: 'a',
      },
      {
        name: 'Bob',
        email: 'bob2352345@example.com',
        password: 'b',
      },
      {
        name: 'Charlie',
        email: 'charlie523521@example.com',
        password: 'c',
      },
    ]

    const usersBefore = await User.findAll({ raw: true })
    const { id } = await createRegistrationCode({ remainingUses: 2 })
    const [alice] = await createUserWithRegistrationCode({ codeId: id, user: users[0], })
    const [bob] = await createUserWithRegistrationCode({ codeId: id, user: users[1], })
    await expect(createUserWithRegistrationCode({ codeId: id, user: users[2], }))
      .rejects.toMatch('no registration code uses left')
    const usersAfter = await User.findAll({ raw: true })

    expect(usersAfter.length).toBe(usersBefore.length + 2)
    expect(usersAfter).toContainEqual(alice.toJSON())
    expect(usersAfter).toContainEqual(bob.toJSON())
  })

  /*
  test('sign up creates RegistrationCodeUse record', async () => {
    const user = {
      name: 'Jim',
      email: 'jim@example.com',
      password: 'lol',
    }

    const { id } = await createRegistrationCode({ remainingUses: 1 })
    const usesBefore = await RegistrationCodeUse.findAll({ raw: true })
    const [createdUser] = await createUserWithRegistrationCode({ codeId: id, user })
    const usesAfter = await RegistrationCodeUse.findAll({ raw: true })

    const createdUse = await RegistrationCodeUse.findOne({
      where: {
        UserId: createdUser.id,
        RegistrationCodeId: id,
      },
      raw: true,
    })
    expect(createdUse).toBeDefined()
    expect(createdUse).not.toBeNull()
    expect(usesAfter.length).toBe(usesBefore.length + 1)
  })
  */
})
