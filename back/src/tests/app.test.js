const supertest = require('supertest')
const api = supertest(require('../app'))

test('GET nonexisting endpoint - response is 404', async () => {
  const fakeEndpoint = '/fooobarrr'
  const response = await api
    .get(fakeEndpoint)
    .expect(404)
    .expect('Content-Type', /application\/json/)
  expect(response.body.error).toBe('unknown endpoint')
})
