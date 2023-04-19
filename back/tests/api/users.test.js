const supertest = require('supertest')
const api = supertest(require('../../app'))

const { idToBase64 } = require('../../base64_id')

const { loginTestUser } = require('../helper')

const ENDPOINT = '/api/users'

describe(`GET /api/users/:userId`, () => {
  test('404 - invalid id', async () => {
    const [bearer, user] = await loginTestUser()
    await user.destroy()

    const response = await api
      .get(`${ENDPOINT}/${idToBase64(user.id)}`)
      .set('Authorization', bearer)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'invalid user id' })
  })

  test('401 - invalid token', async () => {
    const [bearer, user] = await loginTestUser()

    const response = await api
      .get(`${ENDPOINT}/${idToBase64(user.id)}`)
      .set('Authorization', 'Bearer faketoken')
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'unauthorized' })
  })

  test('401 - other user\'s token', async () => {
    const [aliceBearer, alice] = await loginTestUser()
    const [eveBearer, eve] = await loginTestUser()

    const response = await api
      .get(`${ENDPOINT}/${idToBase64(alice.id)}`)
      .set('Authorization', eveBearer)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'unauthorized' })
  })

  test('400 - missing token', async () => {
    const [bearer, user] = await loginTestUser()

    const response = await api
      .get(`${ENDPOINT}/${idToBase64(user.id)}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({ error: 'missing bearer token' })
  })

  test('200 - valid id and token', async () => {
    const [bearer, user] = await loginTestUser()

    const response = await api
      .get(`${ENDPOINT}/${idToBase64(user.id)}`)
      .set('Authorization', bearer)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toMatchObject({
      id: idToBase64(user.id),
      name: user.name,
    })
  })
})
