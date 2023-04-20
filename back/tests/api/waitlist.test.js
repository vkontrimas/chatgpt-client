const supertest = require('supertest')
const api = supertest(require('../../app'))

const { uniqueTestUser } = require('../helper')

const { WAITLIST_SIGNUP_WEBHOOK } = require('../../config')

const webhookHandler = jest.fn((request) => {})

let webhookServer = null
beforeAll(() => {
  webhookServer = require('../../fake_webhook_server')(webhookHandler)
})
afterAll(() => {
  webhookServer.close()
})

beforeEach(() => {
  webhookHandler.mockRestore()
})

describe('POST /api/waitlist', () => {
  test('400 - no name', async () => {
    const user = uniqueTestUser()
    const response = await api
      .post('/api/waitlist')
      .send({ email: user.email })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(webhookHandler).not.toHaveBeenCalled()
    expect(response.body).toMatchObject({ error: 'no name' })
  })

  test('400 - no email', async () => {
    const user = uniqueTestUser()
    const response = await api
      .post('/api/waitlist')
      .send({ name: user.firstName })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(webhookHandler).not.toHaveBeenCalled()
    expect(response.body).toMatchObject({ error: 'no email' })
  })

  test('400 - malformed emails', async () => {
    const emails = [
      'test',
      'foo@',
      'fo@t',
      'foo@bar.'
    ]

    for (const email of emails) {
      const response = await api
        .post('/api/waitlist')
        .send({ name: 'Dave', email })
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(webhookHandler).not.toHaveBeenCalled()
      expect(response.body).toMatchObject({ error: 'invalid email' })
    }
  })

  test('200 - forwards request to webhook', async () => {
    const user = uniqueTestUser()

    const response = await api
      .post('/api/waitlist')
      .send({ name: user.firstName, email: user.email })
      .expect(200)

    expect(webhookHandler).toHaveBeenCalledTimes(1)

    const [ webhookRequest ] = webhookHandler.mock.calls[0]
    expect(webhookRequest.body).toMatchObject({
      name: user.firstName,
      email: user.email,
    })
  })

  test('504 - if webhook request returns non 200 code', async () => {
    const user = uniqueTestUser()

    webhookHandler.mockImplementation(() => 404)

    const response = await api
      .post('/api/waitlist')
      .send({ name: user.firstName, email: user.email })
      .expect(504)

    expect(webhookHandler).toHaveBeenCalledTimes(1)
  })
})
